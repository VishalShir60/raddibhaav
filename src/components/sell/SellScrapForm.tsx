'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { createListingSchema, CreateListingInput } from '@/lib/validations/scrap';
import { compressImage, CompressionResult } from '@/lib/utils/image-compression';
import { INITIAL_CATEGORIES, MockStore } from '@/lib/data/mock-store';
import { 
  Camera, 
  Trash2, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  Loader2, 
  Navigation, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Scale
} from 'lucide-react';
import { batchModerateListingPhotos } from '@/lib/media/image-moderation';
import { detectSellerCancellationAbuse } from '@/lib/security/abuse-prevention';
import { OptimizedImage } from '@/components/common/OptimizedImage';

function generateListingId(): string {
  return `listing-${Math.random().toString(36).substring(2, 9)}`;
}

function generateItemId(idx: number): string {
  return `item-${idx}-${Math.random().toString(36).substring(2, 9)}`;
}

function calculateExpiryIso(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

// Popular hyperlocal area presets for one-tap convenience
const POPULAR_AREAS = [
  { name: 'Dadar West, Mumbai', lat: 19.0213, lng: 72.8424, pincode: '400028', city: 'Mumbai' },
  { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295, pincode: '400050', city: 'Mumbai' },
  { name: 'College Road, Nashik', lat: 19.9975, lng: 73.7898, pincode: '422005', city: 'Nashik' },
  { name: 'Nashik Road, Nashik', lat: 19.9538, lng: 73.8347, pincode: '422101', city: 'Nashik' },
  { name: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077, pincode: '411038', city: 'Pune' },
];

export function SellScrapForm() {
  const t = useTranslations('sell');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 4-step wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [compressing, setCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: 'Household Monthly Scrap Clearance',
      address: '',
      city: 'Nashik',
      pincode: '422005',
      latitude: 19.9975,
      longitude: 73.7898,
      preferred_time_slot: 'Morning',
      bid_window_hours: '6',
      photos: [],
      items: [
        { category_slug: 'newspaper', approx_weight_kg: 15 },
        { category_slug: 'cardboard', approx_weight_kg: 8 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedAddress = watch('address');
  const watchedCity = watch('city');
  const watchedSlot = watch('preferred_time_slot');
  const watchedBidWindow = watch('bid_window_hours');

  // Live estimate calculation from rate card benchmark prices
  const liveEstimate = useMemo(() => {
    let minTotal = 0;
    let maxTotal = 0;
    let totalWeight = 0;
    const items = watchedItems ?? [];

    items.forEach((item) => {
      const weight = Number(item.approx_weight_kg) || 0;
      totalWeight += weight;
      const cat = INITIAL_CATEGORIES.find((c) => c.slug === item.category_slug);
      if (cat) {
        minTotal += weight * cat.benchmark_price_min;
        maxTotal += weight * cat.benchmark_price_max;
      } else {
        minTotal += weight * 12;
        maxTotal += weight * 16;
      }
    });

    return {
      min: Math.round(minTotal),
      max: Math.round(maxTotal),
      totalWeight: Math.round(totalWeight * 10) / 10,
    };
  }, [watchedItems]);

  // Handle prefill from calculator if URL query param exists
  useEffect(() => {
    const prefill = searchParams.get('prefill');
    if (prefill) {
      try {
        const pairs = prefill.split(',');
        const newItems: { category_slug: string; approx_weight_kg: number }[] = [];
        pairs.forEach((pair) => {
          const [slug, weightStr] = pair.split(':');
          const weight = parseFloat(weightStr);
          if (slug && !isNaN(weight) && weight > 0) {
            newItems.push({ category_slug: slug, approx_weight_kg: weight });
          }
        });
        if (newItems.length > 0) {
          setValue('items', newItems);
        }
      } catch (err) {
        console.error('Error parsing prefill params', err);
      }
    }
  }, [searchParams, setValue]);

  // Client-side image handling & canvas compression (<300 KB, max 6 photos)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photoPreviews.length >= 6) {
      setFormError('Maximum 6 photos allowed. Please remove an existing photo first.');
      return;
    }

    setCompressing(true);
    setFormError(null);

    const newStats: CompressionResult[] = [];
    const newUrls: string[] = [];

    try {
      // Remaining quota up to 6
      const remainingQuota = 6 - photoPreviews.length;
      const filesToProcess = Array.from(files).slice(0, remainingQuota);

      for (const file of filesToProcess) {
        // Compressing client-side to ensure file is under 300 KB for budget Android 4G
        const result = await compressImage(file, 1280, 0.78);
        newStats.push(result);
        newUrls.push(result.dataUrl);
      }

      setCompressionStats((prev) => [...prev, ...newStats]);
      setPhotoPreviews((prev) => {
        const combined = [...prev, ...newUrls].slice(0, 6);
        setValue('photos', combined);
        return combined;
      });
    } catch (err) {
      console.error('Compression error', err);
      setFormError('Failed to compress image. Please try another photo.');
    } finally {
      setCompressing(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setValue('photos', updated);
      return updated;
    });
    setCompressionStats((prev) => prev.filter((_, i) => i !== index));
  };

  // Add weight step helper (+5kg, +10kg, +25kg)
  const addWeightStep = (index: number, addKg: number) => {
    const current = Number(watchedItems[index]?.approx_weight_kg) || 0;
    setValue(`items.${index}.approx_weight_kg`, current + addKg);
  };

  // GPS Location Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setValue('latitude', lat);
        setValue('longitude', lng);
        setValue('address', 'Near City Center, College Road');
        setValue('city', 'Nashik');
        setValue('pincode', '422005');
        setGpsLoading(false);
      },
      (error) => {
        console.warn('GPS error fallback', error);
        setValue('latitude', 19.9975);
        setValue('longitude', 73.7898);
        setValue('address', 'College Road, Nashik');
        setValue('city', 'Nashik');
        setValue('pincode', '422005');
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectAreaPreset = (area: typeof POPULAR_AREAS[0]) => {
    setValue('address', area.name);
    setValue('city', area.city);
    setValue('pincode', area.pincode);
    setValue('latitude', area.lat);
    setValue('longitude', area.lng);
  };

  // Step navigation validations
  const handleNextStep = async () => {
    setFormError(null);
    if (currentStep === 1) {
      const valid = await trigger('items');
      if (!valid) return;
      if (watchedItems.length === 0) {
        setFormError('Please add at least one scrap item.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (photoPreviews.length === 0) {
        setFormError('At least 1 photo of your scrap is required for dealers to inspect and submit bids.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const valid = await trigger(['address', 'city', 'pincode']);
      if (!valid) return;
      setCurrentStep(4);
    }
  };

  const onSubmit = async (data: CreateListingInput) => {
    setSubmitting(true);
    setFormError(null);

    try {
      // 1. Mandatory Photo Requirement
      if (!data.photos || data.photos.length === 0) {
        setFormError('At least 1 photo of your scrap is required for dealer bidding.');
        setSubmitting(false);
        setCurrentStep(2);
        return;
      }

      // 2. Automated Image Moderation Hook (Stub/Vision AI check)
      const moderation = await batchModerateListingPhotos(data.photos);
      if (!moderation.allApproved) {
        setFormError(moderation.failedReason || 'Uploaded photo failed content safety review.');
        setSubmitting(false);
        setCurrentStep(2);
        return;
      }

      // 3. Abuse Prevention: Check Seller Cancellation History
      const existingListings = MockStore.getListings();
      const abuseCheck = detectSellerCancellationAbuse(existingListings);
      if (abuseCheck.action === 'block_new_listings') {
        setFormError(abuseCheck.message || 'Your account is temporarily restricted from posting new listings.');
        setSubmitting(false);
        return;
      }

      const totalWeight = data.items.reduce((sum, item) => sum + item.approx_weight_kg, 0);
      const hours = parseInt(data.bid_window_hours, 10);
      const expiresAt = calculateExpiryIso(hours);
      const listingId = generateListingId();

      const newListing = {
        id: listingId,
        seller_id: 'seller-demo-user',
        title: data.title || `${totalWeight} kg Mixed Scrap Clearance`,
        status: 'open_for_bids' as const,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        preferred_time_slot: data.preferred_time_slot,
        bid_window_expires_at: expiresAt,
        photos: data.photos.length > 0 ? data.photos : [
          'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?w=600&auto=format&fit=crop&q=80'
        ],
        total_approx_weight_kg: totalWeight,
        items: data.items.map((item, idx) => ({
          id: generateItemId(idx),
          listing_id: listingId,
          category_slug: item.category_slug,
          approx_weight_kg: item.approx_weight_kg,
        })),
        bids_count: 0,
        highest_bid: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      MockStore.saveListing(newListing);

      // Simulate a competitive dealer bid arriving in 4.5 seconds
      setTimeout(() => {
        MockStore.saveBid({
          id: `bid-instant-${Math.random().toString(36).substring(2, 8)}`,
          listing_id: newListing.id,
          dealer_id: 'dealer-1',
          dealer_name: 'Shree Ganesh Scrap Traders',
          dealer_rating: 4.9,
          dealer_distance_km: 1.4,
          total_estimated_amount: Math.round(totalWeight * 16.5),
          rate_breakdown: { newspaper: 16.5, cardboard: 11.5, iron: 30 },
          pickup_date: new Date().toISOString().split('T')[0],
          pickup_slot: data.preferred_time_slot,
          eta_minutes: 25,
          notes: 'ISO Certified digital scale. Instant UPI / Cash on the spot.',
          status: 'submitted',
          created_at: new Date().toISOString(),
        });
      }, 4500);

      // Navigate to live bids dashboard for this listing
      router.push(`/bids?listingId=${newListing.id}`);
    } catch (err) {
      console.error('Submit error', err);
      setFormError('Failed to create scrap listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* 4-Step Pill Stepper Navigation */}
      <div className="grid grid-cols-4 gap-2 bg-muted-bg/60 p-1.5 rounded-[16px] border border-border">
        {[
          { step: 1, label: t('step1'), icon: Layers },
          { step: 2, label: t('step2'), icon: Camera },
          { step: 3, label: t('step3'), icon: MapPin },
          { step: 4, label: t('step4'), icon: Clock },
        ].map(({ step, label, icon: Icon }) => {
          const isActive = currentStep === step;
          const isPassed = currentStep > step;
          return (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (isPassed) setCurrentStep(step as 1 | 2 | 3 | 4);
              }}
              disabled={!isPassed && !isActive}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-[12px] text-xs font-bold transition-all min-h-[48px] ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : isPassed
                  ? 'bg-surface text-primary dark:text-accent hover:bg-primary-tint/50 border border-border'
                  : 'text-muted opacity-50 cursor-not-allowed'
              }`}
            >
              {isPassed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
              ) : (
                <Icon className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate text-center sm:text-left">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Estimate Floating/Sticky Banner */}
      <div className="bg-primary text-white rounded-[20px] p-5 sm:p-6 shadow-lg border border-primary-hover flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-[14px] bg-accent/20 text-accent flex items-center justify-center shrink-0 border border-accent/30">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider block">
              {t('liveEstimateTitle')}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-accent tabular-nums tracking-tight font-sans">
                {t('liveEstimateRange', { min: liveEstimate.min, max: liveEstimate.max })}
              </span>
              <span className="text-xs text-stone-300 font-medium">
                (~{liveEstimate.totalWeight} kg total)
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              {t('liveEstimateNote')}
            </p>
          </div>
        </div>

        <div className="self-end sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-black/25 px-3 py-1.5 rounded-[12px] border border-white/10">
            <Scale className="w-3.5 h-3.5 text-accent" />
            Verified Scale Guarantee
          </span>
        </div>
      </div>

      {/* STEP 1: Categories & Weights */}
      {currentStep === 1 && (
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <span className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider">
                {t('step1')}
              </span>
              <h2 className="type-h3 font-serif text-text mt-0.5">
                {t('categoriesHeader')}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => append({ category_slug: 'plastic', approx_weight_kg: 5 })}
              className="btn-outline min-h-[44px] text-xs px-3.5 py-2"
            >
              <Plus className="w-4 h-4 text-primary dark:text-accent" />
              <span>Add Scrap Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const currentSlug = watchedItems[index]?.category_slug;
              const activeCategory = INITIAL_CATEGORIES.find((c) => c.slug === currentSlug);

              return (
                <div
                  key={field.id}
                  className="bg-muted-bg/50 p-4 sm:p-5 rounded-[16px] border border-border space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Category Selector with Indicative Rate Card */}
                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-1">
                        Scrap Category
                      </label>
                      <select
                        {...register(`items.${index}.category_slug` as const)}
                        className="w-full bg-surface border border-border rounded-[12px] px-3.5 py-2.5 text-sm font-bold text-text focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
                      >
                        {INITIAL_CATEGORIES.map((cat) => (
                          <option key={cat.slug} value={cat.slug}>
                            {locale === 'hi' ? cat.name_hi : locale === 'mr' ? cat.name_mr : cat.name_en} — ₹{cat.benchmark_price_min}-{cat.benchmark_price_max}/{cat.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Approx Weight Input with Steppers */}
                    <div className="w-full sm:w-56">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                          Approx Weight
                        </label>
                        {activeCategory && (
                          <span className="text-[11px] font-bold text-accent tabular-nums">
                            ₹{activeCategory.benchmark_price_min} - ₹{activeCategory.benchmark_price_max}/{activeCategory.unit}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          {...register(`items.${index}.approx_weight_kg` as const, {
                            valueAsNumber: true,
                          })}
                          className="w-full bg-surface border border-border rounded-[12px] px-3.5 py-2 text-base font-bold tabular-nums text-text focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
                        />
                        <span className="text-xs font-bold text-muted shrink-0">kg</span>
                      </div>
                    </div>

                    {/* Delete Item */}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-3 text-muted hover:text-danger hover:bg-danger/10 rounded-[12px] transition-colors self-end sm:self-center mt-1 sm:mt-5 min-w-[48px] min-h-[48px] flex items-center justify-center"
                        title="Remove category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick-tap Steppers (+5kg, +10kg, +25kg) for rapid mobile thumb tap */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <span className="text-[11px] font-medium text-muted">Quick add:</span>
                    {[5, 10, 25].map((addKg) => (
                      <button
                        key={addKg}
                        type="button"
                        onClick={() => addWeightStep(index, addKg)}
                        className="px-2.5 py-1 text-xs font-bold bg-surface text-text hover:text-primary dark:hover:text-accent hover:bg-primary-tint/50 border border-border rounded-[10px] active:scale-95 transition-all"
                      >
                        +{addKg} kg
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              className="btn-primary text-sm font-bold min-h-[48px] px-7 py-3"
            >
              <span>{t('nextStep')}</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Photo Upload (<300 KB client compression, max 6) */}
      {currentStep === 2 && (
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-border">
            <span className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider">
              {t('step2')}
            </span>
            <h2 className="type-h3 font-serif text-text mt-0.5">
              {t('addPhotos')}
            </h2>
            <p className="text-xs text-muted mt-1">
              {t('maxPhotosHint')} {t('photosHint')}
            </p>
          </div>

          {/* Upload Grid */}
          <div className="flex flex-wrap items-center gap-4">
            {photoPreviews.length < 6 && (
              <label className="cursor-pointer border-2 border-dashed border-primary/40 hover:border-primary bg-primary-tint/30 hover:bg-primary-tint/60 rounded-[16px] p-4 flex flex-col items-center justify-center w-32 h-32 text-primary dark:text-accent transition-colors min-w-[48px] min-h-[48px]">
                <Camera className="w-7 h-7 text-primary dark:text-accent mb-1" />
                <span className="text-xs font-bold text-center">Add Photo</span>
                <span className="text-[10px] text-muted mt-0.5">Camera / Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={compressing}
                />
              </label>
            )}

            {/* Thumbnail previews with compression details */}
            {photoPreviews.map((preview, idx) => {
              const stat = compressionStats[idx];
              return (
                <div key={idx} className="relative w-32 h-32 rounded-[16px] overflow-hidden border border-border group shadow-xs">
                  <OptimizedImage src={preview} alt="Scrap preview" className="w-full h-full object-cover" />
                  
                  {stat && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[10px] px-1.5 py-1 text-center font-bold">
                      -{stat.reductionPercentage}% ({(stat.compressedSizeBytes / 1024).toFixed(0)}KB)
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-danger text-white p-1.5 rounded-full opacity-90 group-hover:opacity-100 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {compressing && (
              <div className="w-32 h-32 rounded-[16px] border border-border bg-muted-bg flex flex-col items-center justify-center text-muted p-2 text-center animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-primary dark:text-accent mb-2" />
                <span className="text-xs font-semibold">{t('compressing')}</span>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-outline text-xs font-bold min-h-[48px] px-5 py-2.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('prevStep')}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="btn-primary text-sm font-bold min-h-[48px] px-7 py-3"
            >
              <span>{t('nextStep')}</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Hyperlocal Address & Map Pin */}
      {currentStep === 3 && (
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <span className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider">
                {t('step3')}
              </span>
              <h2 className="type-h3 font-serif text-text mt-0.5">
                {t('locationHeader')}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={gpsLoading}
              className="btn-outline text-xs font-bold min-h-[48px] px-4 py-2.5 self-start sm:self-auto"
            >
              {gpsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary dark:text-accent" />
              ) : (
                <Navigation className="w-4 h-4 text-primary dark:text-accent" />
              )}
              <span>{gpsLoading ? t('locating') : t('useGps')}</span>
            </button>
          </div>

          {/* Quick Area Presets */}
          <div>
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
              Popular Hyperlocal Areas (Tap to fill):
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_AREAS.map((area) => (
                <button
                  key={area.name}
                  type="button"
                  onClick={() => handleSelectAreaPreset(area)}
                  className="px-3.5 py-2 rounded-[12px] bg-muted-bg/60 hover:bg-primary-tint/60 border border-border hover:border-primary/40 text-text text-xs font-medium transition-all active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary dark:text-accent inline mr-1" />
                  {area.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text mb-1">
                {t('addressLabel')} *
              </label>
              <textarea
                rows={2}
                placeholder={t('addressPlaceholder')}
                {...register('address')}
                className="w-full bg-surface border border-border rounded-[12px] px-4 py-3 text-sm font-medium text-text focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
              />
              {errors.address && (
                <p className="text-xs text-danger mt-1 font-medium">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">
                {t('cityLabel')}
              </label>
              <input
                type="text"
                {...register('city')}
                className="w-full bg-surface border border-border rounded-[12px] px-4 py-3 text-sm font-medium text-text focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">
                {t('pincodeLabel')} *
              </label>
              <input
                type="text"
                placeholder={t('pincodePlaceholder')}
                maxLength={6}
                {...register('pincode')}
                className="w-full bg-surface border border-border rounded-[12px] px-4 py-3 text-sm font-bold tabular-nums text-text focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
              />
              {errors.pincode && (
                <p className="text-xs text-danger mt-1 font-medium">{errors.pincode.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-outline text-xs font-bold min-h-[48px] px-5 py-2.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('prevStep')}</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="btn-primary text-sm font-bold min-h-[48px] px-7 py-3"
            >
              <span>{t('nextStep')}</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Pickup Window, Timing & Confirmation */}
      {currentStep === 4 && (
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-border">
            <span className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider">
              {t('step4')}
            </span>
            <h2 className="type-h3 font-serif text-text mt-0.5">
              {t('timingHeader')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-text mb-2">
                {t('timeSlotLabel')}
              </label>
              <select
                {...register('preferred_time_slot')}
                className="w-full bg-surface border border-border rounded-[12px] px-4 py-3 text-sm font-medium text-text focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
              >
                <option value="Morning">{t('slotMorning')}</option>
                <option value="Afternoon">{t('slotAfternoon')}</option>
                <option value="Evening">{t('slotEvening')}</option>
                <option value="Weekend">{t('slotWeekend')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-2">
                {t('bidWindowLabel')}
              </label>
              <select
                {...register('bid_window_hours')}
                className="w-full bg-surface border border-border rounded-[12px] px-4 py-3 text-sm font-bold text-primary dark:text-accent focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
              >
                <option value="2">{t('bidWindow2h')}</option>
                <option value="6">{t('bidWindow6h')}</option>
                <option value="24">{t('bidWindow24h')}</option>
              </select>
            </div>
          </div>

          {/* Review Summary Card */}
          <div className="bg-muted-bg/50 rounded-[18px] p-5 sm:p-6 border border-border space-y-3">
            <h3 className="font-bold text-text text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary dark:text-accent" />
              <span>{t('reviewTitle')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-3 border-t border-border">
              <div>
                <span className="text-muted block mb-0.5">{t('reviewItems', { weight: liveEstimate.totalWeight })}</span>
                <span className="font-bold text-text">
                  {watchedItems.length} items ({liveEstimate.totalWeight} kg)
                </span>
              </div>

              <div>
                <span className="text-muted block mb-0.5">{t('reviewAddress')}</span>
                <span className="font-bold text-text truncate block">
                  {watchedAddress || 'Address set'}, {watchedCity}
                </span>
              </div>

              <div>
                <span className="text-muted block mb-0.5">{t('reviewTiming')}</span>
                <span className="font-bold text-text">
                  {watchedSlot} ({watchedBidWindow}h bid window)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn-outline text-xs font-bold min-h-[48px] px-5 py-2.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('prevStep')}</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-sm sm:text-base font-bold min-h-[50px] px-8 py-3.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('publishing')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span>{t('submitRequest')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
