# Nibras

> Hosted, GitHub-linked CLI for project setup, testing, and submission.

Nibras is a course operations platform built around a hosted CLI. Students use it to log in, set up projects, run local tests, and submit work. Instructors get a web dashboard for course management, project tracking, submission review, and grade export. Operators run the API, worker, database, and web app as one system.

## What It Does

| Persona | Primary workflow |
| --- | --- |
| Student | `nibras login` -> `nibras setup` -> `nibras task` -> `nibras test` -> `nibras submit` |
| Instructor | Manage courses, projects, milestones, reviews, and exports from the web app |
| Operator | Run API + worker + web, configure GitHub App auth, monitor jobs and health |

Core capabilities:

- Device-flow GitHub login for the CLI and web app
- Project bootstrapping from hosted manifests, task text, and starter code
- Submission pipeline with allowed-file staging, commit/push, verification, and review
- Real-time submission updates, per-course analytics, and in-app notifications
- Instructor workflows for course setup, milestone tracking, reviews, and CSV export
- Optional AI-assisted grading, email notifications, metrics, and Redis-backed job dispatch

## Recent System Updates

- CLI improvements: `nibras list`, `nibras status`, and `nibras submit --milestone <slug>` are now part of the main hosted flow.
- Live submission UX: the web app now streams submission state over SSE instead of relying on client polling.
- Analytics: students get per-course submission analytics, and instructors get class-wide milestone and progress analytics.
- Notifications: in-app notifications, unread counts, mark-read actions, and per-type notification preferences are built in.
- Admin operations: audit log browsing, bulk submission retry, and richer review tooling are now part of the system.
- Submission control: queued submissions can be cancelled and tracked with the `cancelled` status.
- Queueing: the worker supports Redis/BullMQ instant dispatch with DB-polling fallback when Redis is not configured.
- Grading and alerts: aggregate AI confidence thresholds can push work into `needs_review`, and instructors are notified automatically.

## Architecture

```text
Student CLI
  -> API
  -> GitHub repo
  -> submission record
  -> worker verification
  -> SSE status stream / notifications / review / export in web app
```

Main runtime pieces:

- `apps/api`: Fastify API for auth, setup, submissions, tracking, and GitHub integration
- `apps/worker`: verification runner, grading pipeline, queue consumer, email hooks, health endpoint
- `apps/web`: Next.js instructor and student dashboard with analytics, notifications, and admin tools
- `apps/cli`: published `@nibras/cli` package
- `apps/proxy`: local same-origin proxy for live dev and GitHub callback testing

Shared packages:

- `@nibras/contracts`: Zod schemas and shared types
- `@nibras/core`: config, manifests, git helpers, API client
- `@nibras/github`: GitHub App signing and webhook helpers
- `@nibras/grading`: grading pipeline and AI integration helpers

## Repository Map

```text
nibras-cli/
├── apps/
│   ├── api/
│   ├── cli/
│   ├── proxy/
│   ├── web/
│   └── worker/
├── packages/
│   ├── contracts/
│   ├── core/
│   ├── github/
│   └── grading/
├── prisma/
├── docs/
├── test/
├── src/            # legacy CLI fallback
├── bin/            # root nibras entrypoint
└── .github/workflows/
```

The root `bin/nibras.js` tries the modern bundled CLI first, then falls back to the legacy CommonJS CLI in `src/`.

## Local Development

Prerequisites:

- Node.js `>=18`
- npm `>=9`
- git
- Docker
- `pg_isready` available locally

Start the repo locally:

```bash
git clone https://github.com/NibrasPlatform/nibras-cli.git
cd nibras-cli
npm ci
cp .env.example .env
npm run dev
```

`npm run dev` will:

1. Start local Postgres with Docker Compose when needed
2. Wait for database readiness
3. Apply Prisma migrations
4. Build the workspace
5. Start watch mode plus the API, worker, and web app

Default local endpoints:

| Service | URL |
| --- | --- |
| API | `http://127.0.0.1:4848` |
| API health | `http://127.0.0.1:4848/v1/health` |
| Web | `http://127.0.0.1:3000` |
| Proxy | `http://127.0.0.1:8080` |
| Worker health | `http://127.0.0.1:9090/healthz` |

## Install The CLI

Install the pinned public package:

```bash
npm install -g @nibras/cli@1.0.2
```

Verify the install:

```bash
nibras --version
```

Hosted login example:

```bash
nibras login --api-base-url https://nibras.yourschool.edu
```

For a full student walkthrough, see [docs/student-guide.md](docs/student-guide.md).

## CLI Workflow

Typical student flow:

```bash
nibras login --api-base-url https://nibras.yourschool.edu
nibras list
nibras setup --project cs161/lab1
nibras task
nibras test
nibras submit
nibras status
```

Important behavior:

- `nibras test` runs the manifest-configured local test command
- `nibras submit` runs local tests first and stops on failure unless you pass `--force`
- `nibras submit --milestone <slug>` targets a specific milestone when a project supports milestone-scoped submissions
- `nibras setup --project` writes `.nibras/project.json` and `.nibras/task.md`
- `nibras status` shows recent submission states, including queued, running, passed, failed, under review, and cancelled
- `nibras ping` is the fastest end-to-end health check for login, GitHub linkage, and repo state

## CLI Command Reference

