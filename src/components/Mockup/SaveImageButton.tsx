import { useState } from 'react';
import type { RefObject } from 'react';
import html2canvas from 'html2canvas';
import IconDownload from '@tabler/icons-react/dist/esm/icons/IconDownload.mjs';
import qrCode from '../../assets/qrcode.png';
import logo from '../../assets/logo.png';

interface Props {
  targetRef: RefObject<HTMLDivElement | null>;
  deviceLabel: string;
  onBeforeCapture: () => void;
}

const BRAND_PINK = '#ff6fa5';
const BRAND_INDIGO = '#18016c';
const CARD_BG = '#f4f2ee';

// 保存画像はデバイスの種類によらず常に1000×1000の正方形にする。
// モックアップ本体はアスペクト比を保ったまま中央のスペースに収める(contain)。
const CARD_SIZE = 1000;
const PADDING = 60;
const LABEL_FONT_PX = 42;
const LABEL_AREA_H = 64;
const GAP_TOP = 22;
const FOOTER_AREA_H = 80;
const GAP_BOTTOM = 22;
const QR_SIZE = 60;
const LOGO_H = 34;
const FOOTER_SUB_PX = 20;

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
 * 撮影したモックアップ画像に、左上のデバイス名・右下のブランドロゴ・
 * 左下のQRコードを添えた、1000×1000の正方形の「作品カード」を合成する。
 * SNS等でそのままシェアされることを想定した名刺代わりの見た目にするための加工。
 */
async function composeBrandedCard(deviceCanvas: HTMLCanvasElement, deviceLabel: string) {
  const [qrImg, logoImg] = await Promise.all([loadImage(qrCode), loadImage(logo)]);

  try {
    await Promise.all([
      document.fonts.load(`${LABEL_FONT_PX}px Monoton`),
      document.fonts.load(`${FOOTER_SUB_PX}px Rosario`),
    ]);
  } catch {
    // フォントの先読みに失敗しても、代替フォントで描画を続ける
  }

  const card = document.createElement('canvas');
  card.width = CARD_SIZE;
  card.height = CARD_SIZE;
  const ctx = card.getContext('2d');
  if (!ctx) return deviceCanvas;

  roundRectPath(ctx, 0, 0, CARD_SIZE, CARD_SIZE, 28);
  ctx.fillStyle = CARD_BG;
  ctx.fill();

  // 左上：デバイス名（Monotonのブロック体＋ブランドカラーのグラデーション）
  ctx.font = `${LABEL_FONT_PX}px Monoton, cursive`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const labelWidth = ctx.measureText(deviceLabel).width;
  const labelGrad = ctx.createLinearGradient(PADDING, 0, PADDING + labelWidth, 0);
  labelGrad.addColorStop(0, BRAND_PINK);
  labelGrad.addColorStop(1, BRAND_INDIGO);
  ctx.fillStyle = labelGrad;
  ctx.fillText(deviceLabel, PADDING, PADDING + LABEL_AREA_H / 2);

  // 中央：撮影したモックアップ本体を、アスペクト比を保ったまま中段のスペースに収める
  const footerY = CARD_SIZE - PADDING - FOOTER_AREA_H;
  const regionX = PADDING;
  const regionY = PADDING + LABEL_AREA_H + GAP_TOP;
  const regionW = CARD_SIZE - PADDING * 2;
  const regionH = footerY - GAP_BOTTOM - regionY;
  const scale = Math.min(regionW / deviceCanvas.width, regionH / deviceCanvas.height);
  const drawW = deviceCanvas.width * scale;
  const drawH = deviceCanvas.height * scale;
  const drawX = regionX + (regionW - drawW) / 2;
  const drawY = regionY + (regionH - drawH) / 2;
  ctx.drawImage(deviceCanvas, drawX, drawY, drawW, drawH);

  // 左下：QRコード
  const footerCenterY = footerY + FOOTER_AREA_H / 2;
  ctx.drawImage(qrImg, PADDING, footerCenterY - QR_SIZE / 2, QR_SIZE, QR_SIZE);

  // 右下：「Made by」＋ブランドロゴ
  const logoW = LOGO_H * (logoImg.naturalWidth / logoImg.naturalHeight);
  const logoX = CARD_SIZE - PADDING - logoW;
  ctx.drawImage(logoImg, logoX, footerCenterY - LOGO_H / 2, logoW, LOGO_H);

  ctx.font = `${FOOTER_SUB_PX}px 'Rosario', sans-serif`;
  ctx.fillStyle = '#8a8578';
  ctx.textAlign = 'right';
  ctx.fillText('Made by', logoX - 10, footerCenterY);

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
