import { Close } from "@radix-ui/react-dialog";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { Dialog } from "src/common/components/Dialog/Dialog";
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
    <Dialog
      title="Create Tag Group"
      className="w-100"
      hideDividers
      footer={
        <div className="flex gap-2 justify-end">
          <Close asChild>
            <Button aria-label="Close" size="sm" variant="ghost">
              Discard
            </Button>
          </Close>

          <Close asChild>
            <Button
              aria-label="Confirm"
              colour={colours.green}
              size="sm"
              onClick={onSaveEdit}
            >
              Save
            </Button>
          </Close>
        </div>
      }
    >
      <div className="flex flex-col p-3">
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
    </Dialog>
  );
};
