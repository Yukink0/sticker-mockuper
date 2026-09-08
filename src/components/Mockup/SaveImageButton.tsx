import { useState } from 'react';
import type { RefObject } from 'react';
import html2canvas from 'html2canvas';
import IconDownload from '@tabler/icons-react/dist/esm/icons/IconDownload.mjs';

interface Props {
  targetRef: RefObject<HTMLDivElement | null>;
  onBeforeCapture: () => void;
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/png'));
}

export function SaveImageButton({ targetRef, onBeforeCapture }: Props) {
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
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

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
