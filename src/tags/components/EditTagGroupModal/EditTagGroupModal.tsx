import { Root, Trigger, Close } from "@radix-ui/react-dialog";
import { useForm } from "@tanstack/react-form-start";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { Dialog } from "src/common/components/Dialog/Dialog";
import { Input } from "src/common/components/Input/Input";
import { Label } from "src/common/components/Label/Label";
import { DeleteTagGroupModal } from "src/tags/components/DeleteTagGroupModal/DeleteTagGroupModal";
import { useCreateTagGroup } from "src/tags/hooks/useCreateTagGroup";
import { useUpdateTagGroup } from "src/tags/hooks/useUpdateTagGroup";
import type { TagGroup } from "src/tags/tags.schema";

type EditTagGroupModalProps = {
  tagGroup?: TagGroup;
};

export const EditTagGroupModal = ({ tagGroup }: EditTagGroupModalProps) => {
  const { createTagGroup } = useCreateTagGroup();
  const { updateTagGroup } = useUpdateTagGroup();

  const form = useForm({
    defaultValues: {
      title: tagGroup?.title ?? "",
    },
    onSubmit: async ({ value }) => {
      const title = value.title.trim();

      if (tagGroup) {
        await updateTagGroup({
          tagGroupId: tagGroup.id,
          updateTagGroupData: { title },
        });
      } else {
        await createTagGroup({
          createTagGroupData: { title },
        });
      }
    },
  });

  return (
    <Dialog
      title={tagGroup ? "Edit Tag Section" : "Create Tag Group"}
      className="w-100"
      hideDividers
      footer={
        <div className="flex justify-between">
          {tagGroup ? (
            <Root>
              <Trigger asChild>
                <Button colour={colours.red} variant="ghost" size="sm">
                  Delete
                </Button>
              </Trigger>

              <DeleteTagGroupModal tagGroup={tagGroup} />
            </Root>
          ) : (
            <div />
          )}
          <div className="flex justify-end gap-2">
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
                onClick={() => void form.handleSubmit()}
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
        <form.Field name="title">
          {(field) => (
            <Input
              size="md"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      </div>
    </Dialog>
  );
};
