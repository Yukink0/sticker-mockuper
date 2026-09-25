import type { ChangeEvent } from 'react';
import IconUpload from '@tabler/icons-react/dist/esm/icons/IconUpload.mjs';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  onUpload: (files: FileList) => void;
}

export function StickerUploader({ onUpload }: Props) {
  const { t } = useLang();
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
    e.target.value = '';
  }

  return (
    <div>
      <div className="sm-label">{t.uploadStickers}</div>
      <label className="sm-btn sm-upload-label">
        <IconUpload size={14} aria-hidden />
        {t.chooseImage}
        <input type="file" accept="image/*" multiple hidden onChange={handleChange} />
      </label>
    </div>
  );
}
