"use client";

import { useActionState, useEffect, useRef } from "react";
import { addLinkAction } from "@/app/actions/items";
import { idleState } from "@/app/actions/state";
import { copy } from "@/config/site";
import { SubmitButton } from "./submit-button";

export function AddLinkForm() {
  const [state, formAction] = useActionState(addLinkAction, idleState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="add-link-form">
      <label htmlFor="add-link-url" className="sr-only">
        {copy.inbox.addPlaceholder}
      </label>
      <input
        id="add-link-url"
        name="url"
        type="text"
        inputMode="url"
        autoComplete="off"
        required
        placeholder={copy.inbox.addPlaceholder}
        className="input add-link-input"
      />
      <SubmitButton pendingLabel={copy.inbox.adding}>{copy.inbox.addButton}</SubmitButton>
      {state.status === "error" && (
        <p className="form-error add-link-message" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="form-success add-link-message" role="status">
          Added: {state.message}
        </p>
      )}
    </form>
  );
}
