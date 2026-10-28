import { AlertTriangle, FileText, Banknote } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Prominent Legal Disclaimer Banner */}
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
              <strong>Disclaimer:</strong> This is a draft template created for the RaddiBhaav MVP release and requires formal legal review and adaptation by qualified Indian legal counsel under the Information Technology Act, 2000, and the Consumer Protection (E-Commerce) Rules, 2020 before commercial public launch.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
          <FileText className="w-3.5 h-3.5" />
          Terms of Service & User Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: October 2026 • Effective for all household sellers and scrap dealers on RaddiBhaav
        </p>
      </div>

      {/* Terms Content Sections */}
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">1</span>
            Nature of the Platform
          </h2>
          <p>
            RaddiBhaav operates strictly as an intermediary technology aggregator connecting household scrap sellers (&quot;Sellers&quot;) with independent, verified neighborhood scrap collectors and dealers (&quot;Dealers&quot; or &quot;Kabadiwalas&quot;). RaddiBhaav is <strong>not</strong> a buyer, dealer, broker, or recycler of scrap materials itself.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">2</span>
            Direct Doorstep Payment (Non-Custodial)
          </h2>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <Banknote className="w-4 h-4 text-emerald-600" />
              Direct Hand-to-Hand Settlement Rule
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              RaddiBhaav does not collect, hold, or escrow the seller&apos;s payout at any point. All transactions are settled directly between the Dealer and the Seller at the doorstep upon completion of physical weigh-in, either in physical Indian Currency (Cash) or through direct Peer-to-Peer UPI transfer.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">3</span>
            Weighing, Rate Cards & Weight Variance Rule
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Mandatory Certified Scale:</strong> All participating dealers agree to utilize digital scales calibrated in accordance with the Legal Metrology Act, 2009.
            </li>
            <li>
              <strong>15% Weight Variance Protection:</strong> Estimated weights entered by the seller in the app are approximate. The final payable amount is computed from actual doorstep weight. If the actual weighed scrap differs by more than 15% from the initial estimate, either party may re-negotiate or cancel without penalty.
            </li>
            <li>
              <strong>Anti-Lowball Benchmark:</strong> Dealers are prohibited from predatory under-quoting below prevailing Mandi benchmark rates.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">4</span>
            Prohibited Items & Hazardous Materials
          </h2>
          <p>
            Users are strictly prohibited from listing or exchanging:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Stolen property or public utility property (e.g. railway tracks, municipal streetlights, cables).</li>
            <li>Hazardous chemicals, explosive canisters, bio-medical waste, or untreated lead acid batteries.</li>
            <li>Weapons, ammunition, or contraband under Indian law.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white inline-flex items-center justify-center text-xs">5</span>
            Both-Way Ratings & Conduct
          </h2>
          <p>
            To maintain neighborhood trust, both Sellers and Dealers are rated after every pickup. Submitting ratings of 1 or 2 stars mandates specifying a legitimate reason (e.g. scale calibration dispute, payment dispute, or no-show). Repeated abusive cancellations or non-fulfillment will result in suspension.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-slate-200 flex flex-wrap gap-4 text-xs font-bold text-emerald-800">
        <Link href="/privacy" className="hover:underline">Privacy Policy →</Link>
        <Link href="/dealer-agreement" className="hover:underline">Dealer Agreement →</Link>
        <Link href="/" className="text-slate-500 hover:text-slate-900 ml-auto">Back to Home</Link>
      </div>
    </div>
  );
}
