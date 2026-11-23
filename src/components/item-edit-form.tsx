"use client";

import { useActionState } from "react";
import { updateItemAction } from "@/app/actions/items";
import { idleState } from "@/app/actions/state";
import { CATEGORIES, STATUSES, categoryLabels, limits, statusLabels } from "@/config/items";
import { copy } from "@/config/site";
import type { Item } from "@/types/database";
import { SubmitButton } from "./submit-button";

type Props = {
  item: Item;
  members: { userId: string; name: string }[];
};

const f = copy.item.fields;

export function ItemEditForm({ item, members }: Props) {
  const [state, formAction] = useActionState(updateItemAction, idleState);

  return (
    <form action={formAction} className="card stack form-grid">
      <input type="hidden" name="id" value={item.id} />

      <label className="field field-wide">
        <span className="field-label">{f.title}</span>
        <input name="title" defaultValue={item.title ?? ""} maxLength={limits.title} className="input" />
      </label>

      <label className="field">
        <span className="field-label">{f.category}</span>
        <select name="category" defaultValue={item.category} className="select">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabels[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">{f.status}</span>
        <select name="status" defaultValue={item.status} className="select">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">{f.owner}</span>
        <select name="owner_id" defaultValue={item.owner_id ?? ""} className="select">
          <option value="">{copy.item.unassigned}</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">{f.deadline}</span>
        <input type="date" name="deadline" defaultValue={item.deadline ?? ""} className="input" />
      </label>

      {item.category === "job" && (
        <>
          <label className="field field-wide">
            <span className="field-label">{f.resumeVersion}</span>
            <input
              name="resume_version"
              defaultValue={item.resume_version ?? ""}
              maxLength={limits.resumeVersion}
              placeholder="e.g. PM_resume_v3.pdf"
              className="input"
            />
          </label>
          <label className="field field-wide">
            <span className="field-label">{f.jdText}</span>
            <textarea name="jd_text" defaultValue={item.jd_text ?? ""} maxLength={limits.jdText} rows={8} className="textarea" />
          </label>
        </>
      )}
      {item.category !== "job" && (
        <>
          <input type="hidden" name="resume_version" value={item.resume_version ?? ""} />
          <input type="hidden" name="jd_text" value={item.jd_text ?? ""} />
        </>
      )}

      <label className="field field-wide">
        <span className="field-label">{f.notes}</span>
        <textarea name="notes" defaultValue={item.notes ?? ""} maxLength={limits.notes} rows={4} className="textarea" />
      </label>

      <div className="form-actions field-wide">
        <SubmitButton pendingLabel={copy.item.saving}>{copy.item.save}</SubmitButton>
        {state.status === "success" && <span className="form-success" role="status">{state.message}</span>}
        {state.status === "error" && <span className="form-error" role="alert">{state.message}</span>}
      </div>
    </form>
  );
}
