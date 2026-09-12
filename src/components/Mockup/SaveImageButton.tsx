import { useState } from 'react';
import type { RefObject } from 'react';
import html2canvas from 'html2canvas';
import IconDownload from '@tabler/icons-react/dist/esm/icons/IconDownload.mjs';
import { clamp } from '../../utils/placement';
import qrCode from '../../assets/qrcode.png';

interface Props {
  targetRef: RefObject<HTMLDivElement | null>;
  deviceLabel: string;
  onBeforeCapture: () => void;
}

const BRAND_PINK = '#ff6fa5';
const BRAND_INDIGO = '#18016c';
const CARD_BG = '#f4f2ee';

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 撮影したモックアップ画像に、左上のデバイス名・右下のブランド表記・
 * 左下のQRコードを添えた「作品カード」を合成する。SNS等でそのまま
 * シェアされることを想定した名刺代わりの見た目にするための加工。
 */
async function composeBrandedCard(deviceCanvas: HTMLCanvasElement, deviceLabel: string) {
  const qrImg = await loadImage(qrCode);

  // デバイスの大小（MacBook〜iPhone）で見栄えが崩れないよう、
  // 余白・文字サイズはすべてキャプチャ画像の幅を基準にした相対値にする
  const padding = clamp(deviceCanvas.width * 0.11, 36, 90);
  const labelFontPx = clamp(deviceCanvas.width * 0.085, 20, 46);
  const footerBrandPx = clamp(deviceCanvas.width * 0.055, 14, 26);
  const footerSubPx = footerBrandPx * 0.62;
  const qrSize = clamp(deviceCanvas.width * 0.15, 44, 84);

  try {
    await Promise.all([
      document.fonts.load(`${labelFontPx}px Monoton`),
      document.fonts.load(`${footerBrandPx}px Rosario`),
      document.fonts.load(`${footerSubPx}px Rosario`),
    ]);
  } catch {
    // フォントの先読みに失敗しても、代替フォントで描画を続ける
  }

  const labelAreaH = labelFontPx * 1.7;
  const footerH = Math.max(qrSize, footerBrandPx + footerSubPx + 10) * 1.2;
  const gapTop = labelAreaH * 0.35;
  const gapBottom = footerH * 0.3;
  const footerGap = qrSize * 0.4;
  const brandText = 'STICKER MOCKUPER';

  // 文字幅の計測用に、まだサイズを決めていない仮のコンテキストを使う
  const measureCtx = document.createElement('canvas').getContext('2d')!;
  measureCtx.font = `${footerBrandPx}px 'Rosario', sans-serif`;
  const brandWidth = measureCtx.measureText(brandText).width;
  measureCtx.font = `${labelFontPx}px Monoton, cursive`;
  const labelWidth = measureCtx.measureText(deviceLabel).width;

  // iPhoneのような横幅の狭いデバイスでは、QRコードとブランド文字が並ぶのに
  // 必要な幅がモックアップ自体の幅を超えることがある。その場合はコンテンツ幅を
  // footer側に合わせて広げ、モックアップを中央寄せすることで重なりを防ぐ
  const footerRowWidth = qrSize + footerGap + brandWidth;
  const contentWidth = Math.max(deviceCanvas.width, footerRowWidth, labelWidth);

  const cardW = contentWidth + padding * 2;
  const cardH = padding * 2 + labelAreaH + gapTop + deviceCanvas.height + gapBottom + footerH;

  const card = document.createElement('canvas');
  card.width = cardW;
  card.height = cardH;
  const ctx = card.getContext('2d');
  if (!ctx) return deviceCanvas;

  roundRectPath(ctx, 0, 0, cardW, cardH, clamp(deviceCanvas.width * 0.035, 14, 32));
  ctx.fillStyle = CARD_BG;
  ctx.fill();

  // 左上：デバイス名（Monotonのブロック体＋ブランドカラーのグラデーション）
  ctx.font = `${labelFontPx}px Monoton, cursive`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const labelGrad = ctx.createLinearGradient(padding, 0, padding + labelWidth, 0);
  labelGrad.addColorStop(0, BRAND_PINK);
  labelGrad.addColorStop(1, BRAND_INDIGO);
  ctx.fillStyle = labelGrad;
  ctx.fillText(deviceLabel, padding, padding + labelAreaH / 2);

  // 中央：撮影したモックアップ本体（コンテンツ幅の方が広い場合は水平中央寄せ）
  const mockupX = padding + (contentWidth - deviceCanvas.width) / 2;
  const mockupY = padding + labelAreaH + gapTop;
  ctx.drawImage(deviceCanvas, mockupX, mockupY, deviceCanvas.width, deviceCanvas.height);

  // 左下：QRコード
  const footerY = mockupY + deviceCanvas.height + gapBottom;
  const qrY = footerY + (footerH - qrSize) / 2;
  ctx.drawImage(qrImg, padding, qrY, qrSize, qrSize);

  // 右下：「Made by STICKER MOCKUPER」
  const footerCenterY = footerY + footerH / 2;
  const footerRight = cardW - padding;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8a8578';
  ctx.font = `${footerSubPx}px 'Rosario', sans-serif`;
  ctx.fillText('Made by', footerRight, footerCenterY - footerSubPx * 0.75);

  ctx.font = `${footerBrandPx}px 'Rosario', sans-serif`;
  const brandGrad = ctx.createLinearGradient(footerRight - brandWidth, 0, footerRight, 0);
  brandGrad.addColorStop(0, BRAND_INDIGO);
  brandGrad.addColorStop(1, BRAND_PINK);
  ctx.fillStyle = brandGrad;
  ctx.fillText(brandText, footerRight, footerCenterY + footerBrandPx * 0.6);

  return card;
}

