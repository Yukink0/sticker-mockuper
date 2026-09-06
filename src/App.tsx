import { useEffect, useRef, useState } from 'react';
import { DeviceSelector } from './components/Sidebar/DeviceSelector';
import { MakerSelector } from './components/Sidebar/MakerSelector';
import { SizeSelector } from './components/Sidebar/SizeSelector';
import { IphoneModelSelector } from './components/Sidebar/IphoneModelSelector';
import { StickerUploader } from './components/Sidebar/StickerUploader';
import { StickerThumbnailList } from './components/Sidebar/StickerThumbnailList';
import { ResetAllButton } from './components/Sidebar/ResetAllButton';
import { MockupCanvas } from './components/Mockup/MockupCanvas';
import { SaveImageButton } from './components/Mockup/SaveImageButton';
import { getDefaultSize } from './config/devices';
import logo from './assets/logo.png';
import type {
  DeviceType,
  Maker,
  MacbookSize,
  SurfaceSize,
  IphoneModel,
  StickerItem,
  PlacedSticker,
} from './types';
import './App.css';

export default function App() {
  const [device, setDevice] = useState<DeviceType>('pc');
  const [maker, setMaker] = useState<Maker>('macbook');
  const [size, setSize] = useState<MacbookSize | SurfaceSize>('14');
  const [iphoneModel, setIphoneModel] = useState<IphoneModel>('17');
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
        if (typeof src !== 'string') return;

        // 配置時に画像本来の縦横比で箱を作れるよう、実寸を読み取っておく
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight || 1;
          setStickers((prev) => [...prev, { id: crypto.randomUUID(), src, aspectRatio }]);
        };
        img.onerror = () => {
          setStickers((prev) => [...prev, { id: crypto.randomUUID(), src, aspectRatio: 1 }]);
        };
        img.src = src;
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

  // 選択・移動を始めたステッカーを配列の末尾に回して最前面に表示する
  // （重なったステッカーを後から選び直して手前に持ってこられるようにするため）
  function handleSelectPlaced(id: string) {
    setPlaced((prev) => {
      const index = prev.findIndex((p) => p.id === id);
      if (index === -1 || index === prev.length - 1) return prev;
      const item = prev[index];
      return [...prev.slice(0, index), ...prev.slice(index + 1), item];
    });
    setSelectedId(id);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedId(null);
      } else if (e.key === 'Delete' && selectedId) {
        handleDeletePlaced(selectedId);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  useEffect(() => {
    // サムネイルを枠外にドロップした際、ブラウザが既定のドロップ動作
    // （画像を別タブで開く等）を行わないようにする保険
    function preventDefault(e: Event) {
      e.preventDefault();
    }
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  return (
    <div className="sm-page">
      <header className="sm-header">
        <img src={logo} alt="Sticker Mockuper" className="sm-header-logo" />
        <p className="sm-header-tagline">お手持ちのステッカーを、貼る前にシミュレーション</p>
      </header>

      <div className="sm-app">
        <div className="sm-sidebar">
          <DeviceSelector device={device} onSelect={setDevice} />
          {device === 'pc' && <MakerSelector maker={maker} onSelect={handleSelectMaker} />}
          {device === 'pc' && <SizeSelector maker={maker} size={size} onSelect={setSize} />}
          {device === 'iphone' && (
            <IphoneModelSelector model={iphoneModel} onSelect={setIphoneModel} />
          )}
          <StickerUploader onUpload={handleUpload} />
          <StickerThumbnailList stickers={stickers} onDelete={handleDeleteSticker} />
          <ResetAllButton onReset={handleResetAll} />
        </div>

        <div className="sm-main">
          <MockupCanvas
            device={device}
            maker={maker}
            size={size}
            iphoneModel={iphoneModel}
            stickers={stickers}
            placed={placed}
            selectedId={selectedId}
            frameRef={frameRef}
            onAddPlaced={handleAddPlaced}
            onSelectPlaced={handleSelectPlaced}
            onDeselect={() => setSelectedId(null)}
            onUpdatePlaced={handleUpdatePlaced}
            onDeletePlaced={handleDeletePlaced}
          />
          <SaveImageButton targetRef={frameRef} onBeforeCapture={() => setSelectedId(null)} />
        </div>
      </div>
    </div>
  );
}
