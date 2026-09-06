export type DeviceType = 'pc' | 'ipad' | 'iphone';

export type Maker = 'macbook' | 'surface';

export type MacbookSize = '13' | '14' | '16';
export type SurfaceSize = '13.5' | '15';
export type Size = MacbookSize | SurfaceSize;

export type IphoneModel = '17' | '17pro';

export interface StickerItem {
  id: string;
  src: string;
  /** 元画像の 幅/高さ。配置時に正しい縦横比の箱を作るために使う */
  aspectRatio: number;
}

export interface PlacedSticker {
  id: string;
  src: string;
  aspectRatio: number;
  /** モックアップ枠の幅に対する相対位置・サイズ(%) */
  xPct: number;
  /** モックアップ枠の高さに対する相対位置(%) */
  yPct: number;
  wPct: number;
  hPct: number;
  rotationDeg: number;
}
