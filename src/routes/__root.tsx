// import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRoute,
  HeadContent,
  Navigate,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
// import { TanStackRouterDevtoolsPanel } from "@tanstack/router-devtools";
import { useState } from "react";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { useNavigateToLastUsedPocketbook } from "src/pocketbooks/hooks/useGetLastUsedPocketbook";
import { getPocketbooksServerFn } from "src/pocketbooks/serverFunctions/getPocketbooks";

const NotFoundComponent = () => {
  const { data: pocketbooksData } = useServerQuery(getPocketbooksServerFn, {});
  const { lastUsedPocketbook } = useNavigateToLastUsedPocketbook();

  console.log(pocketbooksData);
  if (pocketbooksData === undefined) {
    return <div>Loading pocketbooks...</div>; // TODO: handle this better, use a spinner/loading component?
  }

  if (!lastUsedPocketbook) {
    return <Navigate to="/create-pocketbook" replace={true} />;
  }

  return (
    <Navigate
      to="/$pocketbookId/notes"
      params={{ pocketbookId: lastUsedPocketbook.id }}
      search={{ noteId: null }}
      replace={true}
    />
  );
};

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          {/* <TanStackDevtools
                plugins={[
                  {
                    name: "TanStack Query",
                    render: <ReactQueryDevtoolsPanel />,
                  },
                  {
                    name: "TanStack Router",
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              /> */}
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Pocketbook" },
      { name: "theme-color", content: "#000000" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", type: "image/png", href: "/icon.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});
