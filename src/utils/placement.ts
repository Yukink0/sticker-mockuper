const INITIAL_WIDTH_PCT = 14;
// フレームをoverflow:hiddenでクリップしているため、選択枠/削除・リサイズハンドルが
// 縁で見切れないよう、配置可能な範囲に少し余白を持たせる
export const EDGE_MARGIN_PX = 10;
// 小さすぎるとリサイズ/削除ハンドルが掴みにくくなるための下限
export const MIN_STICKER_SIZE_PX = 28;

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

/**
 * ポインターを離した位置（clientX/clientY）を中心に、画像本来の縦横比を
 * 保ったまま初期サイズ・位置（%）を計算する。マウスのドラッグ&ドロップ、
 * タッチでのポインタードラッグの両方から共通で使う。
 */
export function computeInitialPlacement(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  aspectRatio: number,
) {
  const wPct = INITIAL_WIDTH_PCT;
  const wPx = (wPct / 100) * rect.width;
  const hPx = wPx / aspectRatio;
  const hPct = (hPx / rect.height) * 100;
  const xPx = clamp(clientX - rect.left - wPx / 2, EDGE_MARGIN_PX, rect.width - wPx - EDGE_MARGIN_PX);
  const yPx = clamp(clientY - rect.top - hPx / 2, EDGE_MARGIN_PX, rect.height - hPx - EDGE_MARGIN_PX);

  return {
    xPct: (xPx / rect.width) * 100,
    yPct: (yPx / rect.height) * 100,
    wPct,
    hPct,
  };
}
