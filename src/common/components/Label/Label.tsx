import { Button } from "src/common/components/Button/Button";
import { Tooltip } from "src/common/components/Tooltip/Tooltip";

type LabelProps = {
  title: string;
  tooltipContent?: string;
};

export const Label = ({
  title,
  tooltipContent,
}: LabelProps): React.JSX.Element => {
  return (
    <h3 className="mb-1 flex items-center gap-0.5 text-sm text-slate-500">
      {title}

      {tooltipContent && (
        <Tooltip content={tooltipContent}>
          <Button iconName="info" variant="ghost" size="sm" />
        </Tooltip>
      )}
    </h3>
  );
};
