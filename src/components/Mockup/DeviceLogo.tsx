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
        // iPhone 17（無印）: 大きめの角丸スクエアに、斜め配置の2眼＋フラッシュ
        <div className="sm-camera-island">
          <span className="sm-lens sm-lens--tl" />
          <span className="sm-lens sm-lens--br" />
          <span className="sm-lens sm-lens--flash sm-lens--island-flash" />
        </div>
      )}
      {isIphone && iphoneModel === '17pro' && (
        // iPhone 17 Pro: 本体と質感の異なる全幅プレートが滑らかな曲線で
        // ボディに繋がり、横一列の3眼＋右上に小さなセンサー/フラッシュ
        <div className="sm-camera-plateau">
          <span className="sm-lens" />
          <span className="sm-lens" />
          <span className="sm-lens" />
          <span className="sm-lens sm-lens--flash sm-lens--plateau-flash" />
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
