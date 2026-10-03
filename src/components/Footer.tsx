import { useState } from 'react';
import { useI18n } from '../i18n';
import { KurdistanFlag } from './KurdistanFlag';

/** Public address of the website, used by the share button. */
export const SHARE_URL = 'https://mohammed7815ai-eng.github.io/MAH7815/';
export const DEVELOPER = 'Dr. Mohammed A Hassan';

export function Footer() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const data = { title: t('app.title'), text: t('share.text'), url: SHARE_URL };
    try {
      if (navigator.share) return await navigator.share(data);
    } catch {
      return; // user closed the share sheet
    }
    try {
      await navigator.clipboard.writeText(`${data.text} ${SHARE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      window.prompt(t('share.button'), SHARE_URL);
    }
  };

  return (
    <footer className="site-footer">
      <button type="button" className="share no-print" onClick={share}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path fill="currentColor" d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z" />
        </svg>
        {copied ? t('share.copied') : t('share.button')}
      </button>
      <div className="credit">
        <KurdistanFlag width={30} />
        <span>
          {t('footer.developedBy')} <strong dir="ltr">{DEVELOPER}</strong>
        </span>
      </div>
    </footer>
  );
}
