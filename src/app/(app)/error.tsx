"use client";

import { useEffect } from "react";
import { copy } from "@/config/site";

const t = copy.appError;

/** Shown instead of a blank error page when a page in the app fails to load. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-panel">
      <h1 className="section-title">{t.heading}</h1>
      <p className="muted">{t.body}</p>
      {error.digest && (
        <p className="field-help">
          {t.setupHint} <code>{error.digest}</code>
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={reset}>
        {t.retry}
      </button>
    </div>
  );
}
