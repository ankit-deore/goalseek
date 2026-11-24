import type { Metadata } from "next";
import { copy, site } from "@/config/site";
import { revokeApiKeyAction } from "@/app/actions/settings";
import { leaveWorkspaceAction, switchWorkspaceAction } from "@/app/actions/workspaces";
import { SubmitButton } from "@/components/submit-button";
import { ApiKeyForm } from "@/components/settings/api-key-form";
import { CopyField } from "@/components/settings/copy-field";
import { ReminderForm } from "@/components/settings/reminder-form";
import { ShortcutGuide } from "@/components/settings/shortcut-guide";
import { CreateWorkspaceForm, InviteForm } from "@/components/settings/workspace-forms";
import { getMyProfile } from "@/lib/data/profile";
import { getCurrentWorkspace, listMembers } from "@/lib/data/workspaces";
import { timeAgo } from "@/lib/format";
import { getRequestOrigin } from "@/lib/site-origin";

export const metadata: Metadata = { title: `${copy.settings.heading} · ${site.name}` };

const t = copy.settings;

export default async function SettingsPage() {
  const [{ user, supabase, workspaces, current }, profile] = await Promise.all([getCurrentWorkspace(), getMyProfile()]);
  const [members, keys] = await Promise.all([
    current ? listMembers(supabase, current.id) : Promise.resolve([]),
    supabase
      .from("api_keys")
      .select("id, name, prefix, last_used_at, created_at")
      .eq("user_id", user.id)
      .is("revoked_at", null)
      .order("created_at", { ascending: false }),
  ]);
  const timezones = Intl.supportedValuesOf("timeZone");
  const captureEndpoint = `${await getRequestOrigin()}/api/capture`;

  return (
    <div className="stack">
      <h1 className="page-title">{t.heading}</h1>

      <section className="card stack">
        <div>
          <h2 className="section-title">{t.reminders.heading}</h2>
          <p className="muted">{t.reminders.sub}</p>
        </div>
        <ReminderForm
          enabled={profile.reminders_enabled}
          hour={profile.reminder_hour}
          timezone={profile.timezone}
          timezones={timezones}
        />
      </section>

      <section className="card stack">
        <div>
          <h2 className="section-title">{t.workspaces.heading}</h2>
          <p className="muted">{t.workspaces.sub}</p>
        </div>
        <ul className="row-list">
          {workspaces.map((w) => (
            <li key={w.id} className="row">
              <span className="row-title">{w.name}</span>
              {w.id === current?.id ? (
                <span className="badge badge-status-applied">{t.workspaces.current}</span>
              ) : (
                <form action={switchWorkspaceAction}>
                  <input type="hidden" name="workspaceId" value={w.id} />
                  <SubmitButton variant="ghost">{t.workspaces.switch}</SubmitButton>
                </form>
              )}
              {workspaces.length > 1 && (
                <form action={leaveWorkspaceAction}>
                  <input type="hidden" name="workspaceId" value={w.id} />
                  <SubmitButton variant="ghost">{t.workspaces.leave}</SubmitButton>
                </form>
              )}
            </li>
          ))}
        </ul>
        <CreateWorkspaceForm />
        {current && (
          <div className="stack-sm">
            <h3 className="subsection-title">
              {t.workspaces.members} · {current.name}
            </h3>
            <ul className="row-list">
              {members.map((m) => (
                <li key={m.userId} className="row">
                  <span className="row-title">{m.name}</span>
                  <span className="muted">{m.email}</span>
                  <span className="muted">{m.role}</span>
                </li>
              ))}
            </ul>
            <InviteForm />
          </div>
        )}
      </section>

      <section className="card stack">
        <div>
          <h2 className="section-title">{t.apiKeys.heading}</h2>
          <p className="muted">{t.apiKeys.sub}</p>
        </div>
        <div className="stack-sm">
          <span className="field-label">{t.apiKeys.endpoint}</span>
          <CopyField value={captureEndpoint} label={t.apiKeys.endpoint} />
          <p className="field-help">{t.apiKeys.endpointHelp}</p>
        </div>
        <ApiKeyForm />
        {(keys.data ?? []).length > 0 && (
          <ul className="row-list">
            {(keys.data ?? []).map((k) => (
              <li key={k.id} className="row">
                <span className="row-title">{k.name}</span>
                <code className="muted">{k.prefix}…</code>
                <span className="muted">
                  {t.apiKeys.lastUsed}: {k.last_used_at ? timeAgo(k.last_used_at) : t.apiKeys.never}
                </span>
                <form action={revokeApiKeyAction}>
                  <input type="hidden" name="id" value={k.id} />
                  <SubmitButton variant="danger">{t.apiKeys.revoke}</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card stack">
        <div>
          <h2 className="section-title">{t.shortcut.heading}</h2>
          <p className="muted">{t.shortcut.sub}</p>
        </div>
        <ShortcutGuide />
      </section>
    </div>
  );
}
