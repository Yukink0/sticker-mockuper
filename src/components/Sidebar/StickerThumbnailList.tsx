import type { PointerEvent as ReactPointerEvent } from 'react';
import IconX from '@tabler/icons-react/dist/esm/icons/IconX.mjs';
import type { StickerItem } from '../../types';

interface Props {
  stickers: StickerItem[];
  onDelete: (id: string) => void;
  onThumbPointerDown: (sticker: StickerItem, e: ReactPointerEvent) => void;
}

export function StickerThumbnailList({ stickers, onDelete, onThumbPointerDown }: Props) {
  return (
    <div>
      <div className="sm-label">アップロード済み（ドラッグして配置）</div>
      <div className="sm-thumb-list">
        {stickers.length === 0 && <span className="sm-empty">まだありません</span>}
        {stickers.map((s) => (
          <div
            key={s.id}
            className="sm-thumb"
            onPointerDown={(e) => onThumbPointerDown(s, e)}
          >
            <img src={s.src} alt="" draggable={false} />
            <button
              className="sm-del"
              aria-label="削除"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDelete(s.id)}
            >
              <IconX size={10} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
