import { Close } from "@radix-ui/react-dialog";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { ColourPicker } from "src/colours/components/ColourPicker/ColourPicker";
import { Button } from "src/common/components/Button/Button";
import { Dialog } from "src/common/components/Dialog/Dialog";
import {
  DialogPages,
  type DialogPage,
} from "src/common/components/Dialog/DialogPages";
import { Input } from "src/common/components/Input/Input";
import { Label } from "src/common/components/Label/Label";
import { NavItem } from "src/common/components/NavItem/NavItem";
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

  const pages: DialogPage<PocketbookSettingsModalPage>[] = [
    { page: "general", label: "General" },
    { page: "appearance", label: "Appearance" },
    { page: "danger", label: "Danger zone" },
  ];

  return (
    <Dialog
      title="Pocketbook Settings"
      className="w-200 h-150"
      footer={
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
              disabled={isUpdatingPocketbook}
              onClick={onSaveEdit}
            >
              Save
            </Button>
          </Close>
        </div>
      }
    >
      <DialogPages
        pages={pages}
        renderPageLink={({ page, label }) => (
          <NavItem
            title={label}
            to="."
            search={{
              modal: "pocketbook-settings",
              modalPage: page,
            }}
            activeOptions={{ includeSearch: true }}
          />
        )}
      >
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
      </DialogPages>
    </Dialog>
  );
};
