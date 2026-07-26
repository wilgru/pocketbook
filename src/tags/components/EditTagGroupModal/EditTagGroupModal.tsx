import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { Input } from "src/common/components/Input/Input";
import { Label } from "src/common/components/Label/Label";
import { DeleteTagGroupModal } from "src/tags/components/DeleteTagGroupModal/DeleteTagGroupModal";
import { useUpdateTagGroup } from "src/tags/hooks/useUpdateTagGroup";
import type { TagGroup } from "src/tags/Tag.type";

type EditTagGroupModalProps = {
  tagGroup: TagGroup;
};

export const EditTagGroupModal = ({ tagGroup }: EditTagGroupModalProps) => {
  const [editedTitle, setEditedTitle] = useState(tagGroup.title);
  const { updateTagGroup } = useUpdateTagGroup();

  const onSaveEdit = async () => {
    await updateTagGroup({
      tagGroupId: tagGroup.id,
      updateTagGroupData: { title: editedTitle.trim() },
    });
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black opacity-25 fixed inset-0 data-[state=open]:animate-overlayShow" />
      <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] overflow-y-scroll p-4 focus:outline-none bg-white border border-slate-300 rounded-2xl shadow-2xl data-[state=open]:animate-contentShow">
        <Dialog.Title className="mb-5 font-title text-xl">
          Edit tag section
        </Dialog.Title>

        <div className="flex flex-col gap-3">
          <div>
            <Label title="Title" />
            <Input
              size="md"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </div>

          <div className="flex justify-between">
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button colour={colours.red} variant="ghost" size="sm">
                  Delete
                </Button>
              </Dialog.Trigger>

              <DeleteTagGroupModal tagGroup={tagGroup} />
            </Dialog.Root>

            <div className="flex gap-2 justify-end">
              <Dialog.Close asChild>
                <Button aria-label="Close" size="sm" variant="ghost">
                  Discard
                </Button>
              </Dialog.Close>

              <Dialog.Close asChild>
                <Button
                  aria-label="Confirm"
                  colour={colours.green}
                  size="sm"
                  onClick={onSaveEdit}
                >
                  Save
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};
