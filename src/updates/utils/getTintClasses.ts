import { colours } from "src/colours/colours.constant";
import type { UpdateTint } from "src/updates/Update.type";

export const getTintClasses = (tint: UpdateTint | null | undefined) => {
  switch (tint) {
    case "red":
      return {
        card: "bg-red-50",
        border: "border-red-200",
        notePill: "bg-red-100 text-red-600 hover:bg-red-200",
        colour: colours.red,
      };
    case "yellow":
      return {
        card: "bg-yellow-50",
        border: "border-yellow-200",
        notePill: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
        colour: colours.yellow,
      };
    case "green":
      return {
        card: "bg-green-50",
        border: "border-green-200",
        notePill: "bg-green-100 text-green-600 hover:bg-green-200",
        colour: colours.green,
      };
    case "blue":
      return {
        card: "bg-blue-50",
        border: "border-blue-200",
        notePill: "bg-blue-100 text-blue-600 hover:bg-blue-200",
        colour: colours.blue,
      };
    default:
      return {
        card: "bg-white",
        border: "border-gray-200",
        notePill: "bg-gray-100 text-gray-600 hover:bg-gray-200",
        colour: colours.grey,
      };
  }
};
