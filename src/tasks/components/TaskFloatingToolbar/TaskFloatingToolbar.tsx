import { useAtomValue } from "jotai";
import { colours } from "src/colours/colours.constant";
import { taskEditorStateAtom } from "src/common/atoms/taskEditorStateAtom";
import { Button } from "src/common/components/Button/Button";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { TaskDatePicker } from "src/tasks/components/TaskDatePicker/TaskDatePicker";

export const TaskFloatingToolbar = () => {
  const {
    colour,
    isImportant,
    dueDate,
    isCompleted,
    isCancelled,
    onLinkClick,
    onFlagClick,
    onDueDateChange,
    onDatePickerOpenChange,
    onDeleteClick,
    onMoveUp,
    onMoveDown,
  } = useAtomValue(taskEditorStateAtom);

  const toolbarColour = colour ?? colours.orange;

  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-row gap-1 border-r-2 pr-1 border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          iconName="caretUp"
          colour={colour}
          onClick={onMoveUp ?? undefined}
          disabled={!onMoveUp}
        />
        <Button
          variant="ghost"
          size="sm"
          iconName="caretDown"
          colour={colour}
          onClick={onMoveDown ?? undefined}
          disabled={!onMoveDown}
        />
      </div>

      <div className="flex flex-row gap-1 border-r-2 px-1 border-slate-100">
        <Toggle
          isToggled={isImportant}
          size="sm"
          colour={colours.red}
          onClick={onFlagClick ?? undefined}
          iconName="warningCircle"
        />

        <Button
          colour={toolbarColour}
          variant="ghost"
          size="sm"
          iconName="link"
          onClick={onLinkClick ?? undefined}
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
