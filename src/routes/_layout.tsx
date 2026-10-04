import * as Dialog from "@radix-ui/react-dialog";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { isSideBarVisibleAtom } from "src/common/atoms/isSidebarVisibleAtom.ts";
import { PocketbookSettingsModal } from "src/pocketbooks/components/PocketbookSettingsModal/PocketbookSettingsModal";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import requireClientAuth from "src/credentials/utils/requireClientAuth";
import { Sidebar } from "../common/components/Sidebar/Sidebar.tsx";

export type PocketbookSettingsModalPage =
  "general" | "appearance" | "credentials" | "danger";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    await requireClientAuth(location);
  },
});

function RouteComponent() {
  const isSideBarVisible = useAtomValue(isSideBarVisibleAtom);
  const navigate = useNavigate();
  const { currentPocketbook } = useCurrentPocketbook();
  const { modal, modalPage } = useRouterState({
    select: (state) => {
      const search = state.location.search as Record<string, unknown>;
      const page =
        search.modalPage === "general" ||
        search.modalPage === "appearance" ||
        search.modalPage === "metrics" ||
        search.modalPage === "credentials" ||
        search.modalPage === "danger"
          ? (search.modalPage as PocketbookSettingsModalPage)
          : undefined;

      return {
        modal:
          search.modal === "pocketbook-settings"
            ? "pocketbook-settings"
            : undefined,
        modalPage: page,
      };
    },
  });

  const isSettingsModalOpen = modal === "pocketbook-settings";

  const onSettingsModalOpenChange = (open: boolean) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        modal: open ? "pocketbook-settings" : undefined,
        modalPage: open ? "general" : undefined,
      }),
      replace: true,
    });
  };

  return (
    <div className="fixed flex h-screen w-screen bg-slate-50">
      {isSideBarVisible && <Sidebar />}
      {/* all the other elements */}
      <div id="detail" className="min-w-0 flex-1">
        <Outlet />
      </div>

      {currentPocketbook && (
        <Dialog.Root
          open={isSettingsModalOpen}
          onOpenChange={onSettingsModalOpenChange}
        >
          <PocketbookSettingsModal
            key={currentPocketbook.id}
            pocketbook={currentPocketbook}
            currentPage={modalPage ?? "general"}
          />
        </Dialog.Root>
      )}
    </div>
  );
}
