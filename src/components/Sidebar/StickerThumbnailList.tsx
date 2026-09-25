import type { PointerEvent as ReactPointerEvent } from 'react';
import IconX from '@tabler/icons-react/dist/esm/icons/IconX.mjs';
import IconCrop from '@tabler/icons-react/dist/esm/icons/IconCrop.mjs';
import type { StickerItem } from '../../types';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  stickers: StickerItem[];
  onDelete: (id: string) => void;
  onThumbPointerDown: (sticker: StickerItem, e: ReactPointerEvent) => void;
  onCropSticker: (sticker: StickerItem) => void;
}

export function StickerThumbnailList({
  stickers,
  onDelete,
  onThumbPointerDown,
  onCropSticker,
}: Props) {
  const { t } = useLang();
  return (
    <div>
      <div className="sm-label">{t.uploaded}</div>
      <div className="sm-thumb-list">
        {stickers.length === 0 && <span className="sm-empty">{t.none}</span>}
        {stickers.map((s) => (
          <div
            key={s.id}
            className="sm-thumb"
            onPointerDown={(e) => onThumbPointerDown(s, e)}
          >
            <img src={s.src} alt="" draggable={false} />
            <button
              className="sm-del"
              aria-label={t.delete}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDelete(s.id)}
            >
              <IconX size={10} aria-hidden />
            </button>
            <button
              className="sm-crop-trigger"
              aria-label={t.crop}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onCropSticker(s)}
            >
              <IconCrop size={10} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
