import type { DragEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { getFrameSize } from '../../config/devices';
import type {
  DeviceType,
  Maker,
  MacbookSize,
  SurfaceSize,
  PlacedSticker,
  StickerItem,
} from '../../types';
import { DeviceLogo } from './DeviceLogo';
import { PlacedStickerItem } from './PlacedStickerItem';

interface Props {
  device: DeviceType;
  maker: Maker;
  size: MacbookSize | SurfaceSize;
  stickers: StickerItem[];
  placed: PlacedSticker[];
  selectedId: string | null;
  frameRef: RefObject<HTMLDivElement | null>;
  onAddPlaced: (sticker: PlacedSticker) => void;
  onSelect: (id: string | null) => void;
  onUpdatePlaced: (id: string, patch: Partial<PlacedSticker>) => void;
  onDeletePlaced: (id: string) => void;
}

const INITIAL_WIDTH_PCT = 14;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function MockupCanvas({
  device,
  maker,
  size,
  stickers,
  placed,
  selectedId,
  frameRef,
  onAddPlaced,
  onSelect,
  onUpdatePlaced,
  onDeletePlaced,
}: Props) {
  const frameSize = getFrameSize(device, maker, size);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const stickerId = e.dataTransfer.getData('text/plain');
    const source = stickers.find((s) => s.id === stickerId);
    const frame = frameRef.current;
    if (!source || !frame) return;

    const rect = frame.getBoundingClientRect();
    const wPct = INITIAL_WIDTH_PCT;
    const hPct = (wPct * rect.width) / rect.height;
    const wPx = (wPct / 100) * rect.width;
    const hPx = (hPct / 100) * rect.height;
    const xPx = clamp(e.clientX - rect.left - wPx / 2, 0, rect.width - wPx);
    const yPx = clamp(e.clientY - rect.top - hPx / 2, 0, rect.height - hPx);

    onAddPlaced({
      id: crypto.randomUUID(),
      src: source.src,
      xPct: (xPx / rect.width) * 100,
      yPct: (yPx / rect.height) * 100,
      wPct,
      hPct,
    });
  }

  function startMove(e: ReactMouseEvent, id: string) {
    e.preventDefault();
    onSelect(id);
    const p = placed.find((x) => x.id === id);
    const frame = frameRef.current;
    if (!p || !frame) return;

    const rect = frame.getBoundingClientRect();
    const wPx = (p.wPct / 100) * rect.width;
    const hPx = (p.hPct / 100) * rect.height;
    const startXPx = (p.xPct / 100) * rect.width;
    const startYPx = (p.yPct / 100) * rect.height;
    const offX = e.clientX - rect.left - startXPx;
    const offY = e.clientY - rect.top - startYPx;

    function onMove(ev: MouseEvent) {
      const xPx = clamp(ev.clientX - rect.left - offX, 0, rect.width - wPx);
      const yPx = clamp(ev.clientY - rect.top - offY, 0, rect.height - hPx);
      onUpdatePlaced(id, {
        xPct: (xPx / rect.width) * 100,
        yPct: (yPx / rect.height) * 100,
      });
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function startResize(e: ReactMouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    const p = placed.find((x) => x.id === id);
    const frame = frameRef.current;
    if (!p || !frame) return;

    const rect = frame.getBoundingClientRect();
    const startX = e.clientX;
    const startWPx = (p.wPct / 100) * rect.width;

    function onMove(ev: MouseEvent) {
      const wPx = Math.max(20, startWPx + (ev.clientX - startX));
      onUpdatePlaced(id, {
        wPct: (wPx / rect.width) * 100,
        hPct: (wPx / rect.height) * 100,
      });
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  return (
    <div
      ref={frameRef}
      className="sm-mockup"
      style={{ width: frameSize.width, height: frameSize.height }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelect(null);
      }}
    >
      <DeviceLogo device={device} maker={maker} />
      {placed.map((p) => (
        <PlacedStickerItem
          key={p.id}
          sticker={p}
          selected={p.id === selectedId}
          onSelect={() => onSelect(p.id)}
          onDelete={() => onDeletePlaced(p.id)}
          onStartMove={(e) => startMove(e, p.id)}
          onStartResize={(e) => startResize(e, p.id)}
        />
      ))}
    </div>
  );
}
