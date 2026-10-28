'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ShieldCheck,
  BarChart3,
  FileCheck,
  Truck,
  AlertTriangle,
  TrendingUp,
  Users,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  Eye,
  DollarSign,
  Scale,
  Clock,
  Phone,
  MessageSquare,
  AlertCircle,
  X,
  Send,
  Building,
  UserCheck,
  UserX,
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { MockStore } from '@/lib/data/mock-store';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import type {
  AdminDealerUser,
  AdminSellerUser,
  AdminDisputeRecord,
  PlatformSettings,
  AdminMetrics,
  ScrapCategory,
  ScrapListing
} from '@/lib/types/database';

type AdminTab = 'metrics' | 'kyc' | 'listings' | 'disputes' | 'ratecard' | 'users' | 'settings';

export default function AdminPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [activeTab, setActiveTab] = useState<AdminTab>('metrics');
  const [dealers, setDealers] = useState<AdminDealerUser[]>(() => MockStore.getAdminDealers());
  const [sellers, setSellers] = useState<AdminSellerUser[]>(() => MockStore.getAdminSellers());
  const [listings, setListings] = useState<ScrapListing[]>(() => MockStore.getListings());
  const [disputes, setDisputes] = useState<AdminDisputeRecord[]>(() => MockStore.getAdminDisputes());
  const [settings, setSettings] = useState<PlatformSettings>(() => MockStore.getPlatformSettings());
  const [metrics, setMetrics] = useState<AdminMetrics>(() => MockStore.getAdminMetrics());
  
  // Rate cards state
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [rateCards, setRateCards] = useState<ScrapCategory[]>(() => MockStore.getCityRateCards('Mumbai'));

  // Filters
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [listingsStatusFilter, setListingsStatusFilter] = useState<string>('all');
  const [listingsCityFilter, setListingsCityFilter] = useState<string>('all');
  const [disputesFilter, setDisputesFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');
  const [userTab, setUserTab] = useState<'dealers' | 'sellers'>('dealers');

  // Modals & Interactive States
  const [activeKycDocModal, setActiveKycDocModal] = useState<AdminDealerUser | null>(null);
  const [rejectionModalDealer, setRejectionModalDealer] = useState<AdminDealerUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [activeDisputeModal, setActiveDisputeModal] = useState<AdminDisputeRecord | null>(null);
  const [resolutionOutcome, setResolutionOutcome] = useState('refund_seller_shortfall');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newChatNote, setNewChatNote] = useState('');

  const [suspensionModalUser, setSuspensionModalUser] = useState<{ id: string; name: string; type: 'dealer' | 'seller' } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setRateCards(MockStore.getCityRateCards(city));
  };

  const refreshAllData = () => {
    setDealers(MockStore.getAdminDealers());
    setSellers(MockStore.getAdminSellers());
    setListings(MockStore.getListings());
    setDisputes(MockStore.getAdminDisputes());
    setSettings(MockStore.getPlatformSettings());
    setMetrics(MockStore.getAdminMetrics());
    setRateCards(MockStore.getCityRateCards(selectedCity));
  };

  // Handlers for KYC
  const handleApproveKyc = (dealerId: string) => {
    const updated = MockStore.updateDealerKyc(dealerId, 'approved');
    setDealers(updated);
    setActiveKycDocModal(null);
    showToast('Dealer KYC Approved & Scale Certification Confirmed');
  };

  const handleOpenRejectModal = (dealer: AdminDealerUser) => {
    setRejectionModalDealer(dealer);
    setRejectionReason('');
  };

  const handleConfirmRejectKyc = () => {
    if (!rejectionModalDealer) return;
    const reason = rejectionReason.trim() || 'Documents do not match address / blurred scale certificate.';
    const updated = MockStore.updateDealerKyc(rejectionModalDealer.dealer_id, 'rejected', reason);
    setDealers(updated);
    setRejectionModalDealer(null);
    setActiveKycDocModal(null);
    showToast('Dealer KYC Rejected. Rejection notice logged.');
  };

  // Handlers for Suspensions
  const handleOpenSuspendModal = (id: string, name: string, type: 'dealer' | 'seller') => {
    setSuspensionModalUser({ id, name, type });
    setSuspensionReason('');
  };

  const handleConfirmSuspend = () => {
    if (!suspensionModalUser) return;
    const reason = suspensionReason.trim() || 'Suspended by admin due to policy violation';
    if (suspensionModalUser.type === 'dealer') {
      const updated = MockStore.toggleDealerSuspension(suspensionModalUser.id, reason);
      setDealers(updated);
    } else {
      const updated = MockStore.toggleSellerSuspension(suspensionModalUser.id, reason);
      setSellers(updated);
    }
    setSuspensionModalUser(null);
    showToast(`Account suspended for ${suspensionModalUser.name}`);
  };

  const handleReactivate = (id: string, type: 'dealer' | 'seller') => {
    if (type === 'dealer') {
      const updated = MockStore.toggleDealerSuspension(id);
      setDealers(updated);
    } else {
      const updated = MockStore.toggleSellerSuspension(id);
      setSellers(updated);
    }
    showToast('Account reactivated successfully');
  };

  // Handlers for Disputes
  const handleAddChatNote = () => {
    if (!activeDisputeModal || !newChatNote.trim()) return;
    const updated = MockStore.addDisputeChatNote(
      activeDisputeModal.id,
      'Admin Operations Support',
      'admin',
      newChatNote.trim()
    );
    setDisputes(updated);
    const refreshed = updated.find((d) => d.id === activeDisputeModal.id) || null;
    setActiveDisputeModal(refreshed);
    setNewChatNote('');
    showToast('Note added to dispute log');
  };

  const handleResolveDispute = () => {
    if (!activeDisputeModal) return;
    const updated = MockStore.resolveDispute(
      activeDisputeModal.id,
      resolutionOutcome,
      resolutionNotes.trim()
    );
    setDisputes(updated);
    setActiveDisputeModal(null);
    showToast('Dispute marked as Resolved with chosen outcome.');
  };

  // Handlers for Rate Card
  const handleRateChange = (slug: string, field: 'min' | 'max', val: number) => {
    setRateCards((prev) =>
      prev.map((c) =>
        c.slug === slug
          ? {
              ...c,
              [field === 'min' ? 'benchmark_price_min' : 'benchmark_price_max']: val,
            }
          : c
      )
    );
  };

  const handleSaveRateCard = () => {
    MockStore.updateCityRateCard(selectedCity, rateCards);
    showToast(`Benchmark rates updated for ${selectedCity}!`);
  };

  // Handlers for Settings
  const handleSaveSettings = () => {
    MockStore.updatePlatformSettings(settings);
    showToast(t('savedNotice'));
  };

  // Computed views
  const filteredDealers = dealers.filter((d) => {
    if (kycFilter === 'all') return true;
    return d.kyc_status === kycFilter;
  });

  const filteredListings = listings.filter((l) => {
    const statusMatch = listingsStatusFilter === 'all' || l.status === listingsStatusFilter;
    const cityMatch = listingsCityFilter === 'all' || l.city.toLowerCase() === listingsCityFilter.toLowerCase();
    return statusMatch && cityMatch;
  });

  const filteredDisputes = disputes.filter((disp) => {
    if (disputesFilter === 'all') return true;
    return disp.status === disputesFilter;
  });

  const citiesList = ['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Delhi NCR'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/30 text-xs sm:text-sm font-bold animate-in fade-in slide-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {t('title')}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              RaddiBhaav Ops &amp; Mandi Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {t('subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={refreshAllData}
              className="min-h-[44px] px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-white/10"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <div className="px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Admin Role Authenticated
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'metrics'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {t('tabMetrics')}
        </button>

        <button
          onClick={() => setActiveTab('kyc')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'kyc'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          {t('tabKyc')}
          {dealers.filter((d) => d.kyc_status === 'pending').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black inline-flex items-center justify-center">
              {dealers.filter((d) => d.kyc_status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          {t('tabListings')}
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'disputes'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {t('tabDisputes')}
          {disputes.filter((d) => d.status !== 'resolved').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black inline-flex items-center justify-center">
              {disputes.filter((d) => d.status !== 'resolved').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ratecard')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'ratecard'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {t('tabRateCard')}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          {t('tabUsers')}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          {t('tabSettings')}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: METRICS DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">{t('gmv')}</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{metrics.gmv_rupees.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                Completed doorstep transactions
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">{t('commissionWaived')}</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600">
                ₹{metrics.commission_waived_rupees.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 font-bold mt-1">
                100% Waived during MVP Launch
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">{t('acceptanceRate')}</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {metrics.acceptance_rate_percent}%
              </div>
              <p className="text-[11px] text-blue-700 font-bold mt-1">
                {metrics.completed_pickups} pickups finalized
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">{t('avgOffers')}</span>
                <Scale className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {metrics.avg_offers_per_listing}
              </div>
              <p className="text-[11px] text-purple-700 font-bold mt-1">
                Competitive dealer bid density
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">{t('listingsPerDay')}</span>
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {metrics.listings_per_day}
              </div>
              <p className="text-[11px] text-slate-500 font-bold mt-1">
                Across Mumbai, Pune &amp; Nashik
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">{t('bidSpread')}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{metrics.avg_bid_spread_rupees}
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                Extra seller gain via competition
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">Active Verified Dealers</span>
                <Building className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {dealers.filter((d) => d.kyc_status === 'approved' && !d.is_suspended).length}
              </div>
              <p className="text-[11px] text-teal-700 font-bold mt-1">
                With calibrated electronic scales
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">Pending KYC Audits</span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600">
                {dealers.filter((d) => d.kyc_status === 'pending').length}
              </div>
              <p className="text-[11px] text-amber-700 font-bold mt-1">
                Awaiting Aadhaar &amp; shop verification
              </p>
            </div>
          </div>

          {/* Quick Health Summary */}
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-emerald-950 text-base">
                Doorstep Scrap Marketplace Status: Operational &amp; Healthy
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-3xl">
                Realtime PostGIS radius dispatching active. 100% of dealers on the platform maintain verified digital scale certificates. Anti-lowball threshold locked at 15% weight divergence.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-200/80 text-emerald-900 font-black text-xs">
                PostGIS Engine Online
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEALER KYC QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('kycQueueTitle')}</h2>
              <p className="text-xs text-slate-500">
                Inspect Aadhaar ID, shop front photo, and digital scale certificate before authorizing dealer bidding.
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-2xl">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setKycFilter(filter)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    kycFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'all' ? t('filterAll') : t(filter === 'pending' ? 'pendingReview' : filter)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDealers.map((dealer) => (
              <div
                key={dealer.dealer_id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-400">ID: {dealer.dealer_id}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        dealer.kyc_status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dealer.kyc_status === 'pending'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {t(dealer.kyc_status === 'pending' ? 'pendingReview' : dealer.kyc_status)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{dealer.business_name}</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{dealer.owner_name}</p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {dealer.phone}
                      </span>
                      <span className="font-bold text-slate-700">{dealer.city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Service Radius</span>
                      <span className="font-bold text-slate-700">{dealer.radius_km} km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Documents</span>
                      <span className="font-bold text-emerald-700">{dealer.kyc_documents.length} uploaded</span>
                    </div>
                  </div>

                  {dealer.kyc_rejection_reason && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                      <strong>Rejection Note:</strong> {dealer.kyc_rejection_reason}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setActiveKycDocModal(dealer)}
                    className="min-h-[44px] flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t('viewDocuments')}
                  </button>

                  {dealer.kyc_status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveKyc(dealer.dealer_id)}
                        className="min-h-[44px] px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95"
                        title={t('approveKyc')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() => handleOpenRejectModal(dealer)}
                        className="min-h-[44px] px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                        title={t('rejectKyc')}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LISTINGS & PICKUPS MONITOR */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('listingsMonitorTitle')}</h2>
              <p className="text-xs text-slate-500">
                Track live scrap requests, active bidding countdowns, accepted dealer pickups, and completed doorsteps.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={listingsCityFilter}
                onChange={(e) => setListingsCityFilter(e.target.value)}
                className="min-h-[42px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="all">All Cities</option>
                {citiesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={listingsStatusFilter}
                onChange={(e) => setListingsStatusFilter(e.target.value)}
                className="min-h-[42px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="open_for_bids">Open for Bids</option>
                <option value="bid_accepted">Accepted / Pickup Scheduled</option>
                <option value="completed">Completed &amp; Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">#{listing.id}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        listing.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : listing.status === 'bid_accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : listing.status === 'open_for_bids'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {listing.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      • {listing.city}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900">{listing.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {listing.address}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {listing.items.map((item) => (
                      <span
                        key={item.id}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl"
                      >
                        {item.category_slug}: <strong>{item.approx_weight_kg} kg</strong>
                      </span>
                    ))}
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-xl">
                      Total: ~{listing.total_approx_weight_kg} kg
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-2">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {listing.highest_bid ? 'Top Bid Amount' : 'Bids'}
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {listing.highest_bid ? `₹${listing.highest_bid}` : `${listing.bids_count} bids`}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Slot: <strong>{listing.preferred_time_slot}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DISPUTES DESK */}
      {/* ========================================================================= */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('disputesTitle')}</h2>
              <p className="text-xs text-slate-500">
                Inspect scale photos, anti-lowball shortfalls, and issue binding resolutions.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
              {(['all', 'open', 'investigating', 'resolved'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDisputesFilter(filter)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    disputesFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{dispute.id}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        dispute.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dispute.status === 'investigating'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {dispute.status}
                    </span>
                    <span className="text-xs font-bold text-slate-700 capitalize">
                      Category: {dispute.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    Pickup ID: <strong className="text-slate-800">{dispute.pickup_id}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-slate-900">Dispute Complaint</h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {dispute.reason}
                    </p>

                    {dispute.shortfall > 0 && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                        <span className="text-amber-900 font-bold">Estimated Shortfall / Discrepancy:</span>
                        <span className="text-amber-900 font-black text-sm">₹{dispute.shortfall}</span>
                      </div>
                    )}

                    {dispute.resolution_outcome && (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                        <div className="font-bold text-emerald-900">
                          Resolution: {dispute.resolution_outcome.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        {dispute.resolution_notes && (
                          <div className="text-emerald-800">{dispute.resolution_notes}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-slate-900">Parties &amp; Scale Evidence</h4>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Seller</span>
                        <strong className="text-slate-800">{dispute.seller_name} ({dispute.seller_phone})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dealer</span>
                        <strong className="text-slate-800">{dispute.dealer_name} ({dispute.dealer_phone})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Evidence Attached</span>
                        <strong className="text-emerald-700">{dispute.evidence_photos.length} photo(s)</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveDisputeModal(dispute)}
                        className="min-h-[44px] flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {t('evidenceAndNotes')} ({dispute.chat_notes.length})
                      </button>

                      {dispute.status !== 'resolved' && (
                        <button
                          onClick={() => {
                            setActiveDisputeModal(dispute);
                          }}
                          className="min-h-[44px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('resolveDispute')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CITY MANDI RATE CARD EDITOR */}
      {/* ========================================================================= */}
      {activeTab === 'ratecard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('rateCardTitle')}</h2>
              <p className="text-xs text-slate-500">
                Set authoritative daily minimum &amp; maximum benchmark scrap rates per kilogram for each city.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">{t('selectCity')}:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => handleSelectCity(e.target.value)}
                  className="min-h-[44px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {citiesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveRateCard}
                className="min-h-[44px] px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('saveRateCard')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rateCards.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 capitalize">{category.name_en}</h3>
                    <p className="text-[11px] text-slate-400">Unit: {category.unit}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {category.slug}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {t('minRate')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        step="0.5"
                        value={category.benchmark_price_min}
                        onChange={(e) =>
                          handleRateChange(category.slug, 'min', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-black text-slate-900 focus:bg-white focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {t('maxRate')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        step="0.5"
                        value={category.benchmark_price_max}
                        onChange={(e) =>
                          handleRateChange(category.slug, 'max', parseFloat(e.target.value) || 0)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-black text-slate-900 focus:bg-white focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Indicative Range:</span>
                  <span className="font-bold text-emerald-700">
                    ₹{category.benchmark_price_min} - ₹{category.benchmark_price_max} / {category.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: USER MANAGEMENT & SUSPENSIONS */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('userManagementTitle')}</h2>
              <p className="text-xs text-slate-500">
                Audit dealer and seller behavior. Instantly suspend accounts violating fair-weighing or pricing standards.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setUserTab('dealers')}
                className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userTab === 'dealers'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('dealersTab')} ({dealers.length})
              </button>
              <button
                onClick={() => setUserTab('sellers')}
                className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  userTab === 'sellers'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('sellersTab')} ({sellers.length})
              </button>
            </div>
          </div>

          {userTab === 'dealers' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dealers.map((dealer) => (
                <div
                  key={dealer.dealer_id}
                  className={`bg-white rounded-3xl p-5 border shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                    dealer.is_suspended
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400">ID: {dealer.dealer_id}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          dealer.is_suspended
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t(dealer.is_suspended ? 'suspendedBadge' : 'activeBadge')}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{dealer.business_name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{dealer.owner_name}</p>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between">
                        <span>Phone</span>
                        <strong className="text-slate-800">{dealer.phone}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>City / Radius</span>
                        <strong className="text-slate-800">{dealer.city} ({dealer.radius_km} km)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Pickups</span>
                        <strong className="text-slate-800">{dealer.total_orders}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Dealer Rating</span>
                        <strong className="text-amber-600 font-bold">★ {dealer.rating}</strong>
                      </div>
                    </div>

                    {dealer.is_suspended && dealer.suspension_reason && (
                      <div className="mt-3 p-2.5 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-900 text-xs">
                        <strong>Suspension Reason:</strong> {dealer.suspension_reason}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {dealer.is_suspended ? (
                      <button
                        onClick={() => handleReactivate(dealer.dealer_id, 'dealer')}
                        className="w-full min-h-[44px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {t('reactivateBtn')}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenSuspendModal(dealer.dealer_id, dealer.business_name, 'dealer')}
                        className="w-full min-h-[44px] px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        {t('suspendBtn')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellers.map((seller) => (
                <div
                  key={seller.seller_id}
                  className={`bg-white rounded-3xl p-5 border shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                    seller.is_suspended
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400">ID: {seller.seller_id}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          seller.is_suspended
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t(seller.is_suspended ? 'suspendedBadge' : 'activeBadge')}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{seller.name}</h3>
                    <p className="text-xs text-slate-500">{seller.phone}</p>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between">
                        <span>City</span>
                        <strong className="text-slate-800">{seller.city}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Listings</span>
                        <strong className="text-slate-800">{seller.total_listings}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Pickups</span>
                        <strong className="text-slate-800">{seller.completed_pickups}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Status</span>
                        <strong className="text-emerald-700 font-bold">Verified Household</strong>
                      </div>
                    </div>

                    {seller.is_suspended && seller.suspension_reason && (
                      <div className="mt-3 p-2.5 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-900 text-xs">
                        <strong>Suspension Reason:</strong> {seller.suspension_reason}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {seller.is_suspended ? (
                      <button
                        onClick={() => handleReactivate(seller.seller_id, 'seller')}
                        className="w-full min-h-[44px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {t('reactivateBtn')}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenSuspendModal(seller.seller_id, seller.name, 'seller')}
                        className="w-full min-h-[44px] px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        {t('suspendBtn')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PLATFORM SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">{t('settingsTitle')}</h2>
              <p className="text-xs text-slate-500">
                Configure commission structure, bidding window timeouts, PostGIS auto-extension parameters, and weight discrepancy thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Commission Percentage */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('commissionPercent')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={settings.commission_percent}
                    onChange={(e) =>
                      setSettings({ ...settings, commission_percent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-500">Recorded in dealer commission ledger per completed pickup.</p>
              </div>

              {/* Fee Waiver Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('commissionWaivedMvp')}
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, commission_waived_in_mvp: !settings.commission_waived_in_mvp })
                    }
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      settings.commission_waived_in_mvp
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    {settings.commission_waived_in_mvp ? '100% Fee Waiver Active (₹0 Collected)' : 'Normal Commission Deduction'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">Promotes initial dealer onboarding without financial friction.</p>
              </div>

              {/* Bid Window Hours */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('bidWindowHours')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.bid_window_default_hours}
                  onChange={(e) =>
                    setSettings({ ...settings, bid_window_default_hours: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">Standard duration for dealers to submit competing rates.</p>
              </div>

              {/* Auto Extend Hours */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('autoExtendHours')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.bid_window_auto_extend_hours}
                  onChange={(e) =>
                    setSettings({ ...settings, bid_window_auto_extend_hours: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">Extended when fewer than 2 offers arrive within initial window.</p>
              </div>

              {/* Default Service Radius */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('serviceRadiusKm')}
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.service_radius_default_km}
                  onChange={(e) =>
                    setSettings({ ...settings, service_radius_default_km: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">Initial search radius for nearby scrap requests.</p>
              </div>

              {/* Expansion Radius */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('expansionRadiusKm')}
                </label>
                <input
                  type="number"
                  step="1"
                  value={settings.service_radius_expansion_km}
                  onChange={(e) =>
                    setSettings({ ...settings, service_radius_expansion_km: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">PostGIS radius widening step (+3 km) upon auto-extension.</p>
              </div>

              {/* Weight Divergence Threshold */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('divergenceThreshold')}
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    step="1"
                    value={settings.weight_divergence_threshold_percent}
                    onChange={(e) =>
                      setSettings({ ...settings, weight_divergence_threshold_percent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  If doorstep weight diverges from estimate by &gt; 15%, seller re-confirmation is triggered.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="min-h-[48px] px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('saveSettings')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW KYC DOCUMENTS */}
      {/* ========================================================================= */}
      {activeKycDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  KYC Dossier: {activeKycDocModal.business_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Dealer: {activeKycDocModal.owner_name} • Phone: {activeKycDocModal.phone}
                </p>
              </div>
              <button
                onClick={() => setActiveKycDocModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">
                Uploaded Verification Documents ({activeKycDocModal.kyc_documents.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeKycDocModal.kyc_documents.map((doc, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="capitalize">{doc.doc_type.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400">
                        {doc.uploaded_at}
                      </span>
                    </div>

                    <div className="h-40 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 relative">
                      <OptimizedImage
                        src={doc.url}
                        alt={doc.doc_type}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveKycDocModal(null)}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                {tCommon('close')}
              </button>

              {activeKycDocModal.kyc_status === 'pending' && (
                <>
                  <button
                    onClick={() => handleOpenRejectModal(activeKycDocModal)}
                    className="min-h-[44px] px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    {t('rejectKyc')}
                  </button>
                  <button
                    onClick={() => handleApproveKyc(activeKycDocModal.dealer_id)}
                    className="min-h-[44px] px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    {t('confirmApprove')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT KYC WITH REASON */}
      {/* ========================================================================= */}
      {rejectionModalDealer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                {t('rejectKyc')}
              </h3>
              <button
                onClick={() => setRejectionModalDealer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please enter the audit rejection reason for <strong>{rejectionModalDealer.business_name}</strong>. The dealer will be notified via SMS.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('rejectionReasonPrompt')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalDealer(null)}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleConfirmRejectKyc}
                className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {t('confirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DISPUTE EVIDENCE & RESOLUTION */}
      {/* ========================================================================= */}
      {activeDisputeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Dispute #{activeDisputeModal.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Pickup Ref: {activeDisputeModal.pickup_id} • Status: {activeDisputeModal.status.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setActiveDisputeModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Evidence Photos */}
            {activeDisputeModal.evidence_photos.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Scale &amp; Doorstep Photos</span>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {activeDisputeModal.evidence_photos.map((url, i) => (
                    <div key={i} className="w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <OptimizedImage src={url} alt={`Evidence photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat / Timeline Log */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Dispute Chat Notes &amp; Audit Trail</span>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-h-48 overflow-y-auto space-y-3">
                {activeDisputeModal.chat_notes.map((note, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs space-y-1 ${
                      note.role === 'admin'
                        ? 'bg-emerald-100/80 text-emerald-950 font-medium'
                        : note.role === 'seller'
                        ? 'bg-blue-50 text-blue-950'
                        : 'bg-amber-50 text-amber-950'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <strong>{note.author} ({note.role.toUpperCase()})</strong>
                      <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p>{note.message}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newChatNote}
                  onChange={(e) => setNewChatNote(e.target.value)}
                  placeholder="Add an admin investigation note or call summary..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChatNote()}
                />
                <button
                  onClick={handleAddChatNote}
                  className="min-h-[40px] px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Add Note
                </button>
              </div>
            </div>

            {/* Resolution Form */}
            {activeDisputeModal.status !== 'resolved' && (
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="font-bold text-xs text-emerald-950 uppercase">{t('resolveDispute')}</h4>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {t('outcomeLabel')}
                  </label>
                  <select
                    value={resolutionOutcome}
                    onChange={(e) => setResolutionOutcome(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="refund_seller_shortfall">{t('outcomeRefund')}</option>
                    <option value="uphold_dealer_payout">{t('outcomeDealerUpheld')}</option>
                    <option value="mutual_settlement">{t('outcomeMutual')}</option>
                    <option value="issue_dealer_warning">{t('outcomeWarning')}</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Resolution notes / UPI settlement transaction reference..."
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleResolveDispute}
                    className="min-h-[44px] px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Resolution
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SUSPEND USER PROMPT */}
      {/* ========================================================================= */}
      {suspensionModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-600" />
                {t('suspendBtn')}
              </h3>
              <button
                onClick={() => setSuspensionModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Suspend account for <strong>{suspensionModalUser.name}</strong> ({suspensionModalUser.type})? This will immediately prevent them from creating listings or placing bids.
            </p>

            <textarea
              rows={3}
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder={t('suspensionReasonPrompt')}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspensionModalUser(null)}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
