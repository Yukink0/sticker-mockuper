// @tabler/icons-react の型定義はバレル(index)経由でのみ提供されており、
// 個別アイコンファイルへの深いimport（ビルド速度対策。詳細はDeviceSelector.tsx等のコメント参照）
// には型がないため、ここでアンビエント宣言する。
declare module '@tabler/icons-react/dist/esm/icons/*.mjs' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

  type TablerIconComponent = ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'stroke'> & {
      size?: string | number;
      stroke?: string | number;
      title?: string;
    } & RefAttributes<SVGSVGElement>
  >;

  const Icon: TablerIconComponent;
  export default Icon;
}
