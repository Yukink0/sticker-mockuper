import { IconTrash } from '@tabler/icons-react';

interface Props {
  onReset: () => void;
}

export function ResetAllButton({ onReset }: Props) {
  return (
    <button className="sm-btn sm-danger" onClick={onReset}>
      <IconTrash size={14} aria-hidden />
      全て削除
    </button>
  );
}
