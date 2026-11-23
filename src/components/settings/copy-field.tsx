"use client";

import { useState } from "react";

/** Read-only text with a Copy button, for keys and invite links. */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="copy-field">
      <input readOnly value={value} aria-label={label} className="input input-mono" onFocus={(e) => e.currentTarget.select()} />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
