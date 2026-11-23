import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(routes.home, request.url), { status: 303 });
}
