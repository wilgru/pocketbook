import { useAtomValue } from "jotai";
import { colours } from "src/colours/colours.constant";
import { taskEditorStateAtom } from "src/common/atoms/taskEditorStateAtom";
import { Button } from "src/common/components/Button/Button";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { NoteSelect } from "src/notes/components/NoteSelect/NoteSelect";
import { TaskDatePicker } from "src/tasks/components/TaskDatePicker/TaskDatePicker";
import { TaskLinksPopover } from "src/tasks/components/TaskLinksPopover/TaskLinksPopover";

export const TaskFloatingToolbar = () => {
  const {
    colour,
    links,
    selectedNote,
    isImportant,
    dueDate,
    isCompleted,
    isCancelled,
    onNoteChange,
    onNoteSelectOpenChange,
    onLinksChange,
    onLinkPopoverOpenChange,
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

        <TaskLinksPopover
          links={links}
          colour={toolbarColour}
          onChange={onLinksChange ?? (() => undefined)}
          onOpenChange={onLinkPopoverOpenChange ?? undefined}
        />

        <NoteSelect
          mode="single"
          selectedNotes={selectedNote ? [selectedNote] : []}
          showPlaceholderText={false}
          colour={toolbarColour}
          onChange={(notes) => onNoteChange?.(notes[0] ?? null)}
          onOpenChange={onNoteSelectOpenChange ?? undefined}
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
