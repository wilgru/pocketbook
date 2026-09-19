import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "cn";
import { useSetAtom } from "jotai";
import { colours } from "src/colours/colours.constant";
import { isSideBarVisibleAtom } from "src/common/atoms/isSidebarVisibleAtom";
import { Button } from "src/common/components/Button/Button";
import { NavItem } from "src/common/components/NavItem/NavItem";
import { useElectronEnvironment } from "src/common/hooks/useElectronEnvironment";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { PocketbookSwitcher } from "src/pocketbooks/components/PocketbookSwitcher/PocketbookSwitcher";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { useGetPocketbookContentCounts } from "src/pocketbooks/hooks/useGetPocketbookContentCounts";
import { CreateTagGroupModal } from "src/tags/components/CreateTagGroupModal/CreateTagGroupModal";
import { getTagGroupsServerFn } from "src/tags/serverFunctions/getTagGroups";
import { SidebarBookmarkSection } from "./SidebarBookmarkSection";
import { SidebarTagSection } from "./SidebarTagSection";

export const Sidebar = () => {
  const { isWindows } = useElectronEnvironment();

  const { pocketbookId, currentPocketbook, pocketbooks } =
    useCurrentPocketbook();

  const { data: tagGroupsData } = useServerQuery(getTagGroupsServerFn, {
    pocketbookId,
  });

  const { counts } = useGetPocketbookContentCounts();

  const setIsSidebarVisible = useSetAtom(isSideBarVisibleAtom);

  if (!pocketbookId || !currentPocketbook) {
    return null;
  }

  return (
    <aside className="flex h-full max-w-56 min-w-56 flex-col">
      <div
        className={cn(
          "electron-drag-region flex h-12.5 shrink-0 flex-row items-center gap-2 pl-2",
          isWindows ? "justify-between" : "justify-end",
        )}
      >
        {isWindows && (
          <h1 className="pl-2 font-title text-xl text-slate-500">Pocketbook</h1>
        )}

        <Button
          className="electron-no-drag"
          variant="ghost"
          size="sm"
          colour={currentPocketbook.colour}
          onClick={() => setIsSidebarVisible(false)}
          iconName="arrowLineLeft"
        />
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto pr-1 pb-3 pl-3",
          isWindows && "scrollbar-hide",
        )}
      >
        <PocketbookSwitcher
          currentPocketbook={currentPocketbook}
          pocketbooks={pocketbooks}
        />

        <section className="flex flex-col gap-px">
          <NavItem
            ghost
            title="Notes"
            to={`/${pocketbookId}/notes/`}
            colour={currentPocketbook.colour}
            preview={counts?.noteCount}
          />

          <NavItem
            ghost
            title="Tasks"
            to={`/${pocketbookId}/tasks/`}
            colour={currentPocketbook.colour}
            preview={counts?.taskCount}
          />

          <NavItem
            ghost
            title="History"
            to={`/${pocketbookId}/updates`}
            colour={currentPocketbook.colour}
            preview={counts?.updateDayCount}
          />
        </section>

        <SidebarBookmarkSection />

        {process.env.NODE_ENV === "development" && (
          <section className="flex flex-col gap-px">
            <h1 className="font-title text-sm text-slate-400">Media</h1>

            <NavItem
              size="sm"
              title="Images"
              to={"/"}
              colour={colours.grey}
              iconName="image"
            />

            <NavItem
              size="sm"
              title="Audio"
              to={"/"}
              colour={colours.grey}
              iconName="cassette"
            />

            <NavItem
              size="sm"
              title="Locations"
              to={"/"}
              colour={colours.grey}
              iconName="mapPinArea"
            />

            <NavItem
              size="sm"
              title="Quotes"
              to={"/"}
              colour={colours.grey}
              iconName="quotes"
            />

            <NavItem
              size="sm"
              title="Code"
              to={"/"}
              colour={colours.grey}
              iconName="code"
            />
          </section>
        )}

        <SidebarTagSection
          title={"Tags"}
          colour={currentPocketbook.colour}
          isEmpty={tagGroupsData?.ungroupedTags.length === 0}
        >
          {tagGroupsData?.ungroupedTags.map((tag) => (
            <NavItem
              colour={tag.colour}
              title={tag.name}
              preview={tag.noteCount || undefined}
              to={`/${pocketbookId}/tags/${tag.id}`}
              key={tag.id}
              iconName={tag.icon}
            />
          ))}
        </SidebarTagSection>

        {tagGroupsData?.tagGroups.map((tagGroup) => (
          <SidebarTagSection
            title={tagGroup.title}
            tagGroup={tagGroup}
            colour={currentPocketbook.colour}
            isEmpty={tagGroup.tags.length === 0}
            key={tagGroup.id}
          >
            {tagGroup.tags.map((tag) => (
              <NavItem
                iconName={tag.icon}
                colour={tag.colour}
                title={tag.name}
                preview={tag.noteCount || undefined}
                to={`/${pocketbookId}/tags/${tag.id}`}
                key={tag.id}
              />
            ))}
          </SidebarTagSection>
        ))}
      </div>

      <div className="mr-1 ml-3 border-t border-slate-200 bg-slate-50 py-3">
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button
              iconName="plus"
              variant="ghost"
              size="sm"
              className="w-full"
              colour={currentPocketbook.colour}
            >
              Add Tag Group
            </Button>
          </Dialog.Trigger>

          <CreateTagGroupModal />
        </Dialog.Root>
      </div>
    </aside>
  );
};
