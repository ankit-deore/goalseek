import { Suspense } from "react";
import type { Metadata } from "next";
import { copy, site } from "@/config/site";
import { safeNextPath } from "@/config/routes";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export const metadata: Metadata = { title: `Sign in · ${site.name}` };

/** Reads ?next= and ?error= at request time, so it streams in behind Suspense. */
async function SignInOptions({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  return (
    <>
      {params.error === "auth" && <p className="form-error">{copy.login.error}</p>}
      <GoogleSignInButton next={next} label={copy.login.button} />
    </>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="auth-page">
      <div className="card auth-card stack">
        <p className="brand">{site.name}</p>
        <h1 className="page-title">{copy.login.heading}</h1>
        <p className="muted">{copy.login.sub}</p>
        <Suspense fallback={<GoogleSignInButton label={copy.login.button} />}>
          <SignInOptions searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