| Command | Purpose | Example |
| --- | --- | --- |
| `login` | Start device login against the hosted API | `nibras login --api-base-url https://nibras.yourschool.edu` |
| `logout` | Clear the local CLI session | `nibras logout` |
| `whoami` | Show the signed-in user and linked GitHub account | `nibras whoami` |
| `list` | List enrolled courses and projects | `nibras list` |
| `status` | Show recent submission statuses | `nibras status` |
| `setup` | Bootstrap a local project from the API | `nibras setup --project cs161/lab1` |
| `task` | Print current task instructions | `nibras task` |
| `test` | Run project-local public tests | `nibras test` |
| `submit` | Commit tracked files, push, and wait for verification | `nibras submit` |
| `ping` | Verify API, auth, GitHub, app install, and project state | `nibras ping` |
| `update` | Check or install a CLI release | `nibras update --check` |
| `update` | Install a specific release | `nibras update --version v1.0.2` |
| `uninstall` | Remove the global CLI install | `nibras uninstall` |
| `update-buildpack` | Update Node version in `.nibras/project.json` | `nibras update-buildpack --node 20` |
| `legacy` | Run the legacy subject/project CLI | `nibras legacy` |

Useful flags:

- `nibras submit --force`
- `nibras submit --milestone <slug>`
- `nibras test --previous`
- `nibras login --no-open`

## Environment

Copy `.env.example` to `.env` and fill in the required values.

Required groups:

| Group | Required keys |
| --- | --- |
| Database | `DATABASE_URL` |
| Encryption | `NIBRAS_ENCRYPTION_KEY` |
| GitHub App | `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_NAME`, `GITHUB_WEBHOOK_SECRET` |
| App URLs | `NIBRAS_API_BASE_URL`, `NIBRAS_WEB_BASE_URL` |

Optional groups:

- Redis / queueing: `REDIS_URL`, `WORKER_CONCURRENCY`
- Worker tuning: `WORKER_POLL_INTERVAL_MS`, `WORKER_HEALTH_PORT`, `WORKER_SANDBOX_MODE`
- Email: `RESEND_API_KEY`, `NIBRAS_EMAIL_FROM`
- Monitoring: `SENTRY_DSN`, `NIBRAS_METRICS_TOKEN`
- AI grading: `NIBRAS_AI_API_KEY`, `NIBRAS_AI_MODEL`, `NIBRAS_AI_BASE_URL`, `NIBRAS_AI_MIN_CONFIDENCE`

Behavior notes:

- When `REDIS_URL` is set, the API enqueues verification jobs to BullMQ for immediate worker pickup.
- When `REDIS_URL` is unset, the worker falls back to built-in database polling.
- Notification preferences control whether in-app and email alerts are created for supported events.

Validate your environment:

```bash
npm run validate:env
```

## GitHub App Setup

Nibras depends on a GitHub App for login, repository access, and webhook handling.

1. Create a GitHub App at `https://github.com/settings/apps/new`
2. Set the callback URL to `<public-url>/v1/github/oauth/callback`
3. Set the setup URL to `<public-url>/install/complete`
4. Set the webhook URL to `<public-url>/v1/github/webhooks`
5. Enable device flow
6. Grant repository permissions for contents, metadata, and commit statuses
7. Copy the app credentials into `.env`

For live local testing:

```bash
npm run proxy:dev
ngrok http 8080
```

Point the GitHub App URLs and your `NIBRAS_API_BASE_URL` / `NIBRAS_WEB_BASE_URL` at the ngrok URL while testing.

## Database

Prisma commands:

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:deploy
npm run db:local:reset
```

Schema lives in [prisma/schema.prisma](prisma/schema.prisma).

## Deployment

Production entry points:

- `docker-compose.prod.yml` for a full stack compose deployment
- `Dockerfile.api`, `Dockerfile.worker`, `Dockerfile.web`, and `Dockerfile` for image builds
- `fly.api.toml`, `fly.worker.toml`, and `fly.web.toml` for Fly.io deployment

GitHub Actions:

- `ci.yml`: lint, validate env, generate Prisma client, build, test, and build web
- `release.yml`: publish `@nibras/cli` on `v*` tags
- `deploy.yml`: deploy API, worker, and web to Fly.io on pushes to `main`

Operational features in production:

- SSE submission streams for live web status updates
- In-app notifications plus email notifications for review-related events
- Instructor analytics and admin audit logs
- Bulk retry tooling for failed or stuck submission workflows

Start the production compose stack:

```bash
docker compose -f docker-compose.prod.yml up -d
npm run db:deploy
```

More detail lives in [DEPLOY.md](DEPLOY.md), [docs/ops-guide.md](docs/ops-guide.md), and [docs/runbook.md](docs/runbook.md).

## Testing

```bash
npm run build
npm run test
node --test test/cli-docs.test.js
```

Manual validation notes live in [TEST.md](TEST.md).

## Additional Docs

- [docs/student-guide.md](docs/student-guide.md)
- [docs/instructor-guide.md](docs/instructor-guide.md)
- [docs/project-tracking.md](docs/project-tracking.md)
- [docs/ops-guide.md](docs/ops-guide.md)
- [docs/api-reference.pdf](docs/api-reference.pdf)

## License

See [LICENSE](LICENSE).
