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
  const isIpad = device === 'ipad';
  // iPadはフレーム幅自体が小さいため、MacBookと同じ倍率だと
  // ロゴがほとんど大きくならない。iPad用に倍率を大きめに設定する。
  const sizeFactor = isIphone ? 0.13 : isIpad ? 0.16 : 0.1;
  const sizeFloor = isIphone ? 20 : isIpad ? 24 : 16;
  const size = Math.round(Math.min(Math.max(frameWidth * sizeFactor, sizeFloor), 38));

  return (
    <>
      {isIpad && (
        // iPad Pro(M4)実機と同じく、単眼カメラ + LiDAR/フラッシュを縦に並べた
        // 丸角の小さなバンプ（本体と同系色、レンズだけ濃色）
        <div className="sm-camera-bump">
          <span className="sm-lens sm-lens--main" />
          <span className="sm-lens sm-lens--flash" />
        </div>
      )}
      {isIphone && iphoneModel === '17' && (
        // iPhone 17（無印）: 縦長長方形の台座に、レンズを縦に2つ並べる
        <div className="sm-camera-island">
          <span className="sm-lens" />
          <span className="sm-lens" />
        </div>
      )}
      {isIphone && iphoneModel === '17pro' && (
        // iPhone 17 Pro: 本体と質感の異なる全幅プレートの中で、
        // 3眼レンズを「縦2つ＋横に1つ」のL字（三角形）配置にする
        <div className="sm-camera-plateau">
          <span className="sm-lens sm-lens--tri-1" />
          <span className="sm-lens sm-lens--tri-2" />
          <span className="sm-lens sm-lens--tri-3" />
          <span className="sm-lens sm-lens--flash sm-lens--plateau-flash" />
        </div>
      )}
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
