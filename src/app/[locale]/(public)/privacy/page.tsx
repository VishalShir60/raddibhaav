import { AlertTriangle, ShieldCheck, EyeOff } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function PrivacyPolicyPage() {
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
              <strong>Disclaimer:</strong> This Privacy Policy is a draft template created for the RaddiBhaav MVP release and requires formal legal review and adaptation by qualified Indian legal counsel under the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Rules, 2011 before commercial public launch.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          Privacy & Data Protection Policy
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: October 2026 • How RaddiBhaav protects household sellers and neighborhood dealers
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">1</span>
            Information We Collect
          </h2>
          <p>
            To facilitate fair and transparent scrap trade, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Phone Number:</strong> Used exclusively for SMS/WhatsApp OTP authentication and transactional alerts.</li>
            <li><strong>Hyperlocal Location:</strong> GPS coordinates and neighborhood address used to calculate distance to nearby approved dealers.</li>
            <li><strong>Scrap Photos & Weights:</strong> Uploaded images and category weights for dealer inspection and scrap valuation.</li>
            <li><strong>Dealer KYC Documents:</strong> Government photo ID, shop license/establishment photo for dealer verification.</li>
          </ul>
        </section>

        {/* Section 2: Contact Masking */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">2</span>
            Phone Number Masking & Gated Contact Policy
          </h2>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              Pre-Acceptance Contact Privacy
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              During the open bidding window, your phone number is <strong>strictly masked</strong> (e.g. <code>+91 98XXX XXXXX</code>). Competing dealers cannot view your telephone number or exact apartment number until you explicitly accept their offer.
            </p>
            <p className="text-xs text-slate-500">
              Note on call masking: In our initial MVP release, unmasked phone call intents are revealed only to the winning dealer upon offer acceptance. Direct voice proxy bridging (Exotel / Twilio virtual numbers) is architected for Phase 2 scaling under TRAI regulations.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">3</span>
            How We Use Your Data
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Matching scrap requests with nearby KYC-approved dealers within a 5 km service radius.</li>
            <li>Real-time push and in-app notifications regarding competing bids, outbids, and pickup arrival.</li>
            <li>Fraud prevention, rate-limit enforcement, and abuse detection.</li>
            <li>Platform safety and dispute resolution.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">4</span>
            Data Storage & Indian Data Protection Compliance
          </h2>
          <p>
            All data is encrypted in transit (TLS 1.3) and at rest. We adhere to the core principles of India&apos;s Digital Personal Data Protection Act, 2023:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>No sharing or selling of user personal data to third-party telemarketers or ad brokers.</li>
            <li>Dealers are restricted from retaining or misusing seller contact details after pickup completion.</li>
            <li>Right to erasure: Users may request deletion of their account profile and historical listings by contacting support.</li>
          </ul>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-bold text-emerald-800">
        <Link href="/terms" className="hover:underline">Terms of Service →</Link>
        <Link href="/dealer-agreement" className="hover:underline">Dealer Agreement →</Link>
        <Link href="/" className="text-slate-500 hover:text-slate-900 ml-auto">Back to Home</Link>
      </div>
    </div>
  );
}
