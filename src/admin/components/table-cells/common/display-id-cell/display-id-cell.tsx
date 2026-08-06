import { PlaceholderCell } from '../placeholder-cell';

export const DisplayIdCell = ({ displayId }: { displayId?: string | null }) => {
  if (!displayId) {
    return <PlaceholderCell />;
  }

  return (
    <div className="text-ui-fg-subtle txt-compact-small flex h-full w-full items-center overflow-hidden">
      <span className="truncate">{displayId}</span>
    </div>
  );
};
