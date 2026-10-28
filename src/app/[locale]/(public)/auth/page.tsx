'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function AuthPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const { sendOtp, verifyOtp, isLoading } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Auto-fill test credentials for local development
  const handleFillTestCredentials = () => {
    setPhoneNumber('9876543210');
    setErrorMessage(null);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage(t('errors.invalidPhone'));
      return;
    }

    const res = await sendOtp(clean);
    if (!res.success) {
      setErrorMessage(res.error || t('errors.generic'));
      return;
    }

    setIsTestMode(Boolean(res.isTestMode));
    setStep('otp');
    setResendTimer(30);

    // If test mode or test number, pre-fill hint
    if (res.isTestMode || clean.endsWith('9876543210')) {
      setOtpCode('123456');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.trim().length !== 6) {
      setErrorMessage(t('errors.invalidOtp'));
      return;
    }

    const res = await verifyOtp(phoneNumber, otpCode);
    if (!res.success) {
      setErrorMessage(res.error || t('errors.otpFailed'));
      return;
    }

    // Routing post-verification
    if (res.isNewUser) {
      const onboardingUrl = redirectPath 
        ? `/${locale}/onboarding?redirect=${encodeURIComponent(redirectPath)}`
        : `/${locale}/onboarding`;
      router.push(onboardingUrl);
    } else {
      const destination = redirectPath || '/';
      router.push(`/${locale}${destination.startsWith('/') ? destination : `/${destination}`}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-4 sm:py-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white shadow-md shadow-emerald-700/20 mb-1">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {step === 'phone' ? t('auth.loginTitle') : t('auth.otpTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {step === 'phone'
            ? t('auth.loginSubtitle')
            : t('auth.otpSubtitle', { phone: phoneNumber.slice(-10) })}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Local Dev Helper Notice */}
      <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-2.5 text-xs text-amber-900">
        <div className="flex items-center justify-between font-bold">
          <span className="flex items-center gap-1.5 text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            {t('auth.testOtpBadge')}
          </span>
          <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-black">
            Dev Test
          </span>
        </div>
        <p className="text-amber-800 leading-relaxed">
          {t('auth.testOtpNote')}
        </p>
        <button
          type="button"
          onClick={handleFillTestCredentials}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 rounded-xl transition-all shadow-xs text-xs active:scale-98"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('auth.fillTestCredentials')}</span>
        </button>
      </div>

      {/* Step 1: Phone Input Form */}
      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('auth.phoneLabel')}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-500 font-bold text-sm select-none border-r border-slate-200 pr-2">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder={t('auth.phonePlaceholder')}
                className="w-full pl-20 pr-4 py-3 min-h-[50px] rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-base font-mono font-bold tracking-wider text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              We send a 6-digit OTP code to verify your phone.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || phoneNumber.length < 10}
            className="w-full min-h-[48px] bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>{isLoading ? t('auth.sending') : t('auth.sendOtp')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Step 2: OTP Input Form */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="otp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('common.otp')}
              </label>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-xs text-emerald-700 hover:underline font-bold"
              >
                {t('auth.changePhone')}
              </button>
            </div>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('auth.otpPlaceholder')}
              className="w-full text-center px-4 py-3 min-h-[52px] rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-2xl font-mono font-black tracking-widest text-slate-900"
            />
            {isTestMode && (
              <p className="text-[11px] text-emerald-700 font-bold text-center">
                ✓ Test mode: code pre-filled as 123456
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otpCode.length !== 6}
            className="w-full min-h-[48px] bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>{isLoading ? t('auth.verifying') : t('auth.verifyOtp')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              disabled={resendTimer > 0 || isLoading}
              onClick={() => handleSendOtp()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 font-medium disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {resendTimer > 0
                  ? t('auth.resendIn', { seconds: resendTimer })
                  : t('auth.resendOtp')}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center">
        <Phone className="w-3.5 h-3.5 text-emerald-600" />
        <span>Your mobile number is never shared until an offer is accepted.</span>
      </div>
    </div>
  );
}
