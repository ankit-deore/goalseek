# GoalSeek

**Make job seeking stress free.**

Job links, certifications, side projects and meetups get shared in group chats and then disappear. GoalSeek gives you and your friends one shared inbox for those links. You track what you did with each one and get a short email every day before deadlines slip.

## What step 1 includes

- **Google sign-in.** No passwords to manage.
- **Inbox.** Paste any link. GoalSeek fetches its title and source, and guesses whether it's a Job, Certification, Project, Meetup or Resource. Shared links are de-duplicated, so the same LinkedIn job posted twice only shows up once.
- **Tracker.** Every link has an owner and a status: New, Interested, Applied, Interview, Rejected or Skipped. Jobs also hold the pasted job description, the resume version you sent and a deadline.
- **Workspaces.** A workspace is a shared inbox. Create one for your friend group and send them an invite link.
- **Daily reminder email.** Lists deadlines in the next 3 days and links nobody has touched for 2 days. It goes out at 9 PM India time by default, and each person can change the time and time zone in Settings.
- **Personal API keys and a capture endpoint.** These let the coming browser extension, Android share and iPhone Shortcut save links for you.
- **Installable app (PWA).** On Android, GoalSeek also shows up in the Share menu.

## Tech stack (all free tiers)

| Piece | Used for |
| --- | --- |
| Next.js 16 + TypeScript + Tailwind CSS | The web app and its API |
| Supabase | Google sign-in, Postgres database, row-level security |
| Vercel | Hosting (free `*.vercel.app` address) |
| Resend, or Gmail SMTP | Sending the daily email |
| GitHub Actions | Runs the reminder check every hour |

---

## Setup guide

This takes about 30 minutes. You'll create four free accounts and copy a few values between them. Keep a notes file open to paste the values into as you go.

### Step 1: Create the Supabase project (database and login)

1. Go to <https://supabase.com>, click **Start your project** and sign in with GitHub.
2. Click **New project**. Name it `goalseek`, choose a strong database password (save it), and pick the region **Mumbai** (`ap-south-1`). Click **Create new project** and wait about 2 minutes.
3. In the left menu, open **SQL Editor** and click **New query**.
4. Open [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) in this repo, copy everything, paste it into the editor and click **Run**. You should see "Success. No rows returned".
5. Open **Project Settings → API Keys** (older projects call it **API**). Copy these three values into your notes:
   - **Project URL**, like `https://abcd1234.supabase.co`. It's also shown under **Project Settings → Data API**. Copy only this part, with nothing after `.supabase.co` (not `/rest/v1`).
   - **Publishable key**, starting `sb_publishable_`. On older projects use the **anon public** key.
   - **Secret key**, starting `sb_secret_`. On older projects use the **service_role** key. **Never share this one.**

### Step 2: Turn on "Sign in with Google"

1. Go to <https://console.cloud.google.com>, then use the project picker at the top to choose **New project**. Name it `GoalSeek` and create it.
2. Open **APIs & Services → OAuth consent screen** (it may be called **Google Auth Platform**). Click **Get started**.
   - App name: `GoalSeek`. Support email: your email.
   - Audience: **External**.
   - Contact email: your email. Agree and click **Create**.
3. Open **Clients → Create client** (or **Credentials → Create credentials → OAuth client ID**).
   - Application type: **Web application**. Name: `GoalSeek web`.
   - Under **Authorized redirect URIs**, add `https://YOUR-PROJECT.supabase.co/auth/v1/callback`, using your own Project URL from Step 1.
   - Click **Create** and copy the **Client ID** and **Client secret**.
4. Go back to Supabase and open **Authentication → Sign In / Providers → Google**. Switch it on, paste the Client ID and Client secret, and click **Save**.
5. Under **Audience** in Google Cloud, you can leave the app in **Testing** while only you and your friends use it. Add each friend's Gmail under **Test users**. When you're ready for the public, click **Publish app**.

### Step 3: Set up email

You have two options:

