"use client";

type Option = { value: string; label: string };

type Props = {
  name: string;
  defaultValue: string;
  options: readonly Option[];
  label: string;
  className?: string;
};

/** A <select> that submits its form as soon as the value changes. */
export function AutoSubmitSelect({ name, defaultValue, options, label, className = "" }: Props) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      aria-label={label}
      className={`select ${className}`}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
