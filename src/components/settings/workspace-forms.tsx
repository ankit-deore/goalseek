"use client";

import { useActionState } from "react";
import { createInviteAction, createWorkspaceAction } from "@/app/actions/workspaces";
import { idleState } from "@/app/actions/state";
import { copy } from "@/config/site";
import { limits } from "@/config/items";
import { SubmitButton } from "../submit-button";
import { CopyField } from "./copy-field";

const t = copy.settings.workspaces;

export function CreateWorkspaceForm() {
  const [state, formAction] = useActionState(createWorkspaceAction, idleState);
  return (
    <form action={formAction} className="inline-form">
      <input name="name" required maxLength={limits.workspaceName} placeholder={t.createPlaceholder} className="input" />
      <SubmitButton variant="secondary">{t.create}</SubmitButton>
      {state.status === "error" && <p className="form-error">{state.message}</p>}
    </form>
  );
}

export function InviteForm() {
  const [state, formAction] = useActionState(createInviteAction, idleState);
  return (
    <div className="stack-sm">
      <form action={formAction}>
        <SubmitButton variant="secondary">{t.invite}</SubmitButton>
      </form>
      {state.status === "success" && state.data && (
        <div className="notice stack-sm">
          <p>{t.inviteHelp}</p>
          <CopyField value={state.data} label="Invite link" />
        </div>
      )}
      {state.status === "error" && <p className="form-error">{state.message}</p>}
    </div>
  );
}
