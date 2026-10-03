import { useI18n } from '../i18n';
import { SOURCES } from '../engine/sources';

export function About() {
  const { t } = useI18n();
  return (
    <div>
      <h2>{t('about.title')}</h2>
      <section className="card">
        <p>{t('about.body')}</p>
        <p><strong>{t('about.disclaimer')}</strong></p>
        <p>{t(__AI_ASSISTANT__ ? 'about.privacy' : 'about.privacyLocal')}</p>
        <p className="muted">{t('about.translation')}</p>
      </section>
      <section className="card">
        <h3>{t('about.sources')}</h3>
        <ul className="sources" dir="ltr">
          {Object.values(SOURCES).map((s) => (
            <li key={s.id}>
              {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.org}</a> : s.org} — {s.title} ({s.year})
            </li>
          ))}
        </ul>
      </section>
      <p className="muted small" dir="ltr">Version {__APP_VERSION__}</p>
    </div>
  );
}
