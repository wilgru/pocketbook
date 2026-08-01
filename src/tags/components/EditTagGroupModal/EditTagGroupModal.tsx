import { Root, Trigger, Close } from "@radix-ui/react-dialog";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { Dialog } from "src/common/components/Dialog/Dialog";
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
    <Dialog
      title="Edit Tag Section"
      className="w-100"
      hideDividers
      footer={
        <div className="flex justify-between">
          <Root>
            <Trigger asChild>
              <Button colour={colours.red} variant="ghost" size="sm">
                Delete
              </Button>
            </Trigger>

            <DeleteTagGroupModal tagGroup={tagGroup} />
          </Root>
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
        </div>
      }
    >
      <div className="flex flex-col p-3">
        <Label title="Title" />
        <Input
          size="md"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
        />
      </div>
    </Dialog>
  );
};
