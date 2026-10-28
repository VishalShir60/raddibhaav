import { RaddiCalculator } from '@/components/calculator/RaddiCalculator';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function CalculatorPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <RaddiCalculator />
    </div>
  );
}
