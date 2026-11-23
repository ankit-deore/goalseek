"use client";

import { useActionState } from "react";
import { createApiKeyAction } from "@/app/actions/settings";
import { idleState } from "@/app/actions/state";
import { copy } from "@/config/site";
import { limits } from "@/config/items";
import { SubmitButton } from "../submit-button";
import { CopyField } from "./copy-field";

const t = copy.settings.apiKeys;

export function ApiKeyForm() {
  const [state, formAction] = useActionState(createApiKeyAction, idleState);
  return (
    <div className="stack-sm">
      <form action={formAction} className="inline-form">
        <input name="name" required maxLength={limits.apiKeyName} placeholder={t.namePlaceholder} className="input" />
        <SubmitButton variant="secondary">{t.create}</SubmitButton>
      </form>
      {state.status === "success" && state.data && (
        <div className="notice stack-sm">
          <p>{state.message}</p>
          <CopyField value={state.data} label="New API key" />
        </div>
      )}
      {state.status === "error" && <p className="form-error">{state.message}</p>}
    </div>
  );
}
