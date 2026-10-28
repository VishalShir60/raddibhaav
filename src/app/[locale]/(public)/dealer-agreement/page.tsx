import { AlertTriangle, Store, Scale } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function DealerAgreementPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Legal Review Notice */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-amber-200/80 text-amber-900 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-black text-amber-950 uppercase tracking-wide">
              Legal Review Notice
            </h2>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              <strong>Disclaimer:</strong> This Dealer Partner Agreement is a draft template created for the RaddiBhaav MVP release and requires formal legal review and adaptation by qualified Indian legal counsel specializing in marketplace vendor agreements before onboarding commercial dealers.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
          <Store className="w-3.5 h-3.5" />
          Kabadiwala & Scrap Merchant Onboarding Terms
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Dealer Partner Agreement
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: October 2026 • Mandatory terms governing verified dealers on the RaddiBhaav network
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">1</span>
            KYC Verification & Eligibility
          </h2>
          <p>
            To activate bidding privileges on RaddiBhaav, every scrap merchant or collector must complete verification by providing:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Valid government-issued identity proof (Aadhaar Card, Voter ID, or Driving License).</li>
            <li>Shop establishment license, municipal trade certificate, or verifiable physical shop photograph.</li>
            <li>Designated service radius (1 to 15 km) centered on their registered shop coordinates.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">2</span>
            Mandatory Electronic Scale & Fair Weighing
          </h2>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Scale className="w-4 h-4 text-emerald-600" />
              Legal Metrology Compliance
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              The Dealer covenants to carry an electronic digital hanging or platform scale with clear zero-tare functionality on all doorstep pickups. Using tampered mechanical spring balances or manipulated scales constitutes immediate grounds for permanent blacklisting.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">3</span>
            Binding Offer & Payout Execution
          </h2>
          <p>
            When a Dealer submits a bid, the per-kg rates quoted become legally binding upon seller acceptance. The Dealer must:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Honor the quoted category rates and compute payout using exact doorstep weighed kilograms.</li>
            <li>Disburse payment instantly in cash or direct UPI to the seller before removing scrap from the premises.</li>
            <li>Adhere to agreed pickup time windows; failure to arrive within 60 minutes of the slot without prior communication damages dealer reliability score.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">4</span>
            Commission Ledger & Platform Fee (MVP Policy)
          </h2>
          <p>
            During the RaddiBhaav MVP phase, a nominal platform commission is recorded in the dealer ledger for accounting transparency, but is <strong>zero-fee / not collected</strong>. Dealers will receive 30 days prior written notice before any commercial fee collection begins.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">5</span>
            Code of Conduct & Penalties
          </h2>
          <p>
            Dealers agree to conduct themselves professionally. Harassment of sellers, predatory under-weighing, or offline poaching will trigger immediate account suspension and forfeiture of referral badges.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-bold text-emerald-800">
        <Link href="/terms" className="hover:underline">Terms of Service →</Link>
        <Link href="/privacy" className="hover:underline">Privacy Policy →</Link>
        <Link href="/" className="text-slate-500 hover:text-slate-900 ml-auto">Back to Home</Link>
      </div>
    </div>
  );
}
