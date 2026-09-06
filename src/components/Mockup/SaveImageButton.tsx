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

function downloadCanvas(canvas: HTMLCanvasElement) {
  const link = document.createElement('a');
  link.download = 'sticker-mockup.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function SaveImageButton({ targetRef, onBeforeCapture }: Props) {
  const [saving, setSaving] = useState(false);

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

      // iOS Safari等は<a download>にほぼ対応していないため、Web Share API（ファイル共有）が
      // 使える場合はそちらを優先する。ネイティブの共有シートに「画像を保存」等が含まれる。
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
        } catch (err) {
          // ユーザーが共有シートをキャンセルした場合は何もしない
          if (err instanceof DOMException && err.name === 'AbortError') return;
          // それ以外の失敗時はダウンロード方式にフォールバックする
        }
      }

      downloadCanvas(canvas);
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
    <button className="sm-btn sm-save" onClick={handleSave} disabled={saving}>
      <IconDownload size={14} aria-hidden />
      {saving ? '保存中…' : '画像として保存'}
    </button>
  );
}
