import { useAtomValue } from "jotai";
import { colours } from "src/colours/colours.constant";
import { taskEditorStateAtom } from "src/common/atoms/taskEditorStateAtom";
import { Button } from "src/common/components/Button/Button";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { TaskDatePicker } from "src/tasks/components/TaskDatePicker/TaskDatePicker";

export const TaskFloatingToolbar = () => {
  const {
    colour,
    isFlagged,
    dueDate,
    isCompleted,
    isCancelled,
    onLinkClick,
    onFlagClick,
    onDueDateChange,
    onDatePickerOpenChange,
    onDeleteClick,
  } = useAtomValue(taskEditorStateAtom);

  const toolbarColour = colour ?? colours.orange;

  return (
    <div className="flex flex-row items-center gap-1">
      <div className="flex flex-row gap-1 pr-1 border-r-2 border-slate-100">
        <Button
          colour={toolbarColour}
          variant="ghost"
          size="sm"
          iconName="link"
          onClick={onLinkClick ?? undefined}
        />

        <Toggle
          isToggled={isFlagged}
          size="sm"
          colour={toolbarColour}
          onClick={onFlagClick ?? undefined}
          iconName="flag"
        />

        {onDueDateChange && (
          <TaskDatePicker
            dueDate={dueDate}
            colour={toolbarColour}
            isCompleted={isCompleted}
            isCancelled={isCancelled}
            onChange={onDueDateChange}
            onOpenChange={onDatePickerOpenChange ?? undefined}
          />
        )}
      </div>

      <div className="flex flex-row gap-1 pl-1">
        <Button
          variant="ghost"
          size="sm"
          iconName="trash"
          colour={colours.red}
          onClick={onDeleteClick ?? undefined}
        />
      </div>
    </div>
  );
};
