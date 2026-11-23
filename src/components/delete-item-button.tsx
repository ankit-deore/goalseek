"use client";

import { deleteItemAction } from "@/app/actions/items";
import { copy } from "@/config/site";
import { SubmitButton } from "./submit-button";

export function DeleteItemButton({ id }: { id: string }) {
  return (
    <form
      action={deleteItemAction}
      onSubmit={(e) => {
        if (!window.confirm(copy.item.deleteConfirm)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="danger">{copy.item.delete}</SubmitButton>
    </form>
  );
}
