import { copy } from "@/config/site";

export default function Loading() {
  return <p className="muted loading">{copy.common.loading}</p>;
}
