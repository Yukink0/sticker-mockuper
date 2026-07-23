import type { Maker } from '../../types';

interface Props {
  maker: Maker;
  onSelect: (maker: Maker) => void;
}

export function MakerSelector({ maker, onSelect }: Props) {
  return (
    <div>
      <div className="sm-label">メーカー</div>
      <div className="sm-btn-row">
        <button
          className={`sm-btn${maker === 'macbook' ? ' active' : ''}`}
          onClick={() => onSelect('macbook')}
        >
          MacBookバージョン
        </button>
        <button
          className={`sm-btn${maker === 'surface' ? ' active' : ''}`}
          onClick={() => onSelect('surface')}
        >
          Surfaceバージョン
        </button>
      </div>
    </div>
  );
}
