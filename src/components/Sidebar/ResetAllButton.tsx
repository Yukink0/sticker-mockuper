import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash.mjs';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  onReset: () => void;
}

export function ResetAllButton({ onReset }: Props) {
  const { t } = useLang();
  return (
    <button className="sm-btn sm-danger" onClick={onReset}>
      <IconTrash size={14} aria-hidden />
      {t.deleteAll}
    </button>
  );
}
