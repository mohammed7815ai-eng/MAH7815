import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useI18n } from '../i18n';
import { Flag } from './Flag';

import { SHARE_URL } from '../edition';

export { SHARE_URL };
export const DEVELOPER = 'Dr. Mohammed A Hassan';

/** Links that open each app's own share screen with the message and link filled in. */
export function shareLinks(text: string, url: string, title: string) {
  const msg = encodeURIComponent(`${text} ${url}`);
  return [
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${msg}` },
    { id: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { id: 'viber', label: 'Viber', href: `viber://forward?text=${msg}` },
    { id: 'email', label: '', href: `mailto:?subject=${encodeURIComponent(title)}&body=${msg}` },
  ];
}

export function Footer() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState(false);
  const data = { title: t('app.title'), text: t('share.text'), url: SHARE_URL };

  // Android app: the phone's own share sheet. Phones and browsers with Web Share: the same.
  // Everywhere else (Windows app, desktop browsers, previews where sharing is blocked): a panel of share buttons.
  const share = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({ ...data, dialogTitle: t('share.button') });
        return;
      } catch (e) {
        if (String(e).toLowerCase().includes('cancel')) return;
      }
    } else if (navigator.share && navigator.canShare?.(data) !== false) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') return; // the user closed the share sheet
      }
    }
    setPanel((p) => !p);
  };

  const copy = async () => {
    const value = `${data.text} ${SHARE_URL}`;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <footer className="site-footer">
      <div className="share-wrap no-print">
        <button type="button" className="share" onClick={share} aria-expanded={panel}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path fill="currentColor" d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z" />
          </svg>
          {t('share.button')}
        </button>
        {panel && (
          <div className="share-panel" role="dialog" aria-label={t('share.button')}>
            <div className="share-links">
              {shareLinks(data.text, SHARE_URL, data.title).map((l) => (
                <a key={l.id} className={`share-link ${l.id}`} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label || t('share.email')}
                </a>
              ))}
              <button type="button" className="share-link copy" onClick={copy}>{t('share.copy')}</button>
            </div>
            <p className="share-url" dir="ltr">{SHARE_URL}</p>
            {copied && <p className="notice" role="status">{t('share.copied')}</p>}
            <button type="button" className="link" onClick={() => setPanel(false)}>{t('share.close')}</button>
          </div>
        )}
      </div>
      <div className="credit">
        <Flag width={30} />
        <span>
          {t('footer.developedBy')} <strong dir="ltr">{DEVELOPER}</strong>
        </span>
      </div>
    </footer>
  );
}
