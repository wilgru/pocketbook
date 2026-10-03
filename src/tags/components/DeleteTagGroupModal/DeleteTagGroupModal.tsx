import * as Dialog from "@radix-ui/react-dialog";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { useDeleteTagGroup } from "src/tags/hooks/useDeleteTagGroup";
import type { TagGroup } from "src/tags/tags.schema";

type DeleteTagGroupModalProps = {
  tagGroup: TagGroup;
};

export const DeleteTagGroupModal = ({ tagGroup }: DeleteTagGroupModalProps) => {
  const { deleteTagGroup } = useDeleteTagGroup();

  const onConfirmDelete = async () => {
    await deleteTagGroup(tagGroup.id);
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black opacity-25 data-[state=open]:animate-overlayShow" />
      <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-125 translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl focus:outline-hidden ">
        <Dialog.Title className="mb-5 font-title text-xl">
          Confirm delete tag section
        </Dialog.Title>
        <Dialog.Description className="mb-5">
          <p className="text-sm">
            Are you sure you want to delete '{tagGroup.title}'? Any tags in this
            section will be moved to the default Tags section.
          </p>
        </Dialog.Description>

        <div className="flex justify-end gap-2">
          <Dialog.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>

          <Dialog.Close asChild>
            <Button colour={colours.red} onClick={onConfirmDelete}>
              Confirm
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};
