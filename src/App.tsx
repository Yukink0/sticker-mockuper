import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { DeviceSelector } from './components/Sidebar/DeviceSelector';
import { MakerSelector } from './components/Sidebar/MakerSelector';
import { SizeSelector } from './components/Sidebar/SizeSelector';
import { IphoneModelSelector } from './components/Sidebar/IphoneModelSelector';
import { StickerUploader } from './components/Sidebar/StickerUploader';
import { StickerThumbnailList } from './components/Sidebar/StickerThumbnailList';
import { CropModal } from './components/Sidebar/CropModal';
import { ResetAllButton } from './components/Sidebar/ResetAllButton';
import { MockupCanvas } from './components/Mockup/MockupCanvas';
import { SaveImageButton } from './components/Mockup/SaveImageButton';
import { getDefaultSize, getDeviceLabel } from './config/devices';
import { computeInitialPlacement } from './utils/placement';
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
  const [dragPreview, setDragPreview] = useState<{ src: string; x: number; y: number } | null>(
    null,
  );
  const [cropTarget, setCropTarget] = useState<StickerItem | null>(null);

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

  // トリミングは確定した画像・縦横比でサムネイルを置き換えるだけで、
  // 既に配置済みのステッカーはその時点の画像のまま変えない
  function handleCropConfirm(id: string, croppedSrc: string, aspectRatio: number) {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, src: croppedSrc, aspectRatio } : s)),
    );
    setCropTarget(null);
  }

  function handleAddPlaced(sticker: PlacedSticker) {
    setPlaced((prev) => [...prev, sticker]);
    setSelectedId(sticker.id);
  }

  // サムネイルからモックアップへの配置。マウスのドラッグ&ドロップだけでなく
  // スマホ・タブレットのタッチでも同じように使えるよう、ネイティブのDrag and Drop
  // APIには頼らずPointer Eventsだけで自前実装している。
  function handleThumbPointerDown(sticker: StickerItem, e: ReactPointerEvent) {
    e.preventDefault();
    setDragPreview({ src: sticker.src, x: e.clientX, y: e.clientY });

    function onMove(ev: PointerEvent) {
      setDragPreview({ src: sticker.src, x: ev.clientX, y: ev.clientY });
    }

    function onUp(ev: PointerEvent) {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      setDragPreview(null);

      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const isInsideFrame =
        ev.clientX >= rect.left &&
        ev.clientX <= rect.right &&
        ev.clientY >= rect.top &&
        ev.clientY <= rect.bottom;
      if (!isInsideFrame) return;

      const placement = computeInitialPlacement(ev.clientX, ev.clientY, rect, sticker.aspectRatio);
      handleAddPlaced({
        id: crypto.randomUUID(),
        src: sticker.src,
        aspectRatio: sticker.aspectRatio,
        rotationDeg: 0,
        ...placement,
      });
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
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


  return (
    <div className="sm-page">
      <header className="sm-header">
        <img src={logo} alt="Sticker Mockuper" className="sm-header-logo" />
        <p className="sm-header-tagline">ステッカーを貼る前に、シミュレーション</p>
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
          <StickerThumbnailList
            stickers={stickers}
            onDelete={handleDeleteSticker}
            onThumbPointerDown={handleThumbPointerDown}
            onCropSticker={setCropTarget}
          />
          <ResetAllButton onReset={handleResetAll} />
        </div>

        <div className="sm-main">
          <MockupCanvas
            device={device}
            maker={maker}
            size={size}
            iphoneModel={iphoneModel}
            placed={placed}
            selectedId={selectedId}
            frameRef={frameRef}
            onSelectPlaced={handleSelectPlaced}
            onDeselect={() => setSelectedId(null)}
            onUpdatePlaced={handleUpdatePlaced}
            onDeletePlaced={handleDeletePlaced}
          />
          <SaveImageButton
            targetRef={frameRef}
            deviceLabel={getDeviceLabel(device, maker, size, iphoneModel)}
            onBeforeCapture={() => setSelectedId(null)}
          />
        </div>
      </div>

      <footer className="sm-footer">
        <span className="sm-footer-brand">STICKER MOCKUPER</span> Beta by CREATIVESTUDIOSNOW
      </footer>

      {dragPreview && (
        <img
          src={dragPreview.src}
          alt=""
          className="sm-drag-preview"
          style={{ left: dragPreview.x, top: dragPreview.y }}
        />
      )}

      {cropTarget && (
        <CropModal
          src={cropTarget.src}
          onCancel={() => setCropTarget(null)}
          onConfirm={(croppedSrc, aspectRatio) =>
            handleCropConfirm(cropTarget.id, croppedSrc, aspectRatio)
          }
        />
      )}
    </div>
  );
}
