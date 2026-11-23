import { Suspense } from "react";
import { AppHeader, AppHeaderFallback } from "@/components/app-header";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="app-shell">
      <Suspense fallback={<AppHeaderFallback />}>
        <AppHeader />
      </Suspense>
      <main className="app-main">{children}</main>
    </div>
  );
}
