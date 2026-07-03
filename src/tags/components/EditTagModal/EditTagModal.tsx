import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { ColourPicker } from "src/colours/components/ColourPicker/ColourPicker";
import { Button } from "src/common/components/Button/Button";
import { Input } from "src/common/components/Input/Input";
import { Label } from "src/common/components/Label/Label";
import { LinkMultiInput } from "src/common/components/LinkMultiInput/LinkMultiInput";
import IconPicker from "src/icons/components/IconPicker/IconPicker";
import { useUpdateTag } from "src/tags/hooks/useUpdateTag";
import { DeleteTagModal } from "../DeleteTagModal/DeleteTagModal";
import type { Tag, TagLink } from "src/tags/Tag.type";

type EditTagModalProps = {
  tag: Tag;
  onDeleted?: () => void | Promise<void>;
};

const createEmptyTagLink = (): TagLink => ({
  id: crypto.randomUUID(),
  title: undefined,
  link: "",
});

const toDraftTagLinks = (links: TagLink[]): TagLink[] => [
  ...links.filter((link) => link.link.trim() !== ""),
  createEmptyTagLink(),
];

export const EditTagModal = ({ tag, onDeleted }: EditTagModalProps) => {
  const [editedTag, setEditedTag] = useState<Tag>({
    ...tag,
    links: toDraftTagLinks(tag.links),
  });
  const { updateTag } = useUpdateTag();

  // TODO: find better solution than using useEffect
  useEffect(() => {
    setEditedTag({
      ...tag,
      links: toDraftTagLinks(tag.links),
    });
  }, [tag]);

  const onSaveEdit = async () => {
    if (tag?.id) {
      await updateTag({
        tagId: editedTag.id,
        updateTagData: {
          ...editedTag,
          links: editedTag.links.filter((link) => link.link.trim() !== ""),
        },
      });
    }
  };

  const onEditLinks = (updatedLink: TagLink) => {
    setEditedTag((currentTagToEdit) => {
      const updatedLinks = toDraftTagLinks(
        currentTagToEdit.links.map((link) =>
          link.id === updatedLink.id ? updatedLink : link,
        ),
      );

      return { ...currentTagToEdit, links: updatedLinks };
    });
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black opacity-25 fixed inset-0 data-[state=open]:animate-overlayShow" />
      <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] overflow-y-scroll p-4 focus:outline-none bg-white border border-slate-300 rounded-2xl shadow-2xl  data-[state=open]:animate-contentShow">
        <Dialog.Title className="mb-5 font-title text-xl">
          Edit tag
        </Dialog.Title>

        <div className="flex flex-col gap-3">
          <div>
            <Label title="Name" />
            <Input
              size="md"
              id={tag.id}
              value={editedTag.name}
              onChange={(e) =>
                setEditedTag((currentTagToEdit) => {
                  return { ...currentTagToEdit, name: e.target.value };
                })
              }
            />
          </div>

          <div>
            <Label title="Description" />
            <textarea
              name="description"
              value={editedTag.description ?? undefined}
              placeholder="No description"
              onChange={(e) =>
                setEditedTag((currentTagToEdit) => {
                  return { ...currentTagToEdit, description: e.target.value };
                })
              }
              className="block p-1 text-sm w-full bg-white rounded-md border border-slate-300 placeholder:text-slate-500"
            />
          </div>

          <div>
            <Label
              title="Links"
              tooltipContent="You can add links that will appear underneath this tag's description"
            />

            <LinkMultiInput
              links={editedTag.links}
              onChange={onEditLinks}
            />
          </div>

          <div>
            <Label title="Colour" />
            <ColourPicker
              selectedColourName={editedTag.colour.name}
              onSelectColour={(colour) => {
                setEditedTag((currentTagToEdit) => {
                  return { ...currentTagToEdit, colour: colour };
                });
              }}
            />
          </div>

          <div>
            <Label title="Icon" />
            <IconPicker
              selectedIconName={editedTag.icon}
              colour={editedTag.colour}
              onSelectIcon={(iconName) => {
                setEditedTag((currentTagToEdit) => {
                  return { ...currentTagToEdit, icon: iconName };
                });
              }}
            />
          </div>

          <div className="flex justify-between">
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button colour={colours.red} variant="block" size="sm">
                  Delete
                </Button>
              </Dialog.Trigger>

              <DeleteTagModal tag={tag} onDeleted={onDeleted} />
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
