import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { dayjsSerializer } from "./common/serialization/dayjs.serializer";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  serializationAdapters: [dayjsSerializer],
}));
