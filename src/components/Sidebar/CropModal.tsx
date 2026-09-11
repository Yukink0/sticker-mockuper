import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { clamp } from '../../utils/placement';

interface Props {
  src: string;
  onCancel: () => void;
  onConfirm: (croppedSrc: string, aspectRatio: number) => void;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Corner = 'nw' | 'ne' | 'sw' | 'se';

const MIN_BOX_SIZE = 24;

function resizeCorner(corner: Corner, start: Box, dx: number, dy: number, bounds: { w: number; h: number }): Box {
  let { x, y, w, h } = start;
  if (corner.includes('w')) {
    const right = x + w;
    x = clamp(x + dx, 0, right - MIN_BOX_SIZE);
    w = right - x;
  }
  if (corner.includes('e')) {
    w = clamp(w + dx, MIN_BOX_SIZE, bounds.w - x);
  }
  if (corner.includes('n')) {
    const bottom = y + h;
    y = clamp(y + dy, 0, bottom - MIN_BOX_SIZE);
    h = bottom - y;
  }
  if (corner.includes('s')) {
    h = clamp(h + dy, MIN_BOX_SIZE, bounds.h - y);
  }
  return { x, y, w, h };
}

export function CropModal({ src, onCancel, onConfirm }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [stage, setStage] = useState<{ w: number; h: number } | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  // 画像本来のサイズが分かったら、モーダル内に収まる表示サイズを決め、
  // 初期のトリミング範囲を画像全体にセットする。
  // ステージのCSSに幅の制約（max-width等）を入れると、この計算値と
  // 実際の描画サイズがずれてハンドル位置とクロップ座標が食い違うため、
  // 表示上限はここでビューポートを見て決め切り、CSS側では制約しない。
  useEffect(() => {
    if (!natural) return;
    const maxW = Math.min(420, window.innerWidth * 0.78);
    const maxH = Math.min(380, window.innerHeight * 0.45);
    const scale = Math.min(maxW / natural.w, maxH / natural.h);
    const w = natural.w * scale;
    const h = natural.h * scale;
    setStage({ w, h });
    setBox({ x: 0, y: 0, w, h });
  }, [natural]);

  function handleImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  }

  function startMove(e: ReactPointerEvent) {
    if (!box || !stage) return;
    e.preventDefault();
    e.stopPropagation();
    const startBox = box;
    const startX = e.clientX;
    const startY = e.clientY;

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setBox({
        x: clamp(startBox.x + dx, 0, stage!.w - startBox.w),
        y: clamp(startBox.y + dy, 0, stage!.h - startBox.h),
        w: startBox.w,
        h: startBox.h,
      });
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function startResize(corner: Corner, e: ReactPointerEvent) {
    if (!box || !stage) return;
    e.preventDefault();
    e.stopPropagation();
    const startBox = box;
    const startX = e.clientX;
    const startY = e.clientY;
    const bounds = stage;

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setBox(resizeCorner(corner, startBox, dx, dy, bounds));
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function handleConfirm() {
    if (!box || !stage || !natural) return;
    const scale = natural.w / stage.w;
    const nx = box.x * scale;
    const ny = box.y * scale;
    const nw = Math.max(1, Math.round(box.w * scale));
    const nh = Math.max(1, Math.round(box.h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = nw;
    canvas.height = nh;
    const ctx = canvas.getContext('2d');
    if (!ctx || !imgRef.current) return;
    ctx.drawImage(imgRef.current, nx, ny, nw, nh, 0, 0, nw, nh);
    onConfirm(canvas.toDataURL('image/png'), nw / nh);
  }

  return (
    <div className="sm-crop-modal-backdrop" onClick={onCancel}>
      <div className="sm-crop-modal" onClick={(e) => e.stopPropagation()}>
        <p className="sm-save-modal-hint">四隅をドラッグして範囲を選び、ドラッグして位置を調整できます</p>

        <div className="sm-crop-stage" style={stage ? { width: stage.w, height: stage.h } : undefined}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img ref={imgRef} src={src} onLoad={handleImgLoad} className="sm-crop-img" draggable={false} alt="トリミング対象の画像" />

          {box && stage && (
            <>
              <div
                className="sm-crop-shade"
                style={{
                  clipPath: `polygon(
                    0 0, 0 100%, ${box.x}px 100%, ${box.x}px ${box.y}px,
                    ${box.x + box.w}px ${box.y}px, ${box.x + box.w}px ${box.y + box.h}px,
                    ${box.x}px ${box.y + box.h}px, ${box.x}px 100%,
                    100% 100%, 100% 0
                  )`,
                }}
              />
              <div
                className="sm-crop-box"
                style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                onPointerDown={startMove}
              >
                {(['nw', 'ne', 'sw', 'se'] as Corner[]).map((corner) => (
                  <span
                    key={corner}
                    className={`sm-crop-handle sm-crop-handle--${corner}`}
                    onPointerDown={(e) => startResize(corner, e)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="sm-save-modal-actions">
          <button className="sm-btn sm-save" onClick={handleConfirm} disabled={!box}>
            トリミングを適用
          </button>
          <button className="sm-btn" onClick={onCancel}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
