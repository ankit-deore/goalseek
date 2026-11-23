import { copy } from "@/config/site";
import { acceptInviteAction } from "@/app/actions/workspaces";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/session";

export default async function JoinPage({ params }: PageProps<"/join/[token]">) {
  const { token } = await params;
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.rpc("invite_preview", { invite_token: token });
  const invite = data?.[0];

  if (!invite || invite.expired) {
    return (
      <div className="card stack">
        <h1 className="page-title">{copy.join.heading}</h1>
        <p className="form-error">{copy.join.invalid}</p>
      </div>
    );
  }

  return (
    <div className="card stack">
      <h1 className="page-title">
        {copy.join.heading}: {invite.workspace_name}
      </h1>
      <form action={acceptInviteAction}>
        <input type="hidden" name="token" value={token} />
        <SubmitButton>{copy.join.accept}</SubmitButton>
      </form>
    </div>
  );
}
