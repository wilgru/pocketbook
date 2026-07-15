import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { isSideBarVisibleAtom } from "src/common/atoms/isSidebarVisibleAtom.ts";
import { Sidebar } from "../common/components/Sidebar/Sidebar.tsx";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  const isSideBarVisible = useAtomValue(isSideBarVisibleAtom);

  return (
    <div className="fixed flex h-screen w-screen bg-slate-50">
      {isSideBarVisible && <Sidebar />}
      {/* all the other elements */}
      <div id="detail" className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
