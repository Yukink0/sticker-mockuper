import { IconBrandApple, IconBrandWindows } from '@tabler/icons-react';
import type { DeviceType, Maker } from '../../types';

interface Props {
  device: DeviceType;
  maker: Maker;
}

export function DeviceLogo({ device, maker }: Props) {
  const showApple = device === 'ipad' || maker === 'macbook';
  return (
    <div className="sm-logo">
      {showApple ? (
        <IconBrandApple size={28} aria-hidden />
      ) : (
        <IconBrandWindows size={28} aria-hidden />
      )}
    </div>
  );
}
