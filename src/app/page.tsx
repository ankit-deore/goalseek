import { copy, site } from "@/config/site";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default function LandingPage() {
  return (
    <main className="landing">
      <section className="landing-hero stack">
        <p className="brand">{site.name}</p>
        <h1 className="landing-title">{copy.landing.heading}</h1>
        <p className="landing-sub">{copy.landing.sub}</p>
        <div>
          <GoogleSignInButton label={copy.landing.cta} />
        </div>
      </section>
      <ul className="landing-points">
        {copy.landing.points.map((point) => (
          <li key={point} className="card">
            {point}
          </li>
        ))}
      </ul>
      <p className="muted landing-tagline">{site.tagline}</p>
    </main>
  );
}
