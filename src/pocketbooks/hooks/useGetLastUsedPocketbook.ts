import { useServerQuery } from "src/common/hooks/useServerQuery";
import { getPocketbooksServerFn } from "../serverFunctions/getPocketbooks";
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";

export const useNavigateToLastUsedPocketbook = (): {
  lastUsedPocketbook: Pocketbook | null;
} => {
  const { data: pocketbooksData } = useServerQuery(getPocketbooksServerFn, {});

  const lastUsedPocketbookId =
    typeof window !== "undefined"
      ? localStorage.getItem("lastUsedPocketbookId")
      : null;

  if (pocketbooksData?.pocketbooks.length === 0) {
    return { lastUsedPocketbook: null };
  }

  const lastUsedPocketbook = !lastUsedPocketbookId
    ? null
    : (pocketbooksData?.pocketbooks.find(
        (pocketbook) => pocketbook.id === lastUsedPocketbookId,
      ) ?? null);

  if (!lastUsedPocketbook) {
    const firstPocketbook = pocketbooksData?.pocketbooks[0];

    if (!firstPocketbook) {
      return { lastUsedPocketbook };
    }

    localStorage.setItem("lastUsedPocketbookId", firstPocketbook.id);

    return { lastUsedPocketbook: firstPocketbook };
  }

  return { lastUsedPocketbook };
};
