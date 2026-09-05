import { createStart } from "@tanstack/react-start";
import { dayjsSerializer } from "./common/serialization/dayjs.serializer";

export const startInstance = createStart(() => ({
  serializationAdapters: [dayjsSerializer],
}));
