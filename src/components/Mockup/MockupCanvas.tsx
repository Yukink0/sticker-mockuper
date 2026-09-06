import type { DragEvent, MouseEvent as ReactMouseEvent, RefObject } from 'react';
import { getFrameSize } from '../../config/devices';
import type {
  DeviceType,
  Maker,
  MacbookSize,
  SurfaceSize,
  IphoneModel,
  PlacedSticker,
  StickerItem,
} from '../../types';
import { DeviceLogo } from './DeviceLogo';
import { PlacedStickerItem } from './PlacedStickerItem';

interface Props {
  device: DeviceType;
  maker: Maker;
  size: MacbookSize | SurfaceSize;
  iphoneModel: IphoneModel;
  stickers: StickerItem[];
  placed: PlacedSticker[];
  selectedId: string | null;
  frameRef: RefObject<HTMLDivElement | null>;
  onAddPlaced: (sticker: PlacedSticker) => void;
  onSelectPlaced: (id: string) => void;
  onDeselect: () => void;
  onUpdatePlaced: (id: string, patch: Partial<PlacedSticker>) => void;
  onDeletePlaced: (id: string) => void;
}

const INITIAL_WIDTH_PCT = 14;
// フレームをoverflow:hiddenでクリップしているため、選択枠/削除・リサイズハンドルが
// 縁で見切れないよう、配置可能な範囲に少し余白を持たせる
const EDGE_MARGIN_PX = 10;
// 小さすぎるとリサイズ/削除ハンドルが掴みにくくなるための下限
const MIN_STICKER_SIZE_PX = 28;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function MockupCanvas({
  device,
  maker,
  size,
  iphoneModel,
  stickers,
  placed,
  selectedId,
  frameRef,
  onAddPlaced,
  onSelectPlaced,
  onDeselect,
  onUpdatePlaced,
  onDeletePlaced,
}: Props) {
  const frameSize = getFrameSize(device, maker, size, iphoneModel);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const stickerId = e.dataTransfer.getData('text/plain');
    const source = stickers.find((s) => s.id === stickerId);
    const frame = frameRef.current;
    if (!source || !frame) return;

    const rect = frame.getBoundingClientRect();
    const wPct = INITIAL_WIDTH_PCT;
    const wPx = (wPct / 100) * rect.width;
    // 画像本来の縦横比を保ったまま高さを決める（強制正方形にしない）
    const hPx = wPx / source.aspectRatio;
    const hPct = (hPx / rect.height) * 100;
    const xPx = clamp(
      e.clientX - rect.left - wPx / 2,
      EDGE_MARGIN_PX,
      rect.width - wPx - EDGE_MARGIN_PX,
    );
    const yPx = clamp(
      e.clientY - rect.top - hPx / 2,
      EDGE_MARGIN_PX,
      rect.height - hPx - EDGE_MARGIN_PX,
    );

    onAddPlaced({
      id: crypto.randomUUID(),
      src: source.src,
      aspectRatio: source.aspectRatio,
      xPct: (xPx / rect.width) * 100,
      yPct: (yPx / rect.height) * 100,
      wPct,
      hPct,
      rotationDeg: 0,
    });
  }

  function startMove(e: ReactMouseEvent, id: string) {
    e.preventDefault();
    onSelectPlaced(id);
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
      const xPx = clamp(
        ev.clientX - rect.left - offX,
        EDGE_MARGIN_PX,
        rect.width - wPx - EDGE_MARGIN_PX,
      );
      const yPx = clamp(
        ev.clientY - rect.top - offY,
        EDGE_MARGIN_PX,
        rect.height - hPx - EDGE_MARGIN_PX,
      );
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
    const startY = e.clientY;
    const startWPx = (p.wPct / 100) * rect.width;
    const originXPx = (p.xPct / 100) * rect.width;
    const originYPx = (p.yPct / 100) * rect.height;
    const aspectRatio = p.aspectRatio;
    // 回転していても「ボックスのローカルX軸（＝掴んだ角から見て幅方向）」への
    // 射影をドラッグ量として使うことで、無回転時と同じ感覚でリサイズできるようにする
    const theta = (p.rotationDeg * Math.PI) / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const maxWPxFromWidth = rect.width - EDGE_MARGIN_PX - originXPx;
    const maxWPxFromHeight = (rect.height - EDGE_MARGIN_PX - originYPx) * aspectRatio;
    const maxWPx = Math.min(maxWPxFromWidth, maxWPxFromHeight);

    function onMove(ev: MouseEvent) {
      const rawDx = ev.clientX - startX;
      const rawDy = ev.clientY - startY;
      const projected = rawDx * cos + rawDy * sin;
      const wPx = clamp(startWPx + projected, MIN_STICKER_SIZE_PX, maxWPx);
      const hPx = wPx / aspectRatio;
      onUpdatePlaced(id, {
        wPct: (wPx / rect.width) * 100,
        hPct: (hPx / rect.height) * 100,
      });
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function startRotate(e: ReactMouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    const p = placed.find((x) => x.id === id);
    const frame = frameRef.current;
    if (!p || !frame) return;

    const rect = frame.getBoundingClientRect();
    const centerXPx = (p.xPct / 100) * rect.width + ((p.wPct / 100) * rect.width) / 2;
    const centerYPx = (p.yPct / 100) * rect.height + ((p.hPct / 100) * rect.height) / 2;
    const centerXScreen = rect.left + centerXPx;
    const centerYScreen = rect.top + centerYPx;

    function angleFromCenter(clientX: number, clientY: number) {
      const dx = clientX - centerXScreen;
      const dy = clientY - centerYScreen;
      // ハンドルの初期位置（真上）を0度とする
      return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    }

    function onMove(ev: MouseEvent) {
      let deg = angleFromCenter(ev.clientX, ev.clientY);
      if (ev.shiftKey) deg = Math.round(deg / 15) * 15;
      onUpdatePlaced(id, { rotationDeg: deg });
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const variant =
    device === 'ipad' ? 'ipad' : device === 'iphone' ? `iphone-${iphoneModel}` : maker;

  return (
    <div
      ref={frameRef}
      className={`sm-mockup sm-mockup--${variant}`}
      style={{ width: frameSize.width, height: frameSize.height }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDeselect();
      }}
    >
      <DeviceLogo
        device={device}
        maker={maker}
        iphoneModel={iphoneModel}
        frameWidth={frameSize.width}
      />
      {placed.map((p) => (
        <PlacedStickerItem
          key={p.id}
          sticker={p}
          selected={p.id === selectedId}
          onSelect={() => onSelectPlaced(p.id)}
          onDelete={() => onDeletePlaced(p.id)}
          onStartMove={(e) => startMove(e, p.id)}
          onStartResize={(e) => startResize(e, p.id)}
          onStartRotate={(e) => startRotate(e, p.id)}
        />
      ))}
    </div>
  );
}
