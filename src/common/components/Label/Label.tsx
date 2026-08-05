import { Button } from "src/common/components/Button/Button";
import { Tooltip } from "src/common/components/Tooltip/Tooltip";

type LabelProps = {
  title: string;
  tooltipContent?: string;
};

export const Label = ({ title, tooltipContent }: LabelProps): JSX.Element => {
  return (
    <h3 className="flex items-center gap-0.5 mb-1 text-sm text-slate-500">
      {title}

      {tooltipContent && (
        <Tooltip content={tooltipContent}>
          <Button iconName="info" variant="ghost" size="sm" />
        </Tooltip>
      )}
    </h3>
  );
};
