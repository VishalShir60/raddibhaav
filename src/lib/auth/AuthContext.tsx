'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Profile, Dealer, UserRole, KycStatus } from '@/lib/types/database';
import { checkOtpRateLimit } from '@/lib/security/abuse-prevention';

export interface AuthUser {
  id: string;
  phone: string;
  email?: string;
}

export interface OnboardingData {
  role: UserRole;
  name: string;
  language: 'en' | 'hi' | 'mr';
  city: string;
  // Dealer specific
  shop_name?: string;
  service_radius_km?: number;
  latitude?: number;
  longitude?: number;
  kyc_docs?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  dealer: Dealer | null;
  isLoading: boolean;
  isInitialized: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; isTestMode?: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; isNewUser: boolean; error?: string }>;
  completeOnboarding: (data: OnboardingData) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Profile> & { shop_name?: string; service_radius_km?: number }) => Promise<{ success: boolean; error?: string }>;
  uploadKycDocument: (file: File, docType: string) => Promise<{ url: string; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DbQueryClient {
  from: (table: string) => {
    select: (cols?: string) => {
      eq: (col: string, val: unknown) => {
        single: () => Promise<{ data: unknown; error: { message: string } | null }>;
      };
    };
    upsert: (val: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    update: (val: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };
}

// Helper to set cookie for Next.js middleware access
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

const STORAGE_KEY_USER = 'raddibhaav_auth_user';
const STORAGE_KEY_PROFILE = 'raddibhaav_auth_profile';
const STORAGE_KEY_DEALER = 'raddibhaav_auth_dealer';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabase = createClient();
  const hasSupabase = isSupabaseConfigured();

  // Load initial session on client mount
  useEffect(() => {
    async function initAuth() {
      try {
        if (hasSupabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              phone: session.user.phone || '',
              email: session.user.email,
            };
            setUser(authUser);

            // Fetch profile
            const { data: prof } = await (supabase as unknown as DbQueryClient)
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const profileData = prof as unknown as Profile | null;
            if (profileData) {
              setProfile(profileData);
              setCookie('raddibhaav_user_role', profileData.role);

              // If dealer, fetch dealer profile
              if (profileData.role === 'dealer') {
                const { data: deal } = await (supabase as unknown as DbQueryClient)
                  .from('dealers')
                  .select('*')
                  .eq('profile_id', session.user.id)
                  .single();

                const dealerData = deal as unknown as Dealer | null;
                if (dealerData) {
                  setDealer(dealerData);
                  setCookie('raddibhaav_kyc_status', dealerData.kyc_status);
                }
              }
            }
          }
        } else {
          // Local/offline fallback storage
          const storedUser = localStorage.getItem(STORAGE_KEY_USER);
          const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
          const storedDealer = localStorage.getItem(STORAGE_KEY_DEALER);

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (storedProfile) {
              const parsedProfile = JSON.parse(storedProfile);
              setProfile(parsedProfile);
              setCookie('raddibhaav_user_role', parsedProfile.role);
            }
            if (storedDealer) {
              const parsedDealer = JSON.parse(storedDealer);
              setDealer(parsedDealer);
              setCookie('raddibhaav_kyc_status', parsedDealer.kyc_status);
            }
          }
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    }

    initAuth();
  }, [hasSupabase, supabase]);

  // Send OTP
  const sendOtp = useCallback(async (phone: string) => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;
      
      const isTestPhone = cleanPhone.endsWith('9876543210');

      // Rate limit OTP requests (Max 3 per 10 minutes per mobile number)
      const rateLimit = checkOtpRateLimit(cleanPhone);
      if (!rateLimit.allowed) {
        return { success: false, error: rateLimit.error };
      }

      if (!hasSupabase || isTestPhone) {
        // Test mode / Offline simulation
        await new Promise((r) => setTimeout(r, 600));
        return { success: true, isTestMode: true };
      }

      // Real Supabase phone OTP dispatch
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, isTestMode: false };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [hasSupabase, supabase]);

  // Verify OTP
  const verifyOtp = useCallback(async (phone: string, token: string) => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;
      const isTestPhone = cleanPhone.endsWith('9876543210');

      if (!hasSupabase || isTestPhone) {
        // Validate test OTP '123456'
        if (token.trim() !== '123456') {
          return { success: false, isNewUser: false, error: 'Invalid test OTP code. Use 123456' };
        }

        const simulatedId = `user_mock_${cleanPhone.slice(-6)}`;
        const authUser: AuthUser = {
          id: simulatedId,
          phone: formattedPhone,
        };

        setUser(authUser);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authUser));

        // Check if existing profile in local storage
        const existingProfStr = localStorage.getItem(STORAGE_KEY_PROFILE);
        let existingProf: Profile | null = null;
        if (existingProfStr) {
          try {
            existingProf = JSON.parse(existingProfStr);
          } catch {
            existingProf = null;
          }
        }

        if (existingProf && existingProf.id === simulatedId) {
          setProfile(existingProf);
          setCookie('raddibhaav_user_role', existingProf.role);
          setCookie('raddibhaav_session', 'mock_valid');

          const existingDealStr = localStorage.getItem(STORAGE_KEY_DEALER);
          if (existingDealStr) {
            const deal = JSON.parse(existingDealStr);
            setDealer(deal);
            setCookie('raddibhaav_kyc_status', deal.kyc_status);
          }

          return { success: true, isNewUser: false };
        }

        // New user needing onboarding
        setCookie('raddibhaav_session', 'mock_valid');
        return { success: true, isNewUser: true };
      }

      // Real Supabase verification
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token.trim(),
        type: 'sms',
      });

      if (error || !data.user) {
        return { success: false, isNewUser: false, error: error?.message || 'OTP verification failed' };
      }

      const authUser: AuthUser = {
        id: data.user.id,
        phone: data.user.phone || formattedPhone,
        email: data.user.email,
      };
      setUser(authUser);

      // Check if user has an existing profile in Supabase
      const { data: prof } = await (supabase as unknown as DbQueryClient)
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const profileData = prof as unknown as Profile | null;
      if (profileData) {
        setProfile(profileData);
        setCookie('raddibhaav_user_role', profileData.role);

        if (profileData.role === 'dealer') {
          const { data: deal } = await (supabase as unknown as DbQueryClient)
            .from('dealers')
            .select('*')
            .eq('profile_id', data.user.id)
            .single();

          const dealerData = deal as unknown as Dealer | null;
          if (dealerData) {
            setDealer(dealerData);
            setCookie('raddibhaav_kyc_status', dealerData.kyc_status);
          }
        }

        return { success: true, isNewUser: false };
      }

      // Profile does not exist yet -> trigger onboarding
      return { success: true, isNewUser: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OTP verification error';
      return { success: false, isNewUser: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [hasSupabase, supabase]);

  // Complete Onboarding
  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!user) {
      return { success: false, error: 'No active session found. Please log in.' };
    }

    setIsLoading(true);
    try {
      const nowIso = new Date().toISOString();
      const newProfile: Profile = {
        id: user.id,
        phone: user.phone,
        role: data.role,
        name: data.name,
        language: data.language,
        city: data.city || 'Nashik',
        created_at: nowIso,
        updated_at: nowIso,
      };

      let newDealer: Dealer | null = null;

      if (data.role === 'dealer') {
        const lat = data.latitude || 19.9975;
        const lng = data.longitude || 73.7898;
        newDealer = {
          profile_id: user.id,
          shop_name: data.shop_name || `${data.name}'s Scrap Shop`,
          service_radius_km: data.service_radius_km || 5.0,
          location: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          kyc_status: 'pending' as KycStatus,
          kyc_docs: data.kyc_docs || [],
          rating_avg: 4.8,
          total_pickups: 0,
          is_active: true,
          created_at: nowIso,
          updated_at: nowIso,
        };
      }

      if (hasSupabase) {
        // Upsert profile in Supabase
        const { error: profErr } = await (supabase as unknown as DbQueryClient)
          .from('profiles')
          .upsert({
            id: user.id,
            phone: user.phone,
            role: data.role,
            name: data.name,
            language: data.language,
            city: data.city || 'Nashik',
            updated_at: nowIso,
          });

        if (profErr) throw profErr;

        if (data.role === 'dealer' && newDealer) {
          const lat = data.latitude || 19.9975;
          const lng = data.longitude || 73.7898;
          const { error: dealErr } = await (supabase as unknown as DbQueryClient)
            .from('dealers')
            .upsert({
              profile_id: user.id,
              shop_name: newDealer.shop_name,
              service_radius_km: newDealer.service_radius_km,
              location: `SRID=4326;POINT(${lng} ${lat})`,
              kyc_status: 'pending',
              kyc_docs: newDealer.kyc_docs,
              rating_avg: 0.0,
              total_pickups: 0,
              is_active: true,
            });

          if (dealErr) throw dealErr;
        }
      }

      // Update state and cookies
      setProfile(newProfile);
      setCookie('raddibhaav_user_role', data.role);

      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));

      if (newDealer) {
        setDealer(newDealer);
        setCookie('raddibhaav_kyc_status', newDealer.kyc_status);
        localStorage.setItem(STORAGE_KEY_DEALER, JSON.stringify(newDealer));
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete onboarding';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [hasSupabase, supabase, user]);

  // Update Profile
  const updateProfile = useCallback(async (data: Partial<Profile> & { shop_name?: string; service_radius_km?: number }) => {
    if (!user || !profile) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    try {
      const updatedProf: Profile = {
        ...profile,
        ...data,
        updated_at: new Date().toISOString(),
      };

      if (hasSupabase) {
        const { error: pErr } = await (supabase as unknown as DbQueryClient)
          .from('profiles')
          .update({
            name: updatedProf.name,
            language: updatedProf.language,
            city: updatedProf.city,
            updated_at: updatedProf.updated_at,
          })
          .eq('id', user.id);

        if (pErr) throw pErr;

        if (profile.role === 'dealer' && (data.shop_name || data.service_radius_km)) {
          const { error: dErr } = await (supabase as unknown as DbQueryClient)
            .from('dealers')
            .update({
              ...(data.shop_name ? { shop_name: data.shop_name } : {}),
              ...(data.service_radius_km ? { service_radius_km: data.service_radius_km } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq('profile_id', user.id);

          if (dErr) throw dErr;
        }
      }

      setProfile(updatedProf);
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProf));

      if (dealer && (data.shop_name || data.service_radius_km)) {
        const updatedDealer: Dealer = {
          ...dealer,
          ...(data.shop_name ? { shop_name: data.shop_name } : {}),
          ...(data.service_radius_km ? { service_radius_km: data.service_radius_km } : {}),
          updated_at: new Date().toISOString(),
        };
        setDealer(updatedDealer);
        localStorage.setItem(STORAGE_KEY_DEALER, JSON.stringify(updatedDealer));
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [dealer, hasSupabase, profile, supabase, user]);

  // Upload KYC Document to private storage bucket
  const uploadKycDocument = useCallback(async (file: File, docType: string) => {
    if (!user) {
      return { url: '', error: 'Must be logged in to upload documents' };
    }

    try {
      if (hasSupabase) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/${docType}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Create signed URL for secure viewing
        const { data: signedData, error: signError } = await supabase.storage
          .from('kyc-documents')
          .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours

        if (signError) throw signError;

        return { url: signedData.signedUrl };
      } else {
        // Offline preview URL
        return { url: URL.createObjectURL(file) };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'KYC upload failed';
      return { url: '', error: msg };
    }
  }, [hasSupabase, supabase, user]);

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      if (hasSupabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      setDealer(null);

      deleteCookie('raddibhaav_user_role');
      deleteCookie('raddibhaav_kyc_status');
      deleteCookie('raddibhaav_session');

      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_DEALER);
    } finally {
      setIsLoading(false);
    }
  }, [hasSupabase, supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        dealer,
        isLoading,
        isInitialized,
        sendOtp,
        verifyOtp,
        completeOnboarding,
        updateProfile,
        uploadKycDocument,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