- **Option A: Gmail (easiest, no domain needed).** This works right away for any recipient, up to about 500 emails a day.
  1. Turn on 2-Step Verification for your Google account at <https://myaccount.google.com/security>.
  2. Open <https://myaccount.google.com/apppasswords>, create an app password called `GoalSeek`, and copy the 16-letter password.
  3. In Step 4 you'll set `EMAIL_PROVIDER=smtp`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=you@gmail.com`, `SMTP_PASSWORD=` the app password, and `EMAIL_FROM=GoalSeek <you@gmail.com>`.
- **Option B: Resend.** This is better for a public launch, but it needs your own domain.
  1. Sign up at <https://resend.com> and create an API key under **API Keys**.
  2. Until you verify a domain, Resend only sends to **your own** email address. A free `*.vercel.app` address can't be verified, so you'll need a cheap domain to email your friends. Add it under **Domains**, then set `EMAIL_FROM=GoalSeek <reminders@yourdomain.com>`.

### Step 4: Deploy to Vercel

1. Go to <https://vercel.com>, sign up with GitHub, and click **Add New → Project**.
2. Import the `goalseek` repository. Leave the build settings as they are.
3. Open **Environment Variables** and add each of these. The full list with comments is in [`.env.example`](.env.example).

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Step 1 |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (or anon) key |
   | `SUPABASE_SECRET_KEY` | Secret (or service_role) key |
   | `NEXT_PUBLIC_SITE_URL` | Fill in after the first deploy, e.g. `https://goalseek.vercel.app` |
   | `CRON_SECRET` | Any long random text, e.g. from <https://www.random.org/strings/> (30+ characters) |
   | `EMAIL_PROVIDER` | `smtp` (Gmail) or `resend` |
   | `EMAIL_FROM` | e.g. `GoalSeek <you@gmail.com>` |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Only for Gmail (Option A) |
   | `RESEND_API_KEY` | Only for Resend (Option B) |

4. Click **Deploy**. When it finishes, copy your site address (e.g. `https://goalseek.vercel.app`).
5. Set `NEXT_PUBLIC_SITE_URL` to that address under **Settings → Environment Variables**, then go to **Deployments → ⋯ → Redeploy**.
6. Back in Supabase, open **Authentication → URL Configuration**:
   - **Site URL**: your Vercel address.
   - **Redirect URLs**: add `https://YOUR-APP.vercel.app/**` and `http://localhost:3000/**`.

Open your site and click **Continue with Google**. You should land in your inbox.

**If sign-in shows `{"message":"No API key found in request"}`:** look at the address bar on that error page. It should start `https://YOUR-PROJECT.supabase.co/auth/v1/authorize`. If anything sits between `.supabase.co` and `/auth/v1` (such as `/rest/v1`), or the key is empty, fix `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel and redeploy. `NEXT_PUBLIC_` values are baked in at build time, so changing them only takes effect after a redeploy.

### Step 5: Turn on the hourly reminder check

GitHub runs [`.github/workflows/reminders.yml`](.github/workflows/reminders.yml) every hour. It asks the app to send any digests that are due. Each person gets at most one email per day, at their chosen time.

1. On GitHub, open the repo, then **Settings → Secrets and variables → Actions → New repository secret**. Add two secrets:
   - `APP_URL`: your Vercel address with no trailing slash.
   - `CRON_SECRET`: the same value you put in Vercel.
2. To test, open the **Actions** tab, choose **Daily reminders** and click **Run workflow**. The log shows a summary like `{"checked":3,"due":1,"sent":1,...}`.

> GitHub may delay scheduled runs by a few minutes when it's busy. If a run is missed, the next one catches up.

### Step 6: Invite your friends and install the app

- In **Settings → Workspaces**, create a workspace (e.g. "Job hunt crew") and click **Create invite link**. Send the link on WhatsApp. It works for 7 days.
- **Android:** open the site in Chrome, then tap **⋮ → Add to Home screen**. After that, **Share → GoalSeek** from any app saves the link to your inbox.
- **iPhone:** open the site in Safari, then tap **Share → Add to Home Screen**. To save links from the Share menu, set up the [iPhone Shortcut](#iphone-shortcut).

---

## Capture API (for the extension, Android and iPhone Shortcut)

Create a key under **Settings → Personal API keys**, then:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/capture \
  -H "Authorization: Bearer gs_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://jobs.lever.co/acme/123"}'
```

