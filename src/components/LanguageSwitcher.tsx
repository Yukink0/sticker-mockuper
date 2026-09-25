import { useLang } from '../i18n/LanguageContext';
import { LANGS } from '../i18n/translations';

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLang();

  return (
    <div className="sm-lang" role="group" aria-label={t.language}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={`sm-lang-btn${l.code === lang ? ' active' : ''}`}
          aria-pressed={l.code === lang}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
