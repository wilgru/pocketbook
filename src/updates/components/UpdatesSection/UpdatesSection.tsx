import { Link } from "@tanstack/react-router";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { StickyNoteListItem } from "src/notes/components/NoteListItem/StickyNoteListItem";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { UpdateEditor } from "src/updates/components/UpdateEditor/UpdateEditor";
import { UpdateTimelineItem } from "../UpdateTimelineItem/UpdateTimelineItem";
import type { Colour } from "src/colours/Colour.type";
import type { UpdateGroup } from "src/updates/Update.type";

type UpdatesSectionProps = {
  title: string;
  updateGroup: UpdateGroup;
  colour: Colour;
  hideBottomLine?: boolean;
};

export const UpdatesSection = ({
  title,
  updateGroup,
  colour,
  hideBottomLine = false,
}: UpdatesSectionProps) => {
  const { pocketbookId } = useCurrentPocketbook();

  return (
    <section id={title} className="w-full flex flex-col">
      <h2 className="font-title text-xl text-slate-400 py-0.5">{title}</h2>

      <div className="flex flex-col relative">
        {updateGroup.updates.map((update, index) => {
          switch (update.type) {
            case "task":
              return (
                <UpdateTimelineItem
                  key={update.id}
                  iconName={update.action === "completed" ? "check" : "x"}
                  iconColour={
                    update.action === "completed" ? colour : colours.grey
                  }
                  headline={
                    <p className="text-slate-500">
                      {update.action === "completed"
                        ? "Completed task "
                        : "Cancelled task "}

                      <Link
                        key={update.data.id}
                        to="/$pocketbookId/tasks"
                        params={{ pocketbookId: pocketbookId ?? "" }}
                        className={cn(
                          "underline text-slate-600 hover:text-slate-800",
                          update.action === "cancelled" && "line-through",
                        )}
                      >
                        {update.data.title ?? "Untitled Task"}
                      </Link>
                    </p>
                  }
                  dateText={update.date.format("h:mm a")}
                  showBottomPadding={index === updateGroup.updates.length - 1}
                  hideBottomLine={
                    hideBottomLine && index === updateGroup.updates.length - 1
                  }
                >
                  {update.data.note && (
                    <p className="text-slate-400 text-xs pl-1">
                      From note{" "}
                      <Link
                        key={update.data.id}
                        to="/$pocketbookId/notes"
                        params={{ pocketbookId: pocketbookId ?? "" }}
                        search={{ noteId: update.data.id }}
                        className="text-slate-400 hover:text-slate-600 hover:underline"
                      >
                        {update.data.note.title ?? "Untitled Note"}
                      </Link>
                    </p>
                  )}
                </UpdateTimelineItem>
              );
            case "note":
              return (
                <UpdateTimelineItem
                  key={update.id}
                  iconName="pencil"
                  iconColour={colour}
                  headline={
                    <p className="text-slate-500">
                      {update.data.title
                        ? "Created note "
                        : "Created sticky note"}

                      <Link
                        key={update.data.id}
                        to="/$pocketbookId/notes"
                        params={{ pocketbookId: pocketbookId ?? "" }}
                        search={{ noteId: update.data.id }}
                        className="underline text-slate-600 hover:text-slate-800"
                      >
                        {update.data.title ?? "Untitled Note"}
                      </Link>
                    </p>
                  }
                  dateText={update.date.format("h:mm a")}
                  showBottomPadding={index === updateGroup.updates.length - 1}
                  hideBottomLine={
                    hideBottomLine && index === updateGroup.updates.length - 1
                  }
                >
                  {!update.data.title && (
                    <div className="w-80 pl-0.5">
                      <StickyNoteListItem
                        note={update.data}
                        colour={colour}
                        to="/$pocketbookId/notes"
                        hideDate
                      />
                    </div>
                  )}
                </UpdateTimelineItem>
              );
            case "comment":
              return (
                <UpdateEditor
                  key={update.id}
                  update={update.data}
                  colour={colour}
                  showTimeOnly
                  showBottomPadding={index === updateGroup.updates.length - 1}
                  hideBottomLine={
                    hideBottomLine && index === updateGroup.updates.length - 1
                  }
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </section>
  );
};
