import IconBrandApple from '@tabler/icons-react/dist/esm/icons/IconBrandApple.mjs';
import IconBrandWindows from '@tabler/icons-react/dist/esm/icons/IconBrandWindows.mjs';
import type { DeviceType, Maker, IphoneModel } from '../../types';

interface Props {
  device: DeviceType;
  maker: Maker;
  iphoneModel: IphoneModel;
  frameWidth: number;
}

export function DeviceLogo({ device, maker, iphoneModel, frameWidth }: Props) {
  const showApple = device !== 'pc' || maker === 'macbook';
  const isIphone = device === 'iphone';
  const size = Math.round(
    Math.min(Math.max(frameWidth * (isIphone ? 0.06 : 0.09), 14), 36),
  );

  return (
    <>
      {device === 'ipad' && <span className="sm-camera" />}
      {isIphone && iphoneModel === '17' && (
        <div className="sm-camera-island">
          <span className="sm-camera-lens" />
          <span className="sm-camera-lens" />
        </div>
      )}
      {isIphone && iphoneModel === '17pro' && (
        <div className="sm-camera-plateau">
          <span className="sm-camera-lens" />
          <span className="sm-camera-lens" />
          <span className="sm-camera-lens" />
        </div>
      )}
      <div className={`sm-logo${isIphone ? ' sm-logo--iphone' : ''}`}>
        {showApple ? (
          <IconBrandApple size={size} aria-hidden />
        ) : (
          <IconBrandWindows size={size} aria-hidden />
        )}
      </div>
    </>
  );
}
