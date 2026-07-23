import type { Maker, MacbookSize, SurfaceSize } from '../types';

/**
 * 実機の天板寸法の目安（mm, 横 x 縦）。要件定義書「6. 参考：デバイスごとのアスペクト比」より。
 * 同じスケール係数で全デバイスをpx換算することで、縦横比だけでなく
 * 「16インチは13インチより一回り大きい」という実寸感も表現する。
 */
const MACBOOK_DIMENSIONS_MM: Record<MacbookSize, { w: number; h: number }> = {
  '13': { w: 304, h: 212 },
  '14': { w: 313, h: 221 },
  '16': { w: 356, h: 248 },
};

const SURFACE_DIMENSIONS_MM: Record<SurfaceSize, { w: number; h: number }> = {
  '13.5': { w: 308, h: 223 },
  '15': { w: 339, h: 244 },
};

// iPad Pro 11インチ相当の目安（縦持ち, mm）
const IPAD_DIMENSIONS_MM = { w: 178.5, h: 247.6 };

export const MACBOOK_SIZES: MacbookSize[] = ['13', '14', '16'];
export const SURFACE_SIZES: SurfaceSize[] = ['13.5', '15'];

/** mm -> px 換算係数。全デバイス共通で、実寸の相対感を保つ。 */
const MM_TO_PX_SCALE = 1.05;

export function getFrameSize(
  device: 'pc' | 'ipad',
  maker: Maker,
  size: MacbookSize | SurfaceSize,
): { width: number; height: number } {
  const dimsMm =
    device === 'ipad'
      ? IPAD_DIMENSIONS_MM
      : maker === 'macbook'
        ? MACBOOK_DIMENSIONS_MM[size as MacbookSize]
        : SURFACE_DIMENSIONS_MM[size as SurfaceSize];

  return {
    width: Math.round(dimsMm.w * MM_TO_PX_SCALE),
    height: Math.round(dimsMm.h * MM_TO_PX_SCALE),
  };
}

export function getSizesForMaker(maker: Maker): (MacbookSize | SurfaceSize)[] {
  return maker === 'macbook' ? MACBOOK_SIZES : SURFACE_SIZES;
}

export function getDefaultSize(maker: Maker): MacbookSize | SurfaceSize {
  return maker === 'macbook' ? '14' : '13.5';
}
