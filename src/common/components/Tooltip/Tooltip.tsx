import * as RadixTooltip from "@radix-ui/react-tooltip";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: React.ComponentProps<typeof RadixTooltip.Content>["side"];
  sideOffset?: number;
};

export const Tooltip = ({
  content,
  children,
  side,
  sideOffset = 5,
}: TooltipProps) => {
  return (
    <RadixTooltip.Provider delayDuration={200}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="max-w-64 rounded-xl border border-slate-500 bg-slate-800 px-3 py-2 text-sm text-white shadow-md will-change-[transform,opacity] select-none data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade"
            side={side}
            sideOffset={sideOffset}
          >
            {content}
            <RadixTooltip.Arrow className="fill-slate-800" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
