import { TaskProgressBar } from "src/tasks/components/TaskProgressBar/TaskProgressBar";
import { TaskProgressCircle } from "src/tasks/components/TaskProgressCircle/TaskProgressCircle";
import type { Colour } from "src/colours/Colour.type";

type TaskProgressType = "circle" | "bar";

type TaskProgressProps = {
  completed: number;
  cancelled: number;
  total: number;
  colour?: Colour;
  type?: TaskProgressType;
  showInfoPopover?: boolean;
};

export const TaskProgress = ({
  completed,
  cancelled,
  total,
  colour,
  type = "circle",
  showInfoPopover = false,
}: TaskProgressProps) => {
  if (type === "bar") {
    return (
      <TaskProgressBar
        completed={completed}
        cancelled={cancelled}
        total={total}
        colour={colour}
        showInfoPopover={showInfoPopover}
      />
    );
  }

  return (
    <TaskProgressCircle
      completed={completed}
      cancelled={cancelled}
      total={total}
      colour={colour}
      showInfoPopover={showInfoPopover}
    />
  );
};
