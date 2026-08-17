import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { TagPill } from "src/tags/components/TagPill/TagPill";
import { useCreateTag } from "src/tags/hooks/useCreateTag";
import { useGetTags } from "src/tags/hooks/useGetTags";
import type { Colour } from "src/colours/Colour.type";
import type { Tag } from "src/tags/Tag.type";

type TagSelectProps = {
  initialTags: Tag[];
  colour?: Colour;
  onChange: (tags: Tag[]) => void;
};

export const TagSelect = ({
  initialTags,
  colour = colours.orange,
  onChange,
}: TagSelectProps) => {
  const { tags } = useGetTags();
  const { createTag } = useCreateTag();

  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);
  const [search, setSearch] = useState("");

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedTags.some((selectedTag) => selectedTag.id === tag.id),
  );

  const handleSelectTag = (tag: Tag) => {
    const newTags = [...selectedTags, tag];

    setSelectedTags(newTags);
    onChange(newTags);
    setSearch("");
  };

  const handleCreateTag = async () => {
    if (!search.trim()) {
      return;
    }

    const newTag = await createTag({
      createTagData: {
        name: search.trim(),
        description: null,
        links: [],
        tagGroupId: null,
        colour: colours.orange,
        layout: "list",
        icon: "tag",
        sortBy: "created",
        sortDirection: "desc",
      },
    });
    const newTags = [...selectedTags, newTag];

    setSelectedTags(newTags);
    onChange(newTags);
    setSearch("");
  };

  const handleRemoveTag = (tagId: string) => {
    const newTags = selectedTags.filter((tag) => tag.id !== tagId);

    setSelectedTags(newTags);
    onChange(newTags);
  };

  return (
    <div className="flex flex-row gap-2 relative">
      {selectedTags.map((tag) => (
        <TagPill
          key={tag.id}
          tag={tag}
          closable
          onClick={() => handleRemoveTag(tag.id)}
        />
      ))}

      <ControlPopover
        className="flex flex-col text-sm pt-3 px-3 w-48"
        trigger={
          <div>
            <Button variant="ghost" size="sm" colour={colour} iconName="tag" />
          </div>
        }
      >
        <input
          type="text"
          className="rounded-lg px-2 py-1 text-xs border border-slate-300 focus:outline-hidden focus:border-orange-400"
          placeholder="search for a tag"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />

        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto py-3">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className={cn(
                "rounded-lg flex items-center gap-2 px-2 py-1 cursor-pointer text-sm",
                tag.colour.secondary.backgroundHovered,
                tag.colour.secondary.textHovered,
              )}
              onClick={() => handleSelectTag(tag)}
            >
              <Icon
                iconName={tag.icon}
                size="sm"
                className={tag.colour.primary.text}
                weight="regular"
              />
              {tag.name}
            </div>
          ))}

          {search.trim().length > 0 &&
            !tags.some((tag) => tag.name === search) && (
              <div
                className={cn(
                  "rounded-lg flex items-center gap-2 px-2 py-1 cursor-pointer text-sm",
                  colour.secondary.backgroundHovered,
                  colour.secondary.textHovered,
                )}
                onMouseDown={handleCreateTag}
              >
                <PlusIcon className="fill-slate-500" size={18} />
                Create "{search.trim()}"
              </div>
            )}
        </div>
      </ControlPopover>
    </div>
  );
};
