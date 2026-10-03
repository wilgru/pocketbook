import { cn } from "cn";
import { colours } from "src/colours/colours.constant";
import { Icon } from "src/icons/components/Icon/Icon";
import type { ReactNode } from "react";
import type { Colour } from "src/colours/Colour.type";
import type { IconName } from "src/icons/Icon.type";

type UpdateTimelineItemProps = {
  ref?: React.Ref<HTMLDivElement>;
  iconName: IconName;
  iconColour?: Colour;
  strongIcon?: boolean;
  headline?: ReactNode;
  dateText?: string | null;
  hideBottomLine?: boolean;
  children?: ReactNode;
};

export const UpdateTimelineItem = ({
  ref,
  iconName,
  iconColour = colours.orange,
  strongIcon = false,
  headline,
  dateText,
  hideBottomLine = false,
  children,
}: UpdateTimelineItemProps) => {
  return (
    <div ref={ref} className="flex w-full items-start gap-2">
      <div className="flex flex-col items-center self-stretch">
        <div className="h-2.5 w-px bg-slate-200" />

        <div
          className={cn(
            "rounded-full border p-1",
            strongIcon
              ? [iconColour.background, iconColour.border]
              : "border-white bg-white",
          )}
        >
          <Icon
            iconName={iconName}
            size="sm"
            className={cn(
              "shrink-0",
              strongIcon ? "fill-white" : iconColour.primary.text,
            )}
            weight={strongIcon ? "fill" : "regular"}
          />
        </div>

        {!hideBottomLine && <div className="w-px flex-1 bg-slate-200" />}
      </div>

      <div className="flex w-full flex-col gap-1 py-3">
        {(headline || dateText) && (
          <div className="flex items-start justify-between gap-2 px-1">
            <div className="flex flex-wrap items-center gap-2">{headline}</div>

            {dateText && (
              <p className="shrink-0 pt-1.5 text-xs text-slate-400">
                {dateText}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
