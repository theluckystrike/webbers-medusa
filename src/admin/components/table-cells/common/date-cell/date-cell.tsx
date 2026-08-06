import { Tooltip } from '@medusajs/ui';
import { PlaceholderCell } from '../placeholder-cell';
import { useDate } from '../../../hooks/use-date.tsx';

type DateCellProps = {
  date?: Date | string | null;
};

export const DateCell = ({ date }: DateCellProps) => {
  const { getFullDate } = useDate();

  if (!date) {
    return <PlaceholderCell />;
  }

  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <Tooltip
        className="z-10"
        content={
          <span className="text-pretty">{`${getFullDate({
            date,
            includeTime: true,
          })}`}</span>
        }
      >
        <span className="truncate">{getFullDate({ date, includeTime: false })}</span>
      </Tooltip>
    </div>
  );
};
