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
  const size = Math.round(Math.min(Math.max(frameWidth * (isIphone ? 0.06 : 0.09), 14), 36));

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
        // iPhone 17（無印）は縦2眼の伝統的なカメラアイランド
        <div className="sm-camera-island">
          <span className="sm-lens" />
          <span className="sm-lens" />
        </div>
      )}
      {isIphone && iphoneModel === '17pro' && (
        // iPhone 17 Proは本体と同色の横長プレート（黒い別パーツではない）に
        // 3眼レンズが並ぶ新デザイン
        <div className="sm-camera-plateau">
          <span className="sm-lens" />
          <span className="sm-lens" />
          <span className="sm-lens" />
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
