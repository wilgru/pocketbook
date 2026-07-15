import { useAtom } from "jotai";
import { colours } from "src/colours/colours.constant";
import { isSideBarVisibleAtom } from "src/common/atoms/isSidebarVisibleAtom";
import { Button } from "src/common/components/Button/Button";
import { useElectronEnvironment } from "src/common/hooks/useElectronEnvironment";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { NoteSearchBar } from "src/notes/components/NoteSearchBar/NoteSearchBar";
import type { Colour } from "src/colours/Colour.type";

type ToolbarProps = {
  iconName?: string;
  title: string;
  colour?: Colour;
  pocketbookColour?: Colour;
  children?: JSX.Element;
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
    <div className=" w-full flex items-center justify-between p-2 electron-drag-region">
      <div className="flex items-center gap-2">
        {shouldReserveWindowButtonSpace && <div className="h-8 w-[4.5rem]" />}

        <div className="flex items-center gap-2 electron-no-drag">
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

          <h1 className="font-title text-xl pt-0.5">{title}</h1>

          {children}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 electron-no-drag",
          isWindows && "mr-[140px]",
        )}
      >
        <NoteSearchBar />
      </div>
    </div>
  );
};
