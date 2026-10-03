import { useServerQuery } from "src/common/hooks/useServerQuery";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { type Pocketbook } from "src/pocketbooks/pocketbooks.schema";
import { getPocketbooksServerFn } from "../serverFunctions/getPocketbooks";

type UseCurrentPocketbookResponse = {
  pocketbookId: string;
  currentPocketbook: Pocketbook | undefined;
  pocketbooks: Pocketbook[];
};

export const useCurrentPocketbook = (): UseCurrentPocketbookResponse => {
  const { pocketbookId } = useCurrentPocketbookId();
  const { data: pocketbooksData } = useServerQuery(getPocketbooksServerFn, {});

  const currentPocketbook = pocketbooksData?.pocketbooks.find(
    (pocketbook) => pocketbook.id === pocketbookId,
  );

  return {
    pocketbookId,
    currentPocketbook,
    pocketbooks: pocketbooksData?.pocketbooks ?? [],
  };
};
