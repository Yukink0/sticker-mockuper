import type { DragEvent } from 'react';
import { IconX } from '@tabler/icons-react';
import type { StickerItem } from '../../types';

interface Props {
  stickers: StickerItem[];
  onDelete: (id: string) => void;
}

export function StickerThumbnailList({ stickers, onDelete }: Props) {
  function handleDragStart(e: DragEvent<HTMLDivElement>, id: string) {
    e.dataTransfer.setData('text/plain', id);
  }

  return (
    <div>
      <div className="sm-label">アップロード済み（ドラッグして配置）</div>
      <div className="sm-thumb-list">
        {stickers.length === 0 && <span className="sm-empty">まだありません</span>}
        {stickers.map((s) => (
          <div
            key={s.id}
            className="sm-thumb"
            draggable
            onDragStart={(e) => handleDragStart(e, s.id)}
          >
            <img src={s.src} alt="" />
            <button className="sm-del" aria-label="削除" onClick={() => onDelete(s.id)}>
              <IconX size={10} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
