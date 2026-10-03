import { useI18n } from '../i18n';

const CANCERS = ['breast', 'cervical', 'colorectal', 'lung', 'prostate'] as const;

export function Learn() {
  const { t } = useI18n();
  return (
    <div>
      <h2>{t('learn.title')}</h2>
      <p className="lead">{t('learn.intro')}</p>
      {CANCERS.map((c) => (
        <details key={c} className="card learn">
          <summary><h3>{t(`cancer.${c}`)}</h3></summary>
          <h4>{t('learn.risk')}</h4>
          <p>{t(`learn.${c}.risk`)}</p>
          <h4>{t('learn.signs')}</h4>
          <p>{t(`learn.${c}.signs`)}</p>
          <h4>{t('learn.prevent')}</h4>
          <p>{t(`learn.${c}.prevent`)}</p>
        </details>
      ))}
    </div>
  );
}
