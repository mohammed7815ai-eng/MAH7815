import { useState } from 'react';
import { useI18n } from '../i18n';
import { getServerLink, normalizeServerLink, saveServerLink } from '../server';

export function Settings() {
  const { t } = useI18n();
  const [link, setLink] = useState(getServerLink);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const save = () => {
    const clean = normalizeServerLink(link);
    if (clean == null) return setMsg({ kind: 'error', text: t('settings.invalid') });
    saveServerLink(clean);
    setLink(clean);
    setMsg({ kind: 'ok', text: t(clean ? 'settings.saved' : 'settings.cleared') });
  };

  return (
    <div>
      <h2>{t('settings.title')}</h2>
      <section className="card">
        <form className="server-form" noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
          <label className="field">
            <span>{t('settings.serverLink')}</span>
            <input
              type="url"
              dir="ltr"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              placeholder="https://example.org/api/screening"
              value={link}
              onChange={(e) => { setLink(e.target.value); setMsg(null); }}
            />
          </label>
          <p className="muted small">{t('settings.serverHint')}</p>
          <div className="actions">
            <button type="submit" className="primary">{t('settings.save')}</button>
          </div>
          {msg && <p className={msg.kind === 'ok' ? 'saved' : 'error'} role="status">{msg.text}</p>}
        </form>
      </section>
    </div>
  );
}
