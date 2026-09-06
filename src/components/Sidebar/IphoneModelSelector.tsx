import { IPHONE_MODELS, IPHONE_MODEL_LABELS } from '../../config/devices';
import type { IphoneModel } from '../../types';

interface Props {
  model: IphoneModel;
  onSelect: (model: IphoneModel) => void;
}

export function IphoneModelSelector({ model, onSelect }: Props) {
  return (
    <div>
      <div className="sm-label">モデル</div>
      <div className="sm-btn-row">
        {IPHONE_MODELS.map((m) => (
          <button
            key={m}
            className={`sm-btn${m === model ? ' active' : ''}`}
            onClick={() => onSelect(m)}
          >
            {IPHONE_MODEL_LABELS[m].replace('iPhone ', '')}
          </button>
        ))}
      </div>
    </div>
  );
}
