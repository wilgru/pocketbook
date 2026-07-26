import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { ColourPicker } from "src/colours/components/ColourPicker/ColourPicker";
import { Button } from "src/common/components/Button/Button";
import { Input } from "src/common/components/Input/Input";
import { Label } from "src/common/components/Label/Label";
import { cn } from "src/common/utils/cn";
import IconPicker from "src/icons/components/IconPicker/IconPicker";
import { useUpdatePocketbook } from "src/pocketbooks/hooks/useUpdatePocketbook";
import type { Pocketbook } from "src/pocketbooks/Pocketbook.type";
import type { PocketbookSettingsModalPage } from "src/routes/_layout.tsx";

type PocketbookSettingsModalProps = {
  pocketbook: Pocketbook;
  currentPage: PocketbookSettingsModalPage;
};

export const PocketbookSettingsModal = ({
  pocketbook,
  currentPage,
}: PocketbookSettingsModalProps) => {
  const [editedPocketbook, setEditedPocketbook] = useState(pocketbook);
  const { updatePocketbook, isUpdatingPocketbook } = useUpdatePocketbook();

  const onSaveEdit = async () => {
    await updatePocketbook({
      pocketbookId: pocketbook.id,
      updatePocketbookData: {
        ...pocketbook,
        title: editedPocketbook.title,
        icon: editedPocketbook.icon,
        colour: editedPocketbook.colour,
      },
    });
  };

  const pages: Array<{
    page: PocketbookSettingsModalPage;
    label: string;
  }> = [
    { page: "general", label: "General" },
    { page: "appearance", label: "Appearance" },
    { page: "danger", label: "Danger zone" },
  ];

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black opacity-25 fixed inset-0 data-[state=open]:animate-overlayShow" />
      <Dialog.Content className="fixed top-[50%] left-[50%] h-[85vh] w-[92vw] max-w-[720px] translate-x-[-50%] translate-y-[-50%] overflow-y-scroll p-4 focus:outline-none bg-white border border-slate-300 rounded-2xl shadow-2xl data-[state=open]:animate-contentShow">
        <Dialog.Title className="mb-4 font-title text-xl">
          Pocketbook settings
        </Dialog.Title>

        <div className="flex gap-4 h-full">
          <nav className="w-40 border-r border-slate-200 pr-3">
            <ul className="flex flex-col gap-1">
              {pages.map(({ page, label }) => (
                <li key={page}>
                  <Link
                    to="."
                    search={(prev) => ({
                      ...prev,
                      modal: "pocketbook-settings",
                      modalPage: page,
                    })}
                    replace
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors",
                      currentPage === page
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              {currentPage === "general" && (
                <div>
                  <Label title="Title" />
                  <Input
                    size="md"
                    id={pocketbook.id}
                    value={editedPocketbook.title}
                    onChange={(e) =>
                      setEditedPocketbook((current) => ({
                        ...current,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {currentPage === "appearance" && (
                <>
                  <div>
                    <Label title="Colour" />
                    <ColourPicker
                      selectedColourName={editedPocketbook.colour.name}
                      onSelectColour={(colour) =>
                        setEditedPocketbook((current) => ({
                          ...current,
                          colour,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label title="Icon" />
                    <IconPicker
                      selectedIconName={editedPocketbook.icon}
                      colour={editedPocketbook.colour}
                      onSelectIcon={(iconName) =>
                        setEditedPocketbook((current) => ({
                          ...current,
                          icon: iconName,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label title="Font" />
                  </div>

                  <div>
                    <Label title="Paper" />
                  </div>
                </>
              )}

              {currentPage === "danger" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Destructive settings will live here.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
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
                  disabled={isUpdatingPocketbook}
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
