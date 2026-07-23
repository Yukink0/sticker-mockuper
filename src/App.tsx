import { useRef, useState } from 'react';
import { DeviceSelector } from './components/Sidebar/DeviceSelector';
import { MakerSelector } from './components/Sidebar/MakerSelector';
import { SizeSelector } from './components/Sidebar/SizeSelector';
import { StickerUploader } from './components/Sidebar/StickerUploader';
import { StickerThumbnailList } from './components/Sidebar/StickerThumbnailList';
import { ResetAllButton } from './components/Sidebar/ResetAllButton';
import { MockupCanvas } from './components/Mockup/MockupCanvas';
import { SaveImageButton } from './components/Mockup/SaveImageButton';
import { StickerMark } from './components/StickerMark';
import { getDefaultSize } from './config/devices';
import type {
  DeviceType,
  Maker,
  MacbookSize,
  SurfaceSize,
  StickerItem,
  PlacedSticker,
} from './types';
import './App.css';

export default function App() {
  const [device, setDevice] = useState<DeviceType>('pc');
  const [maker, setMaker] = useState<Maker>('macbook');
  const [size, setSize] = useState<MacbookSize | SurfaceSize>('14');
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [placed, setPlaced] = useState<PlacedSticker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);

  function handleSelectMaker(m: Maker) {
    setMaker(m);
    setSize(getDefaultSize(m));
  }

  function handleUpload(files: FileList) {
    [...files].forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result;
        if (typeof src === 'string') {
          setStickers((prev) => [...prev, { id: crypto.randomUUID(), src }]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDeleteSticker(id: string) {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAddPlaced(sticker: PlacedSticker) {
    setPlaced((prev) => [...prev, sticker]);
    setSelectedId(sticker.id);
  }

  function handleUpdatePlaced(id: string, patch: Partial<PlacedSticker>) {
    setPlaced((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function handleDeletePlaced(id: string) {
    setPlaced((prev) => prev.filter((p) => p.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  function handleResetAll() {
    setStickers([]);
    setPlaced([]);
    setSelectedId(null);
  }

  return (
    <div className="sm-page">
      <header className="sm-header">
        <span className="sm-header-mark">
          <StickerMark />
        </span>
        <div>
          <h1>Sticker Mockuper</h1>
          <p>お手持ちのステッカーを、貼る前にシミュレーション</p>
        </div>
      </header>

      <div className="sm-app">
        <div className="sm-sidebar">
          <DeviceSelector device={device} onSelect={setDevice} />
          {device === 'pc' && <MakerSelector maker={maker} onSelect={handleSelectMaker} />}
          {device === 'pc' && <SizeSelector maker={maker} size={size} onSelect={setSize} />}
          <StickerUploader onUpload={handleUpload} />
          <StickerThumbnailList stickers={stickers} onDelete={handleDeleteSticker} />
          <ResetAllButton onReset={handleResetAll} />
        </div>

        <div className="sm-main">
          <MockupCanvas
            device={device}
            maker={maker}
            size={size}
            stickers={stickers}
            placed={placed}
            selectedId={selectedId}
            frameRef={frameRef}
            onAddPlaced={handleAddPlaced}
            onSelect={setSelectedId}
            onUpdatePlaced={handleUpdatePlaced}
            onDeletePlaced={handleDeletePlaced}
          />
          <SaveImageButton targetRef={frameRef} onBeforeCapture={() => setSelectedId(null)} />
        </div>
      </div>
    </div>
  );
}
