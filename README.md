# nibras CLI

`nibras` is a course operations CLI and hosted validation stack for project
setup, testing, submission, and tracked verification.

This repo includes:

- the legacy course CLI under `src/`
- the hosted CLI under `apps/cli/`
- a Fastify API under `apps/api/`
- a Next.js dashboard under `apps/web/`
- a verification worker under `apps/worker/`
- a local same-origin proxy under `apps/proxy/`
- shared contracts and helpers under `packages/`

For the canonical manual validation path, use `TEST_SCENARIO.md`.

## At A Glance

The active product surface is the `apps/` and `packages/` monorepo. The `xx/`
directory is legacy reference material and is not part of the active
implementation.

Supported workflows include:

- project-local commands with `nibras test`, `nibras submit`, `nibras task`, and `nibras setup`
- device login with `nibras login`, `logout`, and `whoami`
- tracked submissions, verification status transitions, and admin overrides
- strict private grading, semantic grading, manual score fallback, and optional `check50`
- GitHub OAuth, GitHub App install linking, and signed webhook handling

Project tracking docs:

- `docs/project-tracking.md`

## Prerequisites

- Node.js `>=18`
- npm
- git
- Docker for the Postgres-backed local stack
- unzip for `setup`
- wget or curl for HTTP(S) setup downloads
- check50 only if you use `check50` projects
- ngrok for live GitHub callback and webhook validation

## Install

```bash
npm install
npm install -g .
```

Development usage:

```bash
npm start -- cs161 test exam1
```

## Build And Verification

Run the preflight gate before manual testing:

```bash
npm run manual:preflight
```

This runs:

- `npm test`
- `npm run web:build`

## Local Dev Summary

Use a fresh local Postgres volume for acceptance testing:

```bash
cp .env.example .env
npm run db:local:reset
npm run db:local:migrate
npm run build
```

Then start the local services in separate terminals:

```bash
npm run api:dev
npm run worker:dev
npm run web:dev
```

When `DATABASE_URL` is set, the API uses Prisma/Postgres instead of the
file-backed dev store. The Prisma schema lives in `prisma/schema.prisma`.

`npm run db:push` is still available for disposable development, but it is not
the canonical acceptance path.

For the full step-by-step manual validation sequence, use `TEST_SCENARIO.md`.

## GitHub App Summary

For live GitHub validation, use `.env.ngrok.example`, start the same local
stack, then also run:

```bash
npm run proxy:dev
ngrok http 8080
```

The proxy fans requests out like this:

- `/v1/*` and `/dev/*` -> local API `http://127.0.0.1:4848`
- everything else -> local web app `http://127.0.0.1:3000`

Use the public ngrok URL in:

- `NIBRAS_API_BASE_URL`
- `NIBRAS_WEB_BASE_URL`
- `NEXT_PUBLIC_NIBRAS_API_BASE_URL`
- `NEXT_PUBLIC_NIBRAS_WEB_BASE_URL`

GitHub cannot call `127.0.0.1`, so the public tunnel URL must also be used in
the GitHub App settings.

For the full live end-to-end validation flow, use `TEST_SCENARIO.md`.

### GitHub App Checklist

1. Create the app under your personal account or the owning organization.
   GitHub Docs: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app

2. Fill the core registration fields.
   `GitHub App name`: short, unique, <= 34 chars.
   `Homepage URL`: `<public-url>/`
   `Callback URL`: `<public-url>/v1/github/oauth/callback`
   `Setup URL`: `<public-url>/install/complete`
   `Webhook URL`: `<public-url>/v1/github/webhooks`
   `Webhook secret`: generate a random secret and put it in `GITHUB_WEBHOOK_SECRET`.

3. Enable the auth modes this repo uses.
   Enable `Device Flow`.
   Keep `Request user authorization (OAuth) during installation` disabled.
   Keep expiring user tokens enabled.
   Callback URL docs: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/about-the-user-authorization-callback-url

4. Set the minimum permissions.
   Repository permissions:
   `Contents`: Read and write
   `Metadata`: Read-only

5. Subscribe to the events the backend handles.
   Enable `Push`.

6. Choose installation scope.
   For private testing, choose `Only on this account`.

7. Generate credentials and store them in `.env`.
   Copy the App ID, Client ID, Client Secret, App name, and private key into `.env`.
   Put the private key into `GITHUB_APP_PRIVATE_KEY` with literal newlines or escaped `\n`.

8. If you want automatic repo provisioning from a template, configure:
   `GITHUB_TEMPLATE_OWNER`
   `GITHUB_TEMPLATE_REPO`

9. Update the GitHub App settings whenever your tunnel URL changes.
   If your ngrok URL rotates, update the homepage, callback, setup, and webhook URLs and then restart the local services.

10. Verify webhook signing.
    This repo validates `X-Hub-Signature-256` using `GITHUB_WEBHOOK_SECRET`.

## Quick Start

Review the repo config, then run the core CS161 flow:

```bash
sed -n '1,220p' .nibras.json
nibras cs161 task exam1
```
