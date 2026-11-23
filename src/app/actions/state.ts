/** Shape returned by server actions used with useActionState. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Extra data, e.g. a freshly created API key shown once. */
  data?: string;
};

export const idleState: ActionState = { status: "idle" };
