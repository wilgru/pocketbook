import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { ColourPicker } from "src/colours/components/ColourPicker/ColourPicker";
import { Button } from "src/common/components/Button/Button";
import { Input } from "src/common/components/Input/Input";
import IconPicker from "src/icons/components/IconPicker/IconPicker";
import { useCreatePocketbook } from "src/pocketbooks/hooks/useCreatePocketbook";
import type { Colour } from "src/colours/Colour.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";

export const Route = createFileRoute("/create-pocketbook")({
  component: RouteComponent,
});

type PocketbookToCreate = {
  title: string;
  icon: CustomisationIconName | null;
  colour: Colour;
};

function RouteComponent() {
  const { createPocketbook, isCreatingPocketbook } = useCreatePocketbook();
  const navigate = useNavigate();
  const [pocketbookToCreate, setPocketbookToCreate] =
    useState<PocketbookToCreate>({
      title: "",
      icon: "notebook",
      colour: colours.blue,
    });

  const onClickCreate = async () => {
    const createdPocketbook = await createPocketbook({
      createPocketbookData: {
        title: pocketbookToCreate.title,
        icon: pocketbookToCreate.icon,
        colour: pocketbookToCreate.colour,
      },
    });

    if (!createdPocketbook) {
      return;
    }

    navigate({ to: `/${createdPocketbook.id}/notes` });
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-slate-100">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-slate-300 bg-white p-6 drop-shadow-sm">
        <h1 className="font-title text-4xl font-normal tracking-tight ">
          New Pocketbook
        </h1>
        <div className="space-y-6">
          <div>
            <label className="text-sm leading-6 font-medium">Title</label>
            <div>
              <Input
                onChange={(e) =>
                  setPocketbookToCreate((currentPocketbookToCreate) => {
                    return {
                      ...currentPocketbookToCreate,
                      title: e.target.value,
                    };
                  })
                }
                id="title"
                type="text"
                value={pocketbookToCreate.title}
              />
            </div>
          </div>
          <div>
            <label className="text-sm leading-6 font-medium ">Icon</label>
            <div>
              <IconPicker
                onSelectIcon={(iconName: CustomisationIconName | null) => {
                  setPocketbookToCreate((currentPocketbookToCreate) => {
                    return { ...currentPocketbookToCreate, icon: iconName };
                  });
                }}
                selectedIconName={pocketbookToCreate.icon}
                colour={pocketbookToCreate.colour}
              />
            </div>
          </div>
          <div>
            <label className="text-sm leading-6 font-medium ">Colour</label>
            <div>
              <ColourPicker
                onSelectColour={(colour: Colour) => {
                  setPocketbookToCreate((currentPocketbookToCreate) => {
                    return { ...currentPocketbookToCreate, colour: colour };
                  });
                }}
                selectedColourName={pocketbookToCreate.colour.name}
              />
            </div>
          </div>
          <div>
            <Button disabled={isCreatingPocketbook} onClick={onClickCreate}>
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
