import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import type { ReactNode } from "react";
import type { Colour } from "src/colours/Colour.type";
import type { IconName } from "src/icons/Icon.type";

type UpdateTimelineItemProps = {
  iconName: IconName;
  iconColour?: Colour;
  strongIcon?: boolean;
  headline?: ReactNode;
  dateText?: string | null;
  hideBottomLine?: boolean;
  children?: ReactNode;
};

export const UpdateTimelineItem = ({
  iconName,
  iconColour = colours.orange,
  strongIcon = false,
  headline,
  dateText,
  hideBottomLine = false,
  children,
}: UpdateTimelineItemProps) => {
  return (
    <div className="w-full flex gap-2 items-start">
      <div className="flex flex-col items-center self-stretch">
        <div className="w-px h-2 bg-slate-200" />

        <div
          className={cn(
            "rounded-full p-1 border",
            strongIcon
              ? [iconColour.background, iconColour.border]
              : "bg-white border-slate-200",
          )}
        >
          <Icon
            iconName={iconName}
            size="xs"
            className={cn(
              "shrink-0",
              strongIcon ? "fill-white" : iconColour.primary.text,
            )}
            weight={strongIcon ? "fill" : "regular"}
          />
        </div>

        {!hideBottomLine && <div className="w-px flex-1 bg-slate-200" />}
      </div>

      <div className="flex flex-col gap-1 w-full py-2">
        {(headline || dateText) && (
          <div className="flex items-start justify-between gap-2 px-1">
            <div className="flex items-center gap-2 flex-wrap">{headline}</div>

            {dateText && (
              <p className="text-xs text-slate-400 pt-1.5 shrink-0">
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
