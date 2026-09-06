import type { ChangeEvent } from 'react';
import IconUpload from '@tabler/icons-react/dist/esm/icons/IconUpload.mjs';

interface Props {
  onUpload: (files: FileList) => void;
}

export function StickerUploader({ onUpload }: Props) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
    e.target.value = '';
  }

  return (
    <div>
      <div className="sm-label">ステッカーをアップロード</div>
      <label className="sm-btn sm-upload-label">
        <IconUpload size={14} aria-hidden />
        画像を選ぶ
        <input type="file" accept="image/*" multiple hidden onChange={handleChange} />
      </label>
    </div>
  );
}
