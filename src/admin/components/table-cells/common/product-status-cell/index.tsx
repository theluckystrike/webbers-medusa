import { StatusCell } from '../../common/status-cell';
import { HttpTypes } from '@medusajs/types';

type ProductStatusCellProps = {
  status: HttpTypes.AdminProductStatus;
};

export const ProductStatusCell = ({ status }: ProductStatusCellProps) => {
  if (!status) return;

  const [color, text] = {
    draft: ['grey', 'Draft'],
    proposed: ['orange', 'Proposed'],
    published: ['green', 'Published'],
    rejected: ['red', 'Rejected'],
  }[status] as ['grey' | 'orange' | 'green' | 'red', string];

  return <StatusCell color={color}>{text}</StatusCell>;
};

export const ProductStatusHeader = () => {
  return (
    <div className="flex h-full w-full items-center">
      <span>Status</span>
    </div>
  );
};
