import { describe, expect, it } from "vitest";
import { guessCategory } from "./categorize";
import { extractFirstUrl, normalizeUrl, parseUrl } from "./normalize";
import { parseMeta } from "./parse-meta";
import { isPrivateAddress } from "./safe-host";

const u = (s: string) => new URL(s);

describe("parseUrl", () => {
  it("adds https when the scheme is missing", () => {
    expect(parseUrl("example.com/jobs/1")?.toString()).toBe("https://example.com/jobs/1");
  });
  it("rejects non-web links and junk", () => {
    expect(parseUrl("javascript:alert(1)")).toBeNull();
    expect(parseUrl("ftp://example.com")).toBeNull();
    expect(parseUrl("hello")).toBeNull();
    expect(parseUrl("")).toBeNull();
  });
});

describe("extractFirstUrl", () => {
  it("pulls a link out of a WhatsApp style message", () => {
    expect(extractFirstUrl("Check this out! https://jobs.lever.co/acme/123. Apply soon")).toBe("https://jobs.lever.co/acme/123");
  });
  it("returns null when there is no link", () => {
    expect(extractFirstUrl("no links here")).toBeNull();
  });
});

describe("normalizeUrl", () => {
  it("drops tracking params, www, hash and trailing slash", () => {
    expect(normalizeUrl(u("http://www.Example.com/jobs/1/?utm_source=wa&b=2&a=1#top"))).toBe("https://example.com/jobs/1?a=1&b=2");
  });
  it("treats the same LinkedIn job shared twice as one link", () => {
    const a = normalizeUrl(u("https://www.linkedin.com/jobs/view/123/?trackingId=abc&refId=xyz"));
    const b = normalizeUrl(u("https://linkedin.com/jobs/view/123"));
    expect(a).toBe(b);
  });
});

describe("guessCategory", () => {
  it.each([
    ["https://jobs.lever.co/acme/123", "job"],
    ["https://boards.greenhouse.io/acme/jobs/1", "job"],
    ["https://www.linkedin.com/jobs/view/123", "job"],
    ["https://acme.com/careers/pm-role", "job"],
    ["https://www.naukri.com/job-listings-pm", "job"],
    ["https://www.coursera.org/professional-certificates/google-pm", "certification"],
    ["https://aws.amazon.com/certification/certified-cloud-practitioner/", "certification"],
    ["https://www.linkedin.com/learning/product-management", "certification"],
    ["https://www.meetup.com/pune-product/events/123", "meetup"],
    ["https://lu.ma/abc", "meetup"],
    ["https://github.com/vercel/next.js", "project"],
    ["https://www.kaggle.com/competitions/titanic", "project"],
    ["https://medium.com/some-article", "resource"],
  ])("%s → %s", (url, expected) => {
    expect(guessCategory(u(url))).toBe(expected);
  });

  it("uses the title when the URL says nothing", () => {
    expect(guessCategory(u("https://acme.com/p/42"), "We're hiring a Product Manager")).toBe("job");
  });
});

describe("parseMeta", () => {
  it("reads Open Graph tags and decodes entities", () => {
    const html = `<html><head>
      <title>Fallback</title>
      <meta property="og:title" content="PM &amp; Strategy role">
      <meta content="Join us" property="og:description">
      <meta property="og:image" content="/img.png">
      <meta property="og:site_name" content='Acme Careers'>
    </head></html>`;
    expect(parseMeta(html, "https://acme.com/jobs/1")).toEqual({
      title: "PM & Strategy role",
      description: "Join us",
      image: "https://acme.com/img.png",
      siteName: "Acme Careers",
    });
  });
  it("falls back to <title>", () => {
    expect(parseMeta("<title> Hello\n world </title>", "https://a.com").title).toBe("Hello world");
  });
});

describe("isPrivateAddress", () => {
  it.each(["127.0.0.1", "10.0.0.5", "192.168.1.1", "172.20.0.1", "169.254.169.254", "::1", "fd00::1", "::ffff:127.0.0.1"])(
    "blocks %s",
    (ip) => expect(isPrivateAddress(ip)).toBe(true),
  );
  it.each(["8.8.8.8", "142.250.183.14", "2606:4700::1111"])("allows %s", (ip) => expect(isPrivateAddress(ip)).toBe(false));
});
