import { Close } from "@radix-ui/react-dialog";
import { useForm } from "@tanstack/react-form-start";
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
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";
import type { PocketbookSettingsModalPage } from "src/routes/_layout.tsx";

type PocketbookSettingsModalProps = {
  pocketbook: Pocketbook;
  currentPage: PocketbookSettingsModalPage;
};

type PocketbookSettingsFormValues = Pick<
  Pocketbook,
  "title" | "icon" | "colour"
>;

export const PocketbookSettingsModal = ({
  pocketbook,
  currentPage,
}: PocketbookSettingsModalProps) => {
  const { updatePocketbook, isUpdatingPocketbook } = useUpdatePocketbook();

  const defaultValues: PocketbookSettingsFormValues = {
    title: pocketbook.title,
    icon: pocketbook.icon,
    colour: pocketbook.colour,
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await updatePocketbook({
        pocketbookId: pocketbook.id,
        updatePocketbookData: { ...pocketbook, ...value },
      });
    },
  });

  const pages: DialogPage<PocketbookSettingsModalPage>[] = [
    { page: "general", label: "General" },
    { page: "appearance", label: "Appearance" },
    { page: "danger", label: "Danger zone" },
  ];

  return (
    <Dialog
      title="Pocketbook Settings"
      className="h-150 w-200"
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
              onClick={() => void form.handleSubmit()}
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
            <form.Field name="title">
              {(field) => (
                <div>
                  <Label title="Title" />
                  <Input
                    size="md"
                    id={pocketbook.id}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          )}

          {currentPage === "appearance" && (
            <>
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
                {(iconField) => (
                  <form.Field name="colour">
                    {(colourField) => (
                      <div>
                        <Label title="Icon" />
                        <IconPicker
                          selectedIconName={iconField.state.value}
                          colour={colourField.state.value}
                          onSelectIcon={(iconName) =>
                            iconField.handleChange(iconName)
                          }
                        />
                      </div>
                    )}
                  </form.Field>
                )}
              </form.Field>

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
