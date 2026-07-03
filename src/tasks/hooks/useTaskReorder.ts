import { useCallback } from "react";
import { useUpdateTask } from "src/tasks/hooks/useUpdateTask";
import type { Task } from "src/tasks/Task.type";

type MoveCallbacks = {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

type UseTaskReorderResponse = {
  swapTaskOrder: (taskA: Task, taskB: Task) => void;
  getMoveCallbacks: (index: number, tasks: Task[]) => MoveCallbacks;
};

export const useTaskReorder = (): UseTaskReorderResponse => {
  const { updateTask } = useUpdateTask();

  const swapTaskOrder = useCallback(
    (taskA: Task, taskB: Task) => {
      updateTask({ taskId: taskA.id, updateTaskData: { ...taskA, sortOrder: taskB.sortOrder } });
      updateTask({ taskId: taskB.id, updateTaskData: { ...taskB, sortOrder: taskA.sortOrder } });
    },
    [updateTask],
  );

  const getMoveCallbacks = useCallback(
    (index: number, tasks: Task[]): MoveCallbacks => {
      const onMoveUp =
        index > 0 ? () => swapTaskOrder(tasks[index], tasks[index - 1]) : undefined;
      const onMoveDown =
        index < tasks.length - 1
          ? () => swapTaskOrder(tasks[index], tasks[index + 1])
          : undefined;
      return { onMoveUp, onMoveDown };
    },
    [swapTaskOrder],
  );

  return { swapTaskOrder, getMoveCallbacks };
};
