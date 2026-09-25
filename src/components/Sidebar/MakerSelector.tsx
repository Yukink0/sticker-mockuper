import type { Maker } from '../../types';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  maker: Maker;
  onSelect: (maker: Maker) => void;
}

export function MakerSelector({ maker, onSelect }: Props) {
  const { t } = useLang();
  return (
    <div>
      <div className="sm-label">{t.maker}</div>
      <div className="sm-btn-row">
        <button
          className={`sm-btn${maker === 'macbook' ? ' active' : ''}`}
          onClick={() => onSelect('macbook')}
        >
          {t.macbookVersion}
        </button>
        <button
          className={`sm-btn${maker === 'surface' ? ' active' : ''}`}
          onClick={() => onSelect('surface')}
        >
          {t.surfaceVersion}
        </button>
      </div>
    </div>
  );
}
