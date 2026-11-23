import { NextResponse, type NextRequest } from "next/server";
import { routes, safeNextPath } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

/** Google sends the user back here with a one-time code. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}${routes.login}?error=auth`);
}
