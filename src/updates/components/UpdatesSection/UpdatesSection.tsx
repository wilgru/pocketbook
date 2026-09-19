import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { colours } from "src/colours/colours.constant";
import { CommentEditor } from "src/comments/components/CommentEditor/CommentEditor";
import { StickyNoteListItem } from "src/notes/components/NoteListItem/StickyNoteListItem";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { UpdateTimelineItem } from "../UpdateTimelineItem/UpdateTimelineItem";
import type { Colour } from "src/colours/Colour.type";
import type { UpdateGroup } from "src/updates/Update.type";

type UpdatesSectionProps = {
  title: string;
  updateGroup: UpdateGroup;
  colour: Colour;
};

export const UpdatesSection = ({
  title,
  updateGroup,
  colour,
}: UpdatesSectionProps) => {
  const { pocketbookId } = useCurrentPocketbook();

  return (
    <section id={title} className="flex w-full flex-col pb-10">
      <h2 className="pl-0.5 font-title text-3xl">{title}</h2>

      <div className="relative flex w-full flex-col border-t border-slate-200">
        {updateGroup.updates.map((update, index) => {
          const isLastUpdate = index === updateGroup.updates.length - 1;

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
                          "font-medium text-slate-700 hover:text-slate-800 hover:underline",
                          update.action === "cancelled" && "line-through",
                        )}
                      >
                        {update.data.title ?? "Untitled Task"}
                      </Link>
                    </p>
                  }
                  dateText={update.date.format("h:mm a")}
                  hideBottomLine={isLastUpdate}
                >
                  {update.data.note && (
                    <p className="pl-1 text-xs text-slate-500">
                      From note{" "}
                      <Link
                        key={update.data.id}
                        to="/$pocketbookId/notes"
                        params={{ pocketbookId: pocketbookId ?? "" }}
                        search={{ noteId: update.data.id }}
                        className="text-slate-500 hover:text-slate-600 hover:underline"
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
                        className="font-medium text-slate-700 hover:text-slate-800 hover:underline"
                      >
                        {update.data.title ?? "Untitled Note"}
                      </Link>
                    </p>
                  }
                  dateText={update.date.format("h:mm a")}
                  hideBottomLine={isLastUpdate}
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
                <CommentEditor
                  key={update.id}
                  comment={update.data}
                  colour={colour}
                  showTimeOnly
                  hideBottomLine={isLastUpdate}
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
