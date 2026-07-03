import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { LinkMultiInput } from "src/common/components/LinkMultiInput/LinkMultiInput";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";

type NoteLinksModalProps = {
  links: Link[];
  colour?: Colour;
  onSave: (links: Link[]) => void;
};

export const NoteLinksModal = ({
  links,
  colour = colours.orange,
  onSave,
}: NoteLinksModalProps) => {
  const [editedLinks, setEditedLinks] = useState<Link[]>(links);

  const onAddLink = () => {
    setEditedLinks((current) => [
      ...current,
      { id: crypto.randomUUID(), title: undefined, link: "" },
    ]);
  };

  const onChangeLink = (updatedLink: Link) => {
    setEditedLinks((current) =>
      current.map((l) => (l.id === updatedLink.id ? updatedLink : l)),
    );
  };

  const handleSave = () => {
    onSave(editedLinks.filter((l) => l.link.trim() !== ""));
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black opacity-25 fixed inset-0 data-[state=open]:animate-overlayShow" />
      <Dialog.Content
        className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] overflow-y-scroll p-4 focus:outline-none bg-white border border-slate-300 rounded-2xl shadow-2xl data-[state=open]:animate-contentShow"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Dialog.Title className="mb-5 font-title text-xl">
          Manage links
        </Dialog.Title>

        <div className="flex flex-col gap-4">
          <LinkMultiInput
            links={editedLinks}
            onChange={onChangeLink}
            onAddLink={onAddLink}
          />

          <div className="flex gap-2 justify-end">
            <Dialog.Close asChild>
              <Button aria-label="Close" size="sm" variant="ghost">
                Discard
              </Button>
            </Dialog.Close>

            <Dialog.Close asChild>
              <Button
                aria-label="Save"
                colour={colour}
                size="sm"
                onClick={handleSave}
              >
                Save
              </Button>
            </Dialog.Close>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};
