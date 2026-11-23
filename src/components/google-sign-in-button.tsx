"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/config/routes";
import { copy } from "@/config/site";

export function GoogleSignInButton({ next, label }: { next?: string; label: string }) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signIn() {
    setPending(true);
    setFailed(false);
    const callback = new URL(routes.authCallback, window.location.origin);
    if (next) callback.searchParams.set("next", next);

    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });
    if (error) {
      setPending(false);
      setFailed(true);
    }
  }

  return (
    <div className="stack-sm">
      <button type="button" className="btn btn-primary btn-lg" onClick={signIn} disabled={pending}>
        <span className="google-mark" aria-hidden="true">G</span>
        {pending ? copy.common.loading : label}
      </button>
      {failed && <p className="form-error">{copy.login.error}</p>}
    </div>
  );
}