| Field | Required | Notes |
| --- | --- | --- |
| `url` | `url` or `text` | The link to save |
| `text` | | Free text such as a forwarded message. The first link in it is used. |
| `title` | | Overrides the fetched title |
| `notes` | | Saved on the link |
| `category` | | `job`, `certification`, `project`, `meetup` or `resource`. It's guessed if you leave it out. |
| `workspaceId` | | Defaults to your default workspace |

Responses: `201 {"status":"created","item":{...}}`, `200 {"status":"duplicate"}`, `401` for a bad key, `400` for a bad body.

Only a SHA-256 hash of each key is stored. Revoke a key at any time in Settings.

> Always call `https://YOUR-APP.vercel.app/api/capture`. Never call your Supabase URL (`https://xxxx.supabase.co/...`) from the extension or Shortcut. Supabase rejects it with `"No API key found in request"`, and the app's server is what checks your `gs_` key and saves the link.

### iPhone Shortcut

The same steps are shown in the app under **Settings → iPhone Shortcut**, with your capture endpoint ready to copy.

1. In GoalSeek, open **Settings → Personal API keys**, create a key and copy it. Also copy the **Capture endpoint**.
2. Open the **Shortcuts** app, tap **+**, tap the name at the top and choose **Details**. Turn on **Show in Share Sheet** and set it to receive **URLs** and **Text**.
3. Add the action **Get Contents of URL** and paste the capture endpoint as the URL.
4. Tap **Show More** and set **Method** to **POST**.
5. Under **Headers**, add `Authorization` with the value `Bearer gs_your_key_here` (the word Bearer, a space, then your key).
6. Set **Request Body** to **JSON**. Add a **Text** field named `text` and set its value to **Shortcut Input**.
7. Optional: add **Show Notification** so you can see the result.

Now **Share → (your shortcut name)** from Safari, LinkedIn or WhatsApp saves the link to your inbox.

---

## Local development

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev                  # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |

To try the reminder job locally, run:

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

## Project structure

```
src/
  config/          All text, labels, categories, statuses, routes and rules live here
    site.ts        Product wording (change copy here, not in components)
    items.ts       Categories, statuses, URL→category rules, reminder rules, limits
    routes.ts      Every app path in one place
    env.ts         Validated server environment variables
  app/             Pages and API routes (Next.js App Router)
    (app)/         Signed-in pages: inbox, tracker, items/[id], settings, join, share
    actions/       Server actions (forms post here)
    api/capture    Capture endpoint for API keys
    api/cron       Hourly reminder endpoint
  components/      Reusable UI pieces
  lib/
    data/          Database reads (items, workspaces, profile, session)
    links/         URL parsing, de-duplication, category guessing, link preview
    reminders/     Who is due, what goes in the digest, the run itself
    email/         Email provider (Resend or SMTP) and the digest template
    supabase/      Supabase clients (browser, server, admin) and session refresh
  styles/          CSS files: design tokens, base, components, layout, pages
  proxy.ts         Refreshes the login session, protects signed-in pages
supabase/migrations/  Database schema, triggers and row-level security
```

### Conventions

- **No hard-coded text in components.** User-facing text comes from `src/config/site.ts`, and labels and rules come from `src/config/items.ts`.
- **No inline styles.** Styling lives in `src/styles/*.css`, using Tailwind's `@apply` and the design tokens in `tokens.css`.
- **Security in the database.** Every table has row-level security, so a user can only read or write rows in workspaces they belong to. The secret key is used in only two places, the capture API and the reminder job, and both check permissions themselves.
- **Shared logic.** The inbox form, the Android share target and the capture API all call the same `addLink()` function.
