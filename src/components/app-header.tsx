import Link from "next/link";
import { nav, copy, site } from "@/config/site";
import { routes } from "@/config/routes";
import { switchWorkspaceAction } from "@/app/actions/workspaces";
import { getCurrentWorkspace } from "@/lib/data/workspaces";
import { AutoSubmitSelect } from "./auto-submit-select";
import { NavLink } from "./nav-link";

export async function AppHeader() {
  const { user, workspaces, current } = await getCurrentWorkspace();
  const options = workspaces.map((w) => ({ value: w.id, label: w.name }));

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href={routes.inbox} className="brand">
          {site.name}
        </Link>
        <nav className="nav">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="header-actions">
          {current && options.length > 1 && (
            <form action={switchWorkspaceAction}>
              <AutoSubmitSelect name="workspaceId" defaultValue={current.id} options={options} label="Workspace" />
            </form>
          )}
          {current && options.length === 1 && <span className="workspace-name">{current.name}</span>}
          <form action={routes.signOut} method="post">
            <button type="submit" className="btn btn-ghost" title={`${copy.common.signedInAs} ${user.email}`}>
              {copy.common.signOut}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export function AppHeaderFallback() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <span className="brand">{site.name}</span>
      </div>
    </header>
  );
}
