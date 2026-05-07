import type { UpdateTint } from "src/updates/Update.type";

export const getTintClasses = (tint: UpdateTint | null | undefined) => {
  switch (tint) {
    case "red":
      return {
        card: "bg-red-50",
        border: "border-red-100",
        notePill: "bg-red-100 text-red-600 hover:bg-red-200",
      };
    case "yellow":
      return {
        card: "bg-yellow-50",
        border: "border-yellow-100",
        notePill: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      };
    case "green":
      return {
        card: "bg-green-50",
        border: "border-green-100",
        notePill: "bg-green-100 text-green-700 hover:bg-green-200",
      };
    case "blue":
      return {
        card: "bg-blue-50",
        border: "border-blue-100",
        notePill: "bg-blue-100 text-blue-600 hover:bg-blue-200",
      };
    default:
      return {
        card: "bg-slate-50",
        border: "border-slate-100",
        notePill: "bg-slate-100 text-slate-600 hover:bg-slate-200",
      };
  }
};
