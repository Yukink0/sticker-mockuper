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

export function SaveImageButton({ targetRef, onBeforeCapture }: Props) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!targetRef.current || saving) return;
    setSaving(true);
    try {
      // 選択枠・削除ボタン・リサイズハンドルが写り込まないよう、選択解除してから撮影する
      onBeforeCapture();
      await waitForNextPaint();
      const canvas = await html2canvas(targetRef.current, { backgroundColor: null, scale: 2 });
      const link = document.createElement('a');
      link.download = 'sticker-mockup.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
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
