import { cn } from "src/common/utils/cn";
import { NoteTableItem } from "src/notes/components/NoteTableSection/NoteTableItem";
import type { ReactNode } from "react";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

type TableColumn = {
  key: string;
  label: string;
  className?: string;
  tagGroupId?: string | null;
};

type NoteTableSectionProps = {
  title?: string | null;
  topSection?: ReactNode;
  columns: TableColumn[];
  notes: Note[];
  colour: Colour;
};

const columnWidths: Record<string, string> = {
  title: "30%",
  created: "15%",
};

export const NoteTableSection = ({
  title,
  topSection,
  columns,
  notes,
  colour,
}: NoteTableSectionProps) => {
  return (
    <section className="w-full flex flex-col gap-0.5 items-start">
      {title && (
        <h3 className="text-slate-500 font-title text-xl w-full px-2 pt-2">
          {title}
        </h3>
      )}

      {topSection}

      <div className="w-full border border-slate-300 rounded-xl drop-shadow-sm bg-white overflow-hidden">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                style={{ width: columnWidths[column.key] }}
              />
            ))}
          </colgroup>

          <thead className="border-b border-slate-300 bg-white">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-3 py-2 text-left text-xs font-medium text-slate-500",
                    index < columns.length - 1 && "border-r border-slate-100",
                    column.className,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {notes
              .filter((note) => note.title)
              .map((note) => (
                <NoteTableItem
                  key={note.id}
                  note={note}
                  colour={colour}
                  tagGroupIds={columns
                    .map((column) => column.tagGroupId)
                    .filter(
                      (tagGroupId): tagGroupId is string | null =>
                        tagGroupId !== undefined,
                    )}
                />
              ))}
          </tbody>
        </table>
      </div>

      <div className="pl-2 pt-1 text-sm text-slate-400">
        Total notes: {notes.length}
      </div>
    </section>
  );
};
