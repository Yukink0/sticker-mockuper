// バレル(@tabler/icons-react)からの名前付きimportは、本番ビルド時に数千個ある
// アイコンファイルすべてを解決しようとして極端に遅くなるため、個別ファイルから直接importする
import IconDeviceLaptop from '@tabler/icons-react/dist/esm/icons/IconDeviceLaptop.mjs';
import IconDeviceTablet from '@tabler/icons-react/dist/esm/icons/IconDeviceTablet.mjs';
import IconLuggage from '@tabler/icons-react/dist/esm/icons/IconLuggage.mjs';
import type { DeviceType } from '../../types';

interface Props {
  device: DeviceType;
  onSelect: (device: DeviceType) => void;
}

export function DeviceSelector({ device, onSelect }: Props) {
  return (
    <div>
      <div className="sm-label">デバイス</div>
      <div className="sm-btn-row">
        <button
          className={`sm-btn${device === 'pc' ? ' active' : ''}`}
          onClick={() => onSelect('pc')}
        >
          <IconDeviceLaptop size={14} aria-hidden />
          PC
        </button>
        <button
          className={`sm-btn${device === 'ipad' ? ' active' : ''}`}
          onClick={() => onSelect('ipad')}
        >
          <IconDeviceTablet size={14} aria-hidden />
          iPad
        </button>
        <button className="sm-btn" disabled title="近日対応">
          <IconLuggage size={14} aria-hidden />
          スーツケース
        </button>
      </div>
    </div>
  );
}