export function SaveImageButton({ targetRef, deviceLabel, onBeforeCapture }: Props) {
  const [saving, setSaving] = useState(false);
  // Web Shareが使えない/失敗した場合のフォールバック用：生成した画像をその場に表示し、
  // 長押し（OS標準の「写真に追加」）で保存してもらう。<a download>はiOS Safariで
  // ほぼ機能しないため、これが確実に効く手段になる。
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  async function handleSave() {
    if (!targetRef.current || saving) return;
    setSaving(true);
    try {
      // 選択枠・削除ボタン・リサイズハンドルが写り込まないよう、選択解除してから撮影する
      onBeforeCapture();
      await waitForNextPaint();
      const deviceCanvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const canvas = await composeBrandedCard(deviceCanvas, deviceLabel);

      // 対応環境ではWeb Share APIを優先する。ネイティブの共有シートに
      // 「画像を保存」等が含まれる、一番スムーズな体験になるため。
      const blob = await canvasToBlob(canvas);
      const file = blob ? new File([blob], 'sticker-mockup.png', { type: 'image/png' }) : null;
      const nav = navigator as Navigator & {
        canShare?: (data?: { files?: File[] }) => boolean;
        share?: (data: { files?: File[]; title?: string }) => Promise<void>;
      };

      if (file && nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({ files: [file], title: 'Sticker Mockup' });
          return;
        } catch {
          // 共有シートのキャンセル・失敗時は下のプレビュー表示にフォールバックする
        }
      }

      setPreviewSrc(canvas.toDataURL('image/png'));
    } catch (err) {
      // 失敗時に何も起きないと原因が分からなくなるため、必ずユーザーに知らせる
      console.error('画像の保存に失敗しました', err);
      window.alert(
        `画像の保存に失敗しました。\n${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button className="sm-btn sm-save" onClick={handleSave} disabled={saving}>
        <IconDownload size={14} aria-hidden />
        {saving ? '保存中…' : '画像として保存'}
      </button>

      {previewSrc && (
        <div className="sm-save-modal-backdrop" onClick={() => setPreviewSrc(null)}>
          <div className="sm-save-modal" onClick={(e) => e.stopPropagation()}>
            <p className="sm-save-modal-hint">
              画像を長押しして「写真に追加」を選ぶと保存できます
            </p>
            <img src={previewSrc} alt="モックアップ画像" className="sm-save-modal-img" />
            <div className="sm-save-modal-actions">
              <a href={previewSrc} download="sticker-mockup.png" className="sm-btn sm-save">
                ダウンロード
              </a>
              <button className="sm-btn" onClick={() => setPreviewSrc(null)}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
