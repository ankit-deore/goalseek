"use client";

import { useEffect, useRef } from "react";

/** Submits itself once when it appears (used by the share target page). */
export function AutoSubmitForm({ action, children }: { action: (form: FormData) => Promise<void>; children: React.ReactNode }) {
  const ref = useRef<HTMLFormElement>(null);
  const sent = useRef(false);
  useEffect(() => {
    if (!sent.current) {
      sent.current = true;
      ref.current?.requestSubmit();
    }
  }, []);
  return (
    <form ref={ref} action={action} className="stack-sm">
      {children}
    </form>
  );
}
