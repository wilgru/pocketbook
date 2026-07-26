import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { Input } from "src/common/components/Input/Input";
import { Label } from "src/common/components/Label/Label";
import { useCreateTagGroup } from "src/tags/hooks/useCreateTagGroup";
import type { TagGroup } from "src/tags/Tag.type";

type newTagGroup = Omit<
  TagGroup,
  "id" | "tags" | "groupBy" | "created" | "updated"
>;

export const CreateTagGroupModal = () => {
  const [newTagGroupToEdit, setNewTagGroupToEdit] = useState<newTagGroup>({
    title: "",
  });
  const { createTagGroup } = useCreateTagGroup();

  const onSaveEdit = async () => {
    createTagGroup({
      createTagGroupData: {
        ...newTagGroupToEdit,
      },
    });
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black opacity-25 fixed inset-0 data-[state=open]:animate-overlayShow" />
      <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-112.5 translate-x-[-50%] translate-y-[-50%] overflow-y-scroll p-4 focus:outline-hidden bg-white border border-slate-300 rounded-2xl shadow-2xl  ">
        <Dialog.Title className="mb-5 font-title text-xl">
          Create Tag Group
        </Dialog.Title>

        <div className="flex flex-col gap-3">
          <div>
            <Label title="Title" />
            <Input
              size="md"
              value={newTagGroupToEdit.title}
              onChange={(e) =>
                setNewTagGroupToEdit((currentNewTagGroupToEdit) => {
                  return {
                    ...currentNewTagGroupToEdit,
                    title: e.target.value,
                  };
                })
              }
            />
          </div>

          <div className="flex justify-end w-full">
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
