import { useTranslations } from 'next-intl';
import { DealerHubView } from '@/components/dealer/DealerHubView';

export default function DealerPage() {
  const t = useTranslations('dealer');

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('subtitle')}
        </p>
      </div>

      <DealerHubView />
    </div>
  );
}
