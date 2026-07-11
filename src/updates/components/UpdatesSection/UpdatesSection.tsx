import { Icon } from "src/icons/components/Icon/Icon";
import { UpdateEditor } from "src/updates/components/UpdateEditor/UpdateEditor";
import type { Colour } from "src/colours/Colour.type";
import type { UpdatesGroup } from "src/updates/Update.type";

type UpdatesSectionProps = {
  title: string;
  updateGroup: UpdatesGroup;
  colour: Colour;
};

export const UpdatesSection = ({
  title,
  updateGroup,
  colour,
}: UpdatesSectionProps) => {
  return (
    <section id={title} className="w-full flex flex-col gap-3">
      <h2 className="font-title text-3xl">{title}</h2>

      <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 pb-2">
        {updateGroup.normalisedItems.map((item) => {
          const iconName =
            item.type === "task"
              ? item.action === "completed"
                ? "checkCircle"
                : "xCircle"
              : "pencil";

          const actionLabel =
            item.type === "task"
              ? item.action === "completed"
                ? "Completed task"
                : "Cancelled task"
              : item.action === "updated"
                ? "Updated note"
                : "Created note";

          return (
            <p
              key={`${item.id}-${item.action}`}
              className="flex items-center gap-1 text-slate-600"
            >
              <Icon iconName={iconName} size="sm" className="text-slate-400" />
              <span>{actionLabel} </span>
              <span>{item.title || "Untitled"}</span>
            </p>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 relative">
        {updateGroup.updates.map((update) => (
          <UpdateEditor key={update.id} update={update} colour={colour} />
        ))}
      </div>
    </section>
  );
};
