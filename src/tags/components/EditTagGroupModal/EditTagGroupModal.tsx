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
      layout: tagGroup?.layout ?? ("list" as TagGroup["layout"]),
    },
    onSubmit: async ({ value }) => {
      const title = value.title.trim();
      const { layout } = value;

      if (tagGroup) {
        await updateTagGroup({
          tagGroupId: tagGroup.id,
          updateTagGroupData: { title, layout },
        });
      } else {
        await createTagGroup({
          createTagGroupData: { title, layout },
        });
      }
    },
  });

  return (
    <Dialog
      title={tagGroup ? "Edit Tag Section" : "Create Tag Group"}
      className="w-100"
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

        <form.Field name="layout">
          {(field) => (
            <div>
              <Label title="Layout" />
              <div className="mt-1 flex items-center gap-4 text-sm">
                {(["list", "table"] as const).map((layout) => (
                  <label key={layout} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="layout"
                      value={layout}
                      checked={field.state.value === layout}
                      onChange={() => field.handleChange(layout)}
                    />
                    {layout === "list" ? "List" : "Table"}
                  </label>
                ))}
              </div>
            </div>
          )}
        </form.Field>
      </div>
    </Dialog>
  );
};
