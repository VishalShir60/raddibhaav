'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, type OnboardingData } from '@/hooks/useAuth';
import type { UserRole } from '@/lib/types/database';
import { 
  User, 
  Store, 
  CheckCircle2, 
  MapPin, 
  Upload, 
  Clock, 
  Sliders, 
  ArrowRight, 
  FileText, 
  AlertCircle,
  Navigation,
  Languages
} from 'lucide-react';

export default function OnboardingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get('role') as UserRole | null;
  const redirectPath = searchParams.get('redirect') || '';

  const { completeOnboarding, uploadKycDocument, isLoading } = useAuth();

  // Step state
  const [role, setRole] = useState<UserRole>(preselectedRole || 'seller');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>((locale as 'en' | 'hi' | 'mr') || 'en');
  const [city, setCity] = useState('Nashik');

  // Dealer specific state
  const [shopName, setShopName] = useState('');
  const [serviceRadius, setServiceRadius] = useState<number>(5);
  const [latitude, setLatitude] = useState<number>(19.9975);
  const [longitude, setLongitude] = useState<number>(73.7898);
  const [areaLabel, setAreaLabel] = useState('Panchavati / Core Nashik');
  const [isLocating, setIsLocating] = useState(false);

  // KYC state
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [shopPhotoFile, setShopPhotoFile] = useState<File | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);

  // Completion / pending approval view
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Nashik location presets
  const handleSelectPresetArea = (area: string, lat: number, lng: number) => {
    setAreaLabel(area);
    setLatitude(lat);
    setLongitude(lng);
  };

  // GPS detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAreaLabel('Current GPS Location');
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setErrorMessage('Unable to retrieve your current location. Please select an area preset below.');
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(t('errors.nameRequired'));
      return;
    }

    if (role === 'dealer' && !shopName.trim()) {
      setErrorMessage(t('errors.shopNameRequired'));
      return;
    }

    const finalKycUrls = [...uploadedUrls];

    // Upload KYC if dealer
    if (role === 'dealer') {
      if (!aadhaarFile && !shopPhotoFile && uploadedUrls.length === 0) {
        setErrorMessage(t('errors.kycRequired'));
        return;
      }

      setIsUploadingKyc(true);
      try {
        if (aadhaarFile) {
          const res = await uploadKycDocument(aadhaarFile, 'aadhaar');
          if (res.url) finalKycUrls.push(res.url);
        }
        if (shopPhotoFile) {
          const res = await uploadKycDocument(shopPhotoFile, 'shop');
          if (res.url) finalKycUrls.push(res.url);
        }
        setUploadedUrls(finalKycUrls);
      } catch (err) {
        console.warn('KYC upload error:', err);
      } finally {
        setIsUploadingKyc(false);
      }
    }

    const payload: OnboardingData = {
      role,
      name: name.trim(),
      language,
      city,
      ...(role === 'dealer' ? {
        shop_name: shopName.trim(),
        service_radius_km: serviceRadius,
        latitude,
        longitude,
        kyc_docs: finalKycUrls,
      } : {}),
    };

    const res = await completeOnboarding(payload);
    if (!res.success) {
      setErrorMessage(res.error || t('errors.generic'));
      return;
    }

    if (role === 'dealer') {
      setIsSubmitted(true);
    } else {
      // Seller onboarded immediately -> redirect
      const destination = redirectPath || '/sell';
      router.push(`/${locale}${destination.startsWith('/') ? destination : `/${destination}`}`);
    }
  };

  // If dealer submitted and pending approval
  if (isSubmitted && role === 'dealer') {
    return (
      <div className="w-full max-w-lg mx-auto py-6 sm:py-12 space-y-6 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
              {t('profile.kycPending')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('onboarding.pendingTitle')}
            </h1>
            <p className="text-sm text-slate-600">
              {t('onboarding.pendingSubtitle')}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200 space-y-3 text-xs sm:text-sm">
            <div className="font-bold text-slate-800">Verification Steps:</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1. Application & KYC Submitted ({shopName || name})</span>
              </div>
              <div className="flex items-center gap-2.5 text-amber-800 font-bold">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>2. Admin Review & Scale Verification (In Progress)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] shrink-0">
                  3
                </div>
                <span>3. Live Doorstep Scrap Bidding Activated</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 italic">
            {t('onboarding.pendingReviewNote')}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(`/${locale}/rates`)}
              className="flex-1 min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl py-3 px-4 shadow-sm"
            >
              {t('onboarding.continueBrowsing')}
            </button>
            <button
              onClick={() => router.push(`/${locale}/dealer`)}
              className="min-h-[48px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm rounded-xl py-3 px-4 border border-emerald-200"
            >
              Go to Dealer Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('onboarding.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('onboarding.subtitle')}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Step 1: Choose Role */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            {t('onboarding.step1Role')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Household Seller */}
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[48px] flex flex-col justify-between ${
                role === 'seller'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  role === 'seller' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                {role === 'seller' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {t('onboarding.roleSeller')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {t('onboarding.roleSellerDesc')}
                </p>
              </div>
            </button>

            {/* Verified Dealer */}
            <button
              type="button"
              onClick={() => setRole('dealer')}
              className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[48px] flex flex-col justify-between ${
                role === 'dealer'
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  role === 'dealer' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Store className="w-5 h-5" />
                </div>
                {role === 'dealer' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {t('onboarding.roleDealer')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {t('onboarding.roleDealerDesc')}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Basic Details */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            {t('onboarding.step2Details')}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold text-slate-700">
                {t('onboarding.nameLabel')} *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('onboarding.namePlaceholder')}
                className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="language" className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5" />
                <span>{t('onboarding.languageLabel')}</span>
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
                className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-white"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="city" className="block text-xs font-bold text-slate-700">
              {t('onboarding.cityLabel')}
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-white"
            >
              <option value="Nashik">{t('onboarding.cityNashik')}</option>
              <option value="Mumbai">{t('onboarding.cityMumbai')}</option>
              <option value="Pune">{t('onboarding.cityPune')}</option>
            </select>
          </div>
        </div>

        {/* Step 3: Dealer Specific Details */}
        {role === 'dealer' && (
          <div className="space-y-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" />
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                {t('onboarding.dealerSection')}
              </label>
            </div>

            {/* Shop Name */}
            <div className="space-y-1.5">
              <label htmlFor="shopName" className="block text-xs font-bold text-slate-700">
                {t('onboarding.shopName')} *
              </label>
              <input
                id="shopName"
                type="text"
                required={role === 'dealer'}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t('onboarding.shopNamePlaceholder')}
                className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Service Radius Slider (1 - 15 km) */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('onboarding.serviceRadius', { radius: serviceRadius })}</span>
                </span>
                <span className="text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {serviceRadius} km
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={0.5}
                value={serviceRadius}
                onChange={(e) => setServiceRadius(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                {t('onboarding.radiusHint')}
              </p>
            </div>

            {/* Shop Location */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  {t('onboarding.locationTitle')}
                </label>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={isLocating}
                  className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isLocating ? t('onboarding.locating') : t('onboarding.useGpsLocation')}</span>
                </button>
              </div>

              {/* Location Badge */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800">{areaLabel}</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>

              {/* Nashik Quick Areas */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Quick Nashik Areas:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectPresetArea('Panchavati / Ramkund', 19.9975, 73.7898)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium"
                  >
                    Panchavati
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPresetArea('CIDCO / Trimurti Chowk', 19.9723, 73.7554)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium"
                  >
                    CIDCO
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPresetArea('Satpur Industrial Zone', 19.9880, 73.7312)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium"
                  >
                    Satpur
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPresetArea('Nashik Road Railway Station', 19.9542, 73.8423)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium"
                  >
                    Nashik Road
                  </button>
                </div>
              </div>
            </div>

            {/* KYC Upload to Private Storage Bucket */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                  {t('onboarding.kycTitle')}
                </label>
              </div>
              <p className="text-xs text-slate-500">
                {t('onboarding.kycSubtitle')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Aadhaar / ID */}
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center space-y-2 bg-slate-50/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-800">
                    {t('onboarding.uploadAadhaar')} *
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {aadhaarFile && (
                    <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{aadhaarFile.name.slice(0, 20)}</span>
                    </div>
                  )}
                </div>

                {/* Shop Front Photo */}
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center space-y-2 bg-slate-50/50">
                  <Store className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-800">
                    {t('onboarding.uploadShopPhoto')}
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setShopPhotoFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {shopPhotoFile && (
                    <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{shopPhotoFile.name.slice(0, 20)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isUploadingKyc}
          className="w-full min-h-[50px] bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>{isLoading || isUploadingKyc ? t('onboarding.submitting') : t('onboarding.completeBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
