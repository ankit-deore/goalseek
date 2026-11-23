import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/config/env";
import { runDailyReminders } from "@/lib/reminders/run";

/**
 * Called every hour by the scheduler (GitHub Actions, or Vercel Cron), with
 *   Authorization: Bearer <CRON_SECRET>
 * Sends each person's digest once their local reminder time has passed.
 */
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const expected = Buffer.from(`Bearer ${serverEnv().CRON_SECRET}`);
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

async function handle(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const summary = await runDailyReminders();
  return NextResponse.json(summary);
}

export const GET = handle;
export const POST = handle;
