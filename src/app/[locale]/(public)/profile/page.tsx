'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { Profile, Dealer } from '@/lib/types/database';
import { 
  User, 
  Store, 
  Phone, 
  MapPin, 
  Languages, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Save, 
  Sliders,
  ShieldCheck
} from 'lucide-react';

interface ProfileFormProps {
  userPhone: string;
  initialProfile: Profile;
  initialDealer: Dealer | null;
  onUpdate: (data: Partial<Profile> & { shop_name?: string; service_radius_km?: number }) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

function ProfileForm({ userPhone, initialProfile, initialDealer, onUpdate, isLoading }: ProfileFormProps) {
  const t = useTranslations();
  const [name, setName] = useState(initialProfile.name || '');
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>(initialProfile.language || 'en');
  const [city, setCity] = useState(initialProfile.city || 'Nashik');
  const [address, setAddress] = useState(initialProfile.address || '');

  // Dealer specific
  const [shopName, setShopName] = useState(initialDealer?.shop_name || '');
  const [serviceRadius, setServiceRadius] = useState<number>(initialDealer?.service_radius_km || 5);

  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    const res = await onUpdate({
      name: name.trim(),
      language,
      city,
      address: address.trim(),
      ...(initialProfile.role === 'dealer' ? {
        shop_name: shopName.trim(),
        service_radius_km: serviceRadius,
      } : {}),
    });

    if (res.success) {
      setFeedbackMessage({ type: 'success', text: t('profile.saved') });
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || t('errors.generic') });
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Status Feedback */}
      {feedbackMessage && (
        <div className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Role & Verification Badge Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            initialProfile.role === 'dealer' ? 'bg-blue-600 text-white' : 'bg-emerald-700 text-white'
          }`}>
            {initialProfile.role === 'dealer' ? <Store className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
              {t('profile.role')}
            </div>
            <div className="text-base font-black text-slate-900 capitalize flex items-center gap-2">
              <span>{initialProfile.role === 'dealer' ? 'Scrap Dealer' : 'Household Seller'}</span>
              {initialProfile.role === 'admin' && (
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dealer KYC status badge */}
        {initialProfile.role === 'dealer' && (
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">
              {t('profile.kycStatus')}
            </div>
            {initialDealer?.kyc_status === 'approved' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('profile.kycApproved')}</span>
              </span>
            ) : initialDealer?.kyc_status === 'rejected' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>{t('profile.kycRejected')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('profile.kycPending')}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Personal Details */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
          {t('profile.personalInfo')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="pname" className="block text-xs font-bold text-slate-700">
              {t('profile.name')} *
            </label>
            <input
              id="pname"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pphone" className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('profile.phone')}</span>
            </label>
            <input
              id="pphone"
              type="text"
              disabled
              value={userPhone}
              className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm bg-slate-50 font-mono text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="plang" className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5" />
              <span>{t('profile.language')}</span>
            </label>
            <select
              id="plang"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
              className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-white"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pcity" className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('profile.city')}</span>
            </label>
            <input
              id="pcity"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="paddr" className="block text-xs font-bold text-slate-700">
            {t('profile.address')}
          </label>
          <input
            id="paddr"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Flat 302, Sai Residency, Panchavati, Nashik"
            className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Dealer Specific Settings */}
      {initialProfile.role === 'dealer' && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-blue-600" />
            <span>{t('profile.dealerSettings')}</span>
          </h3>

          <div className="space-y-1.5">
            <label htmlFor="pshop" className="block text-xs font-bold text-slate-700">
              {t('profile.shopName')}
            </label>
            <input
              id="pshop"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          {/* Service Radius Slider */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('profile.serviceRadius')}</span>
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
          </div>
        </div>
      )}

      {/* Save CTA */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full min-h-[48px] bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
      >
        <Save className="w-4 h-4" />
        <span>{isLoading ? t('profile.saving') : t('profile.saveChanges')}</span>
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, profile, dealer, updateProfile, signOut, isLoading } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  if (!user && !isLoading) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-600">{t('errors.unauthorized')}</p>
        <button
          onClick={() => router.push(`/${locale}/auth`)}
          className="min-h-[48px] px-6 py-2.5 bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
        >
          {t('auth.loginTitle')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('profile.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Logout Trigger */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="min-h-[48px] px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{t('auth.logoutConfirm')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="min-h-[40px] px-4 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-red-700"
            >
              Yes, Log Out
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="min-h-[40px] px-4 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {profile && (
        <ProfileForm
          key={profile.id}
          userPhone={user?.phone || ''}
          initialProfile={profile}
          initialDealer={dealer}
          onUpdate={updateProfile}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
