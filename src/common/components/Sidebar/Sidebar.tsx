import * as Dialog from "@radix-ui/react-dialog";
import { useSetAtom } from "jotai";
import { isSideBarVisibleAtom } from "src/common/atoms/isSidebarVisibleAtom";
import { Button } from "src/common/components/Button/Button";
import { NavItem } from "src/common/components/NavItem/NavItem";
import { useElectronEnvironment } from "src/common/hooks/useElectronEnvironment";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { PocketbookSwitcher } from "src/pocketbooks/components/PocketbookSwitcher/PocketbookSwitcher";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { useGetPocketbookContentCounts } from "src/pocketbooks/hooks/useGetPocketbookContentCounts";
import { CreateTagGroupModal } from "src/tags/components/CreateTagGroupModal/CreateTagGroupModal";
import { useGetTagGroups } from "src/tags/hooks/useGetTagGroups";
import { SidebarBookmarkSection } from "./SidebarBookmarkSection";
import { SidebarTagSection } from "./SidebarTagSection";

export const Sidebar = () => {
  const { isWindows } = useElectronEnvironment();

  const {
    pocketbookId,
    currentPocketbook,
    pocketbooks,
    isFetchingPocketbooks,
  } = useCurrentPocketbook();
  const { ungroupedTags, tagGroups } = useGetTagGroups();
  const { counts } = useGetPocketbookContentCounts();

  const setIsSidebarVisible = useSetAtom(isSideBarVisibleAtom);

  if (isFetchingPocketbooks) {
    return null;
  }

  if (!pocketbookId || !currentPocketbook) {
    return null;
  }

  return (
    <aside className="min-w-56 max-w-56 flex flex-col h-full">
      <div
        className={cn(
          "flex flex-row items-center gap-2 electron-drag-region flex-shrink-0 h-[50px] pl-2",
          isWindows ? "justify-between" : "justify-end",
        )}
      >
        {isWindows && (
          <h1 className="pl-2 font-title text-slate-500 text-xl">Pocketbook</h1>
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
          "flex flex-col gap-3 overflow-y-auto overflow-x-hidden pl-3 pr-1 pb-3 flex-1",
          isWindows && "scrollbar-hide",
        )}
      >
        <PocketbookSwitcher
          currentPocketbook={currentPocketbook}
          pocketbooks={pocketbooks}
        />

        <section className="flex flex-col">
          <NavItem
            ghost
            iconName="pencil"
            title="Notes"
            to={`/${pocketbookId}/notes/`}
            colour={currentPocketbook.colour}
            preview={counts?.noteCount}
          />

          <NavItem
            ghost
            iconName="checkCircle"
            title="Tasks"
            to={`/${pocketbookId}/tasks/`}
            colour={currentPocketbook.colour}
            preview={counts?.taskCount}
          />

          <NavItem
            ghost
            iconName="calendarDots"
            title="Updates"
            to={`/${pocketbookId}/updates`}
            colour={currentPocketbook.colour}
            preview={counts?.updateCount}
          />
        </section>

        <SidebarBookmarkSection />

        <SidebarTagSection
          title={"Tags"}
          colour={currentPocketbook.colour}
          isEmpty={ungroupedTags.length === 0}
        >
          {ungroupedTags.map((tag) => (
            <NavItem
              colour={tag.colour}
              title={tag.name}
              preview={tag.noteCount}
              to={`/${pocketbookId}/tags/${tag.id}`}
              key={tag.id}
              iconName={tag.icon}
            />
          ))}
        </SidebarTagSection>

        {tagGroups.map((tagGroup) => (
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
                preview={tag.noteCount}
                to={`/${pocketbookId}/tags/${tag.id}`}
                key={tag.id}
              />
            ))}
          </SidebarTagSection>
        ))}

        <hr className="w-full border-slate-200" />

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className={cn(
                "pl-0.5 mt-1 w-fit flex items-center gap-1 text-slate-400 transition-colors",
                `hover:${currentPocketbook.colour.textPill}`,
              )}
            >
              <Icon iconName="plus" size="xs" />
              <span className="text-xs">Add Tag Group</span>
            </button>
          </Dialog.Trigger>

          <CreateTagGroupModal />
        </Dialog.Root>
      </div>
    </aside>
  );
};
