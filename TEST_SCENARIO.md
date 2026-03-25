# Nibras Test Scenario

This document is the practical test plan for validating the current Nibras
product.

Use it in this order:

1. Local product sanity test
2. Hosted-style local test with Postgres
3. GitHub App test with ngrok
4. Submission flow test
5. Failure and recovery test

## What You Need Before Testing

- Node.js 18+
- `git`
- Docker
- `ngrok` if you want to test real GitHub callbacks and webhooks
- A GitHub App if you want to validate the live GitHub flow

## Scenario 1: Local Product Sanity Test

Goal: verify the repo still builds and the automated tests pass.

Commands:

```bash
npm install
npm test
npm run web:build
```

Expected result:

- `npm test` passes
- `npm run web:build` passes
- no TypeScript build errors

This is the fastest check after every code change.

## Scenario 2: Hosted Local Test Without Real GitHub

Goal: verify the API, CLI, and web stack run locally even without live GitHub credentials.

Commands:

```bash
cp .env.example .env
docker compose up -d
npm run db:push
npm run api:dev
npm run web:dev
```

Open another shell:

```bash
nibras --plain
nibras ping --plain
```

Expected result:

- API starts on `http://127.0.0.1:4848`
- web starts on `http://127.0.0.1:3000`
- `nibras` shows the new CLI help
- `nibras ping` reaches the API

What this proves:

- monorepo builds
- Prisma schema is usable
- CLI can talk to the API
- web app renders

What this does not prove:

- real GitHub login
- real GitHub App installation
- real webhook delivery

## Scenario 3: Real GitHub App Test With ngrok

Goal: validate the live GitHub integration end to end.

### 3.1 Configure public URLs

Commands:

```bash
cp .env.ngrok.example .env
docker compose up -d
npm run db:push
npm run api:dev
npm run web:dev
npm run proxy:dev
ngrok http 8080
```

Update `.env`:

- `NIBRAS_API_BASE_URL=https://your-public-ngrok-url`
- `NIBRAS_WEB_BASE_URL=https://your-public-ngrok-url`
- `NEXT_PUBLIC_NIBRAS_API_BASE_URL=https://your-public-ngrok-url`
- `NEXT_PUBLIC_NIBRAS_WEB_BASE_URL=https://your-public-ngrok-url`
- add all GitHub App credentials

The proxy handles:

- `/v1/*` and `/dev/*` -> API on `127.0.0.1:4848`
- everything else -> web app on `127.0.0.1:3000`

### 3.2 Configure the GitHub App

Set these values in the GitHub App settings:

- Homepage URL: `<public-url>/`
- Callback URL: `<public-url>/v1/github/oauth/callback`
- Setup URL: `<public-url>/install/complete`
- Webhook URL: `<public-url>/v1/github/webhooks`
- Webhook secret: same as `GITHUB_WEBHOOK_SECRET`

Auth settings:

- Device Flow: enabled
- Request user authorization (OAuth) during installation: disabled

Permissions:

- Repository contents: Read and write
- Metadata: Read-only

Events:

- Push

### 3.3 Start the stack

Commands:

```bash
curl https://your-public-ngrok-url/v1/health
open https://your-public-ngrok-url/
```

### 3.4 Validate browser login

Steps:

1. Open the web app home page
2. Click `Sign in with GitHub`
3. Complete GitHub OAuth
4. Confirm redirect to `/auth/complete`
5. Confirm redirect to `/dashboard`

Expected result:

- browser stores a session
- dashboard loads
- the user and GitHub login appear

### 3.5 Validate GitHub App install flow

Steps:

1. From the dashboard click `Install GitHub App`
2. Install the app on the target GitHub account
3. Open `/install/complete`
4. Paste the installation ID
5. Submit the form

Expected result:

- the API accepts the installation ID
- the dashboard eventually shows `App installed: yes`

## Scenario 4: CLI Login and Setup Test

Goal: validate the learner CLI path with a live backend.

Commands:

```bash
nibras login
nibras whoami
nibras ping
mkdir -p /tmp/nibras-e2e
cd /tmp/nibras-e2e
nibras setup --project cs161/exam1 --dir .
```

Expected result:

- `nibras login` opens the browser or prints the verification URL
- `nibras whoami` shows your GitHub account
- `nibras ping` shows:
  - API reachable
  - Auth valid
  - GitHub linked
  - GitHub App installed
- `setup` creates:
  - `.nibras/project.json`
  - `.nibras/task.md`

If template repo generation is configured, also expect:

- a real GitHub repo created in your account

## Scenario 5: Submission Flow Test

Goal: validate that submit creates a commit, pushes, and reaches verification state.

In the provisioned project directory:

```bash
mkdir -p answers
printf 'test answer\n' > answers/q1.txt
git status --short
nibras test
nibras submit
```

Expected result:

- `nibras test` runs local public tests
- `nibras submit` stages allowed files only
- a commit is created
- push succeeds
- API returns submission states such as:
  - `queued`
  - `running`
  - `passed` or `failed`

Webhook-specific expectation:

- GitHub sends a `push` delivery to `/v1/github/webhooks`
- Nibras validates `X-Hub-Signature-256`
- submission state moves forward

## Scenario 6: Failure and Recovery Test

Run these on purpose.

### 6.1 Missing GitHub credentials

Remove one of:

- `GITHUB_APP_ID`
- `GITHUB_APP_CLIENT_ID`
- `GITHUB_APP_CLIENT_SECRET`
- `GITHUB_APP_PRIVATE_KEY`

Expected result:

- GitHub-specific endpoints fail clearly
- non-GitHub local development still works in fallback mode

### 6.2 Wrong webhook secret

Set a bad `GITHUB_WEBHOOK_SECRET`.

Expected result:

- webhook requests are rejected with `401`

### 6.3 Wrong callback/setup/webhook URLs

Use stale ngrok URLs.

Expected result:

- OAuth callback fails
- GitHub App setup cannot complete
- webhook deliveries fail from GitHub

### 6.4 Submit from wrong repo

Run `nibras submit` from an unrelated git repo.

Expected result:

- submit fails or ping shows repo mismatch

### 6.5 Forbidden files in submit

Modify a file outside `submission.allowedPaths`.

Expected result:

- `nibras submit` refuses to proceed

## Fast Acceptance Checklist

Mark the product healthy only if all of these are true:

- `npm test` passes
- `npm run web:build` passes
- API starts with Postgres
- Web app starts
- GitHub OAuth works
- GitHub App installation works
- `nibras login` works
- `nibras setup` works
- `nibras submit` pushes successfully
- webhook signature validation succeeds
- submission status updates after the push

## What Is Still Missing

The product is much closer, but it is not fully finished yet.

The main missing pieces are:

- real production deployment instead of local/manual startup only
- a real background verification worker for authoritative grading jobs
- end-to-end live GitHub repo provisioning validation with your actual GitHub App credentials
- stronger session/token security for production, especially secret storage and rotation
- production observability: metrics, alerts, structured logs, audit review flow
- CI/CD release pipeline for API, web, and CLI together

## Recommended Test Order For You

If you want the shortest path:

1. Run `npm test`
2. Run `npm run web:build`
3. Run Scenario 2
4. If that works, run Scenario 3
5. Then run Scenario 4 and Scenario 5

That gives you a clean progression from local confidence to real GitHub validation.
