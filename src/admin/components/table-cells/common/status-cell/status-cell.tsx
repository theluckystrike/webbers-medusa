import { clx } from '@medusajs/ui';
import { PropsWithChildren } from 'react';

type StatusCellProps = PropsWithChildren<{
  color?: 'green' | 'red' | 'blue' | 'orange' | 'grey' | 'purple';
}>;

export const getReviewstatus = (status: string) => {
  const [label, color] = {
    approved: ['Approved', 'green'],
    pending: ['Pending', 'orange'],
    flagged: ['Flagged', 'red'],
  }[status] as [string, 'red' | 'orange' | 'green'];

  return { label, color };
};

export const StatusCell = ({ color, children }: StatusCellProps) => {
  return (
    <div className="txt-compact-small text-ui-fg-subtle flex h-full w-full items-center gap-x-2 overflow-hidden">
      <div role="presentation" className="flex h-5 w-2 items-center justify-center">
        <div
          className={clx('h-2 w-2 rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)_inset]', {
            'bg-ui-tag-green-icon': color === 'green',
            'bg-ui-tag-red-icon': color === 'red',
            'bg-ui-tag-orange-icon': color === 'orange',
          })}
        />
      </div>
      <span className="truncate">{children}</span>
    </div>
  );
};

export const ReviewStatusCell = ({ status }: { status: string }) => {
  if (!status) {
    return <span>-</span>;
  }

  const { label, color } = getReviewstatus(status);

  return <StatusCell color={color}>{label}</StatusCell>;
};
