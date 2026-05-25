import { RouterProvider } from "@tanstack/react-router";
import "src/index.css";
import { StrictMode, startTransition } from "react";
import { createRoot } from "react-dom/client";
import { getRouter } from "src/router";

const router = getRouter();
const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Missing root element #app");
}

startTransition(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
});
