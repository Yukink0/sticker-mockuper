import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { TRANSLATIONS } from './translations';
import type { Lang, Messages } from './translations';

const STORAGE_KEY = 'sm-lang';

function isLang(value: string | null): value is Lang {
  return value === 'ja' || value === 'en' || value === 'ko';
}

// 言語ごとにURLを分けている（/ = 日本語, /en/, /ko/）。SNSでシェアされたURLの
// 言語で開けるよう、URLの言語を最優先にする
function langFromPath(): Lang | null {
  const m = window.location.pathname.match(/^\/(en|ko)(\/|$)/);
  return m ? (m[1] as Lang) : null;
}

function pathForLang(lang: Lang): string {
  return lang === 'ja' ? '/' : `/${lang}/`;
}

// URLの言語 → 前回選んだ言語 → ブラウザの言語設定 → 日本語 の順で初期言語を決める
function detectInitialLang(): Lang {
  const fromPath = langFromPath();
  if (fromPath) return fromPath;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // localStorageが使えない環境ではそのまま次の判定へ
  }
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('en')) return 'en';
  return 'ja';
}

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Messages;
}

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  function setLang(next: Lang) {
    setLangState(next);
    // コピーしたURLをシェアしたときに、その言語のOGPカードが出るようURLも合わせる
    if (window.location.pathname !== pathForLang(next)) {
      window.history.replaceState(null, '', pathForLang(next) + window.location.search);
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存できなくても表示言語の切り替え自体は行う
    }
  }

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
