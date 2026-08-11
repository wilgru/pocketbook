import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Dialog } from "src/common/components/Dialog/Dialog";
import NoteEditor from "src/notes/components/NoteEditor/NoteEditor";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

type NoteEditorModalProps = {
  note: Note;
  colour?: Colour;
};

export const NoteEditorModal = ({ note, colour }: NoteEditorModalProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const onClose = () => {
    navigate({
      to: location.pathname,
      search: (old) => ({ ...old, noteId: null }),
    });
  };

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog
        accessibleTitle={note.title || "Note Editor"}
        className="h-[90vh] w-3xl max-w-[90vw]"
        bodyScrollable
      >
        <div className="flex h-full min-h-0 flex-col px-6 pt-6">
          <NoteEditor key={note.id} note={note} colour={colour} />
        </div>
      </Dialog>
    </DialogPrimitive.Root>
  );
};
