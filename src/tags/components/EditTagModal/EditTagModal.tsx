import { Close, Root, Trigger } from "@radix-ui/react-dialog";
import { useForm } from "@tanstack/react-form-start";
import { colours } from "src/colours/colours.constant";
import { ColourPicker } from "src/colours/components/ColourPicker/ColourPicker";
import { Button } from "src/common/components/Button/Button";
import { Dialog } from "src/common/components/Dialog/Dialog";
import { Input } from "src/common/components/Input/Input";
import { Label } from "src/common/components/Label/Label";
import { LinkMultiInput } from "src/common/components/LinkMultiInput/LinkMultiInput";
import IconPicker from "src/icons/components/IconPicker/IconPicker";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { useCreateTag } from "src/tags/hooks/useCreateTag";
import { useUpdateTag } from "src/tags/hooks/useUpdateTag";
import { DeleteTagModal } from "../DeleteTagModal/DeleteTagModal";
import type { Link } from "src/common/types/Link.type";
import type { Tag } from "src/tags/tags.schema";

type TagFormValues = Omit<Tag, "id" | "noteCount" | "created" | "updated"> & {
  id?: string;
};

type EditTagModalProps = {
  tag?: Tag;
  tagGroupId?: string;
  onDeleted?: () => void | Promise<void>;
};

const toDraftTagLinks = (links: Link[]): Link[] => [
  ...links.filter((link) => link.link.trim() !== ""),
  {
    id: crypto.randomUUID(),
    title: undefined,
    link: "",
  },
];

export const EditTagModal = ({
  tag,
  tagGroupId,
  onDeleted,
}: EditTagModalProps) => {
  const { pocketbookId } = useCurrentPocketbookId();
  const { createTag } = useCreateTag();
  const { updateTag } = useUpdateTag();

  const defaultValues: TagFormValues = {
    pocketbookId: tag?.pocketbookId ?? pocketbookId,
    name: tag?.name ?? "",
    description: tag?.description ?? null,
    colour: tag?.colour ?? colours.orange,
    icon: tag?.icon ?? "tag",
    layout: tag?.layout ?? "list",
    links: toDraftTagLinks(tag?.links ?? []),
    tagGroupId: tag?.groupByTagGroupId ?? tagGroupId ?? null,
    groupBy: tag?.groupBy ?? null,
    groupByTagGroupId: tag?.groupByTagGroupId ?? null,
    sortBy: tag?.sortBy ?? "created",
    sortDirection: tag?.sortDirection ?? "desc",
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const links = value.links.filter((link) => link.link.trim() !== "");

      if (tag) {
        await updateTag({
          tagId: tag.id,
          updateTagData: {
            ...tag,
            ...value,
            links,
          },
        });
      } else {
        await createTag({
          createTagData: {
            ...value,
            links,
          },
        });
      }
    },
  });

  return (
    <Dialog
      title={tag ? "Edit Tag" : "Create Tag"}
      className="w-125"
      bodyScrollable
      footer={
        <div className="flex justify-between">
          {tag ? (
            <Root>
              <Trigger asChild>
                <Button colour={colours.red} variant="block" size="sm">
                  Delete
                </Button>
              </Trigger>

              <DeleteTagModal tag={tag} onDeleted={onDeleted} />
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
      <div className="flex flex-col gap-3 p-3">
        <form.Field name="name">
          {(field) => (
            <div>
              <Label title="Name" />
              <Input
                size="md"
                id={tag?.id}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div>
              <Label title="Description" />
              <textarea
                name="description"
                value={field.state.value ?? ""}
                placeholder="No description"
                onChange={(e) => field.handleChange(e.target.value)}
                className="block w-full rounded-md border border-slate-300 bg-white p-1 text-sm placeholder:text-slate-500"
              />
            </div>
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

        <form.Field name="links">
          {(field) => (
            <div>
              <Label
                title="Links"
                tooltipContent="You can add links that will appear underneath this tag's description"
              />

              <LinkMultiInput
                links={field.state.value}
                onChange={(updatedLink) =>
                  field.handleChange(
                    toDraftTagLinks(
                      field.state.value.map((link) =>
                        link.id === updatedLink.id ? updatedLink : link,
                      ),
                    ),
                  )
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field name="colour">
          {(field) => (
            <div>
              <Label title="Colour" />
              <ColourPicker
                selectedColourName={field.state.value.name}
                onSelectColour={(colour) => field.handleChange(colour)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="icon">
          {(field) => (
            <form.Field name="colour">
              {(colourField) => (
                <div>
                  <Label title="Icon" />
                  <IconPicker
                    selectedIconName={field.state.value}
                    allowNoIcon
                    colour={colourField.state.value}
                    onSelectIcon={(iconName) => field.handleChange(iconName)}
                  />
                </div>
              )}
            </form.Field>
          )}
        </form.Field>
      </div>
    </Dialog>
  );
};
