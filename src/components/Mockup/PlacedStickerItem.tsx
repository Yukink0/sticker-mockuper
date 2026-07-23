import type { MouseEvent as ReactMouseEvent } from 'react';
import { IconX } from '@tabler/icons-react';
import type { PlacedSticker } from '../../types';

interface Props {
  sticker: PlacedSticker;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onStartMove: (e: ReactMouseEvent) => void;
  onStartResize: (e: ReactMouseEvent) => void;
}

export function PlacedStickerItem({
  sticker,
  selected,
  onSelect,
  onDelete,
  onStartMove,
  onStartResize,
}: Props) {
  return (
    <div
      className={`sm-placed${selected ? ' selected' : ''}`}
      style={{
        left: `${sticker.xPct}%`,
        top: `${sticker.yPct}%`,
        width: `${sticker.wPct}%`,
        height: `${sticker.hPct}%`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <img src={sticker.src} alt="" draggable={false} onMouseDown={onStartMove} />
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
      <div className="sm-rs" onMouseDown={onStartResize} />
    </div>
  );
}
