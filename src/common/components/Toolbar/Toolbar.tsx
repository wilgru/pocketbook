import { cn } from "cn";
import { useAtom } from "jotai";
import { colours } from "src/colours/colours.constant";
import { isSideBarVisibleAtom } from "src/common/atoms/isSidebarVisibleAtom";
import { Button } from "src/common/components/Button/Button";
import { useElectronEnvironment } from "src/common/hooks/useElectronEnvironment";
import { Icon } from "src/icons/components/Icon/Icon";
import { NoteSearchBar } from "src/notes/components/NoteSearchBar/NoteSearchBar";
import type { Colour } from "src/colours/Colour.type";
import type { IconName } from "src/icons/Icon.type";

type ToolbarProps = {
  iconName?: IconName | null;
  title: string;
  colour?: Colour;
  pocketbookColour?: Colour;
  children?: React.ReactNode;
};

export const Toolbar = ({
  iconName,
  title,
  colour = colours.orange,
  pocketbookColour,
  children,
}: ToolbarProps) => {
  const { isMac, isWindows } = useElectronEnvironment();

  const [isSideBarVisible, setValue] = useAtom(isSideBarVisibleAtom);
  const shouldReserveWindowButtonSpace = isMac && !isSideBarVisible;

  return (
    <div className=" electron-drag-region flex w-full items-center justify-between p-2">
      <div className="flex items-center gap-2">
        {shouldReserveWindowButtonSpace && <div className="h-8 w-18" />}

        <div className="electron-no-drag flex items-center gap-2">
          {!isSideBarVisible && (
            <Button
              variant="ghost"
              size="sm"
              colour={pocketbookColour ?? colour}
              iconName="arrowLineRight"
              onClick={() => setValue(true)}
            />
          )}

          {iconName && (
            <Icon
              className={cn("pb-1", colour.text)}
              iconName={iconName}
              size="md"
            />
          )}

          <h1 className="pt-0.5 font-title text-xl">{title}</h1>

          {children}
        </div>
      </div>

      <div
        className={cn(
          "electron-no-drag flex items-center gap-2",
          isWindows && "mr-35",
        )}
      >
        {process.env.NODE_ENV === "development" && (
          <div className="family-mono rounded-lg border border-purple-300 bg-purple-100 px-2 pt-px text-sm font-medium text-purple-500">
            DEV
          </div>
        )}

        <NoteSearchBar />
      </div>
    </div>
  );
};
