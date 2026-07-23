import { IconBrandApple, IconBrandWindows } from '@tabler/icons-react';
import type { DeviceType, Maker } from '../../types';

interface Props {
  device: DeviceType;
  maker: Maker;
  frameWidth: number;
}

export function DeviceLogo({ device, maker, frameWidth }: Props) {
  const showApple = device === 'ipad' || maker === 'macbook';
  const size = Math.round(Math.min(Math.max(frameWidth * 0.09, 20), 36));

  return (
    <>
      {device === 'ipad' && <span className="sm-camera" />}
      <div className="sm-logo">
        {showApple ? (
          <IconBrandApple size={size} aria-hidden />
        ) : (
          <IconBrandWindows size={size} aria-hidden />
        )}
      </div>
    </>
  );
}
