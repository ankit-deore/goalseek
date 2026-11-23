"use client";

import { useActionState } from "react";
import { saveReminderSettingsAction } from "@/app/actions/settings";
import { idleState } from "@/app/actions/state";
import { copy } from "@/config/site";
import { hourLabel } from "@/lib/format";
import { SubmitButton } from "../submit-button";

type Props = { enabled: boolean; hour: number; timezone: string; timezones: string[] };
const t = copy.settings.reminders;
const hours = Array.from({ length: 24 }, (_, h) => h);

export function ReminderForm({ enabled, hour, timezone, timezones }: Props) {
  const [state, formAction] = useActionState(saveReminderSettingsAction, idleState);

  return (
    <form action={formAction} className="stack-sm">
      <label className="checkbox">
        <input type="checkbox" name="reminders_enabled" defaultChecked={enabled} />
        <span>{t.enabled}</span>
      </label>
      <div className="form-row">
        <label className="field">
          <span className="field-label">{t.time}</span>
          <select name="reminder_hour" defaultValue={hour} className="select">
            {hours.map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t.timezone}</span>
          <select name="timezone" defaultValue={timezone} className="select">
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-actions">
        <SubmitButton variant="secondary">{t.save}</SubmitButton>
        {state.status === "success" && <span className="form-success" role="status">{state.message}</span>}
        {state.status === "error" && <span className="form-error" role="alert">{state.message}</span>}
      </div>
    </form>
  );
}
