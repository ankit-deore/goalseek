import { copy } from "@/config/site";

const t = copy.settings.shortcut;

/** Step-by-step setup for the iPhone Shortcut that posts to /api/capture. */
export function ShortcutGuide() {
  return (
    <div className="stack-sm">
      <ol className="steps-list">
        {t.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="notice">{t.warning}</p>
    </div>
  );
}
