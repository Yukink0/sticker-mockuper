import type { PointerEvent as ReactPointerEvent } from 'react';
import IconX from '@tabler/icons-react/dist/esm/icons/IconX.mjs';
import type { PlacedSticker } from '../../types';

interface Props {
  sticker: PlacedSticker;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onStartMove: (e: ReactPointerEvent) => void;
  onStartResize: (e: ReactPointerEvent) => void;
  onStartRotate: (e: ReactPointerEvent) => void;
}

export function PlacedStickerItem({
  sticker,
  selected,
  onSelect,
  onDelete,
  onStartMove,
  onStartResize,
  onStartRotate,
}: Props) {
  return (
    <div
      className={`sm-placed${selected ? ' selected' : ''}`}
      style={{
        left: `${sticker.xPct}%`,
        top: `${sticker.yPct}%`,
        width: `${sticker.wPct}%`,
        height: `${sticker.hPct}%`,
        transform: `rotate(${sticker.rotationDeg}deg)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <img src={sticker.src} alt="" draggable={false} onPointerDown={onStartMove} />
      <button
        className="sm-x"
        aria-label="削除"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <IconX size={11} aria-hidden />
      </button>
      <div className="sm-rs" onPointerDown={onStartResize} />
      <div className="sm-rotate" onPointerDown={onStartRotate} />
    </div>
  );
}
