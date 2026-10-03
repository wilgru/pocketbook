import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { getCommentsServerFn } from "src/comments/serverFunctions/getComments";
import { Button } from "src/common/components/Button/Button";
import {
  Dropdown,
  DropdownRadioGroup,
  DropdownRadioItem,
} from "src/common/components/Dropdown/Dropdown";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { getTasksServerFn } from "src/tasks/serverFunctions/getTasks";
import { UpdatesLayout } from "src/updates/components/UpdatesLayout/UpdatesLayout";

type PlannerView = "daily" | "history";

export const Route = createFileRoute("/_layout/$pocketbookId/planner")({
  component: UpdatesComponent,
  beforeLoad: async ({ location }) => {
    requireClientAuth(location);
  },
  validateSearch: (
    search: Record<string, unknown>,
  ): { view: PlannerView; date: string } => {
    const parsedDate =
      typeof search.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(search.date) &&
      dayjs(search.date).isValid()
        ? search.date
        : null;

    return {
      view: search.view === "history" ? "history" : "daily",
      date: parsedDate ?? dayjs().format("YYYY-MM-DD"),
    };
  },
});

function UpdatesComponent() {
  const { pocketbookId } = Route.useParams();
  const { currentPocketbook } = useCurrentPocketbook();
  const { view, date } = Route.useSearch();
  const navigate = useNavigate();
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  const { data: commentsData } = useServerQuery(getCommentsServerFn, {
    pocketbookId,
  });
  const { data: notesData } = useServerQuery(getNotesServerFn, {
    pocketbookId,
  });
  const { data: tasksData } = useServerQuery(getTasksServerFn, {
    pocketbookId,
  });

  const [pendingNew, setPendingNew] = useState(false);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <Toolbar
        iconName="calendarDots"
        title="Planner"
        colour={currentPocketbook?.colour}
      >
        <DropdownMenu.Root onOpenChange={setIsViewDropdownOpen}>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              colour={currentPocketbook?.colour}
              iconName="eye"
              active={isViewDropdownOpen}
            />
          </DropdownMenu.Trigger>

          <Dropdown className="w-40" sideOffset={2} align="start">
            <DropdownRadioGroup
              value={view}
              onValueChange={(value) =>
                navigate({
                  to: ".",
                  search: (prev) => ({ ...prev, view: value as PlannerView }),
                  // Lets history view scroll to the selected date without the router restoring the old position.
                  resetScroll: false,
                })
              }
            >
              <DropdownRadioItem
                value="daily"
                colour={currentPocketbook?.colour}
              >
                Daily
              </DropdownRadioItem>
              <DropdownRadioItem
                value="history"
                colour={currentPocketbook?.colour}
              >
                History
              </DropdownRadioItem>
            </DropdownRadioGroup>
          </Dropdown>
        </DropdownMenu.Root>

        <Button
          variant="ghost"
          size="sm"
          colour={currentPocketbook?.colour}
          iconName="chatCenteredText"
          onClick={() => setPendingNew(true)}
        />
      </Toolbar>

      <UpdatesLayout
        notes={notesData?.notes ?? []}
        tasks={tasksData?.tasks ?? []}
        comments={commentsData?.comments ?? []}
        colour={currentPocketbook?.colour}
        view={view}
        selectedDate={dayjs(date)}
        onSelectDate={(newDate) =>
          navigate({
            to: ".",
            search: (prev) => ({ ...prev, date: newDate.format("YYYY-MM-DD") }),
            // Otherwise the router restores the old scroll position after render, undoing our jump to the section.
            resetScroll: false,
          })
        }
        pendingNew={pendingNew}
        onCreateNew={() => setPendingNew(true)}
        onCancelNew={() => setPendingNew(false)}
      />
    </div>
  );
}
