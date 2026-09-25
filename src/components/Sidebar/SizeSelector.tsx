import { getSizesForMaker } from '../../config/devices';
import type { Maker, MacbookSize, SurfaceSize } from '../../types';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  maker: Maker;
  size: MacbookSize | SurfaceSize;
  onSelect: (size: MacbookSize | SurfaceSize) => void;
}

export function SizeSelector({ maker, size, onSelect }: Props) {
  const { t } = useLang();
  const sizes = getSizesForMaker(maker);

  return (
    <div>
      <div className="sm-label">{t.size}</div>
      <div className="sm-btn-row">
        {sizes.map((s) => (
          <button
            key={s}
            className={`sm-btn${s === size ? ' active' : ''}`}
            onClick={() => onSelect(s)}
          >
            {s}"
          </button>
        ))}
      </div>
    </div>
  );
}
