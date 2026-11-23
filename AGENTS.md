<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## GoalSeek conventions

- User-facing text goes in `src/config/site.ts`; categories, statuses, rules and limits in `src/config/items.ts`; paths in `src/config/routes.ts`.
- No inline styles. Add classes to `src/styles/*.css` (Tailwind `@apply` + tokens in `tokens.css`).
- Database changes: add a new file in `supabase/migrations/` and update `src/types/database.ts`. Every table needs RLS.
- `createAdminClient()` bypasses RLS. Only use it where the code checks permissions itself.
- Run `npm run lint && npm run typecheck && npm test && npm run build` before opening a PR.
