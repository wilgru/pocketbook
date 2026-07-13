import { UpdateEditor } from "src/updates/components/UpdateEditor/UpdateEditor";
import { cn } from "src/common/utils/cn";
import type { Colour } from "src/colours/Colour.type";
import type { UpdateGroup } from "src/updates/Update.type";
import { UpdateTimelineItem } from "../UpdateTimelineItem/UpdateTimelineItem";
import { colours } from "src/colours/colours.constant";
import { Link } from "@tanstack/react-router";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";

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
                    <span
                      className={cn(
                        "flex items-center gap-1 text-slate-700",
                        update.action === "cancelled" && "line-through",
                      )}
                    >
                      {update.action === "completed"
                        ? "Completed task "
                        : "Cancelled task "}
                      {update.data.title ?? "Untitled Note"}
                    </span>
                  }
                  dateText={update.date.format("h:mm A")}
                  showTopLine={index !== 0}
                  showBottomPadding={index === updateGroup.updates.length - 1}
                />
              );
            case "note":
              return (
                <UpdateTimelineItem
                  key={update.id}
                  iconName="pencil"
                  iconColour={colour}
                  headline={
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-slate-500">
                        {update.data.title
                          ? "Created note"
                          : "Created sticky note"}
                      </p>
                      <Link
                        key={update.data.id}
                        to="/$pocketbookId/notes"
                        params={{ pocketbookId: pocketbookId ?? "" }}
                        search={{ noteId: update.data.id }}
                        className="underline flex items-center gap-1 text-slate-600 hover:text-slate-800"
                      >
                        {update.data.title ?? "Untitled Note"}
                      </Link>
                    </div>
                  }
                  dateText={update.date.format("h:mm A")}
                  showTopLine={index !== 0}
                  showBottomPadding={index === updateGroup.updates.length - 1}
                />
              );
            case "comment":
              return (
                <UpdateEditor
                  key={update.id}
                  update={update.data}
                  colour={colour}
                  showTimeOnly
                  showBottomPadding={index === updateGroup.updates.length - 1}
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
