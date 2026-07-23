export type DeviceType = 'pc' | 'ipad';

export type Maker = 'macbook' | 'surface';

export type MacbookSize = '13' | '14' | '16';
export type SurfaceSize = '13.5' | '15';
export type Size = MacbookSize | SurfaceSize;

export interface StickerItem {
  id: string;
  src: string;
}

export interface PlacedSticker {
  id: string;
  src: string;
  /** モックアップ枠の幅に対する相対位置・サイズ(%) */
  xPct: number;
  /** モックアップ枠の高さに対する相対位置(%) */
  yPct: number;
  wPct: number;
  hPct: number;
}
