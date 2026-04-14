# Student Guide

This guide explains how to install the Nibras CLI, authenticate against your school's hosted API,
set up a project, and submit work from macOS, Linux, Windows PowerShell, or Windows Git Bash.

---

## 1. Install the CLI

Install the pinned CLI release directly from GitHub:

```bash
npm install -g git+https://github.com/NibrasPlatform/nibras-cli.git#v1.0.2
```

Verify:

```bash
nibras --version
```

The npm package is not published yet, so `npm install -g @nibras/cli` and `npx @nibras/cli`
currently fail with a 404.

If you already have an older global `nibras` link and see `EEXIST` or `ENOTDIR`, remove the old
global install and then rerun the Git-tag install.

---

## 2. Log In

Use the hosted API URL your instructor or admin provides:

```bash
nibras login --api-base-url https://nibras.yourschool.edu
```

The CLI prints a one-time browser URL and short code, then tries to open the browser automatically
unless you pass `--no-open`.

Saved CLI config lives here:

| OS      | Path                                               |
| ------- | -------------------------------------------------- |
| macOS   | `~/Library/Application Support/nibras/config.json` |
| Linux   | `~/.config/nibras/config.json`                     |
| Windows | `%APPDATA%\\nibras\\config.json`                   |

After login, run:

```bash
nibras whoami
```

This confirms the active session, linked GitHub account, and API base URL.

---

## 3. Join a Course

Your instructor will share an invite link. Open it in your browser while signed in with GitHub.
Once you accept the invite, your account is enrolled for the course.

---

## 4. Set Up a Project

Use the project key your instructor shares:

```bash
nibras setup --project cs161/lab1
```

`nibras setup` writes `.nibras/project.json` and `.nibras/task.md`, initializes git when needed,
and connects the directory to your student repository.

To set up the project in a specific directory:

```bash
nibras setup --project cs161/lab1 --dir ~/projects/lab1
```

On Windows:

- PowerShell example: `nibras setup --project cs161/lab1 --dir C:\projects\lab1`
- Git Bash example: `nibras setup --project cs161/lab1 --dir /c/projects/lab1`

---

## 5. Work on the Task

Read the assignment text at any time:

```bash
nibras task
```

Then edit your project files and run the local test command:

```bash
nibras test
```

`nibras test` runs the manifest-configured test command for your OS. A non-zero exit code means the
local test command failed.

If your project supports previous-milestone testing, you can also run:

```bash
nibras test --previous
```

---

## 6. Submit

```bash
nibras submit
```

The CLI will:

1. Run the local test command.
2. Stage only files allowed by `.nibras/project.json`.
3. Create a commit and push it to `origin`.
4. Register the submission with the API.
5. Poll for verification until the run finishes or times out.

If local tests fail, submission still continues. The CLI records the local test result with the
submission and waits for server-side verification.

> **Deadline enforcement:** submissions after the milestone due date are rejected with a 422
> `VALIDATION_ERROR`. Contact your instructor if you need an extension.

---

## 7. Check Session and Project Status

Use these commands any time:

```bash
nibras whoami
nibras ping
```

`nibras ping` checks API reachability, auth, GitHub linkage, GitHub App installation, and, when
run inside a project, the project key and `origin` remote.

---

## 8. Token Refresh

The CLI refreshes saved session tokens automatically when possible. If you get an
`INVALID_SESSION` error, run `nibras login --api-base-url <your-api-url>` again.

---

## 9. Log Out

```bash
nibras logout
```

This clears the local CLI session. Run `nibras login --api-base-url <your-api-url>` again when you
need a new session.

---

## 10. Common Errors

| Error              | Cause                                         | Fix                                                          |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------ |
| `AUTH_REQUIRED`    | You are not logged in for the current API URL | Run `nibras login --api-base-url <your-api-url>`             |
| `INVALID_SESSION`  | The saved session expired or was revoked      | Run `nibras login --api-base-url <your-api-url>`             |
| `NOT_FOUND`        | Wrong project key or missing resource         | Recheck the project key from your instructor                 |
| `VALIDATION_ERROR` | Invalid input or a missed deadline            | Read the error message and contact your instructor if needed |
| `RATE_LIMITED`     | Too many requests in a short period           | Wait, then retry                                             |

---

## 11. Getting Help

Ask your instructor for the correct hosted API URL and project key first. For CLI bugs, open an
issue in the `nibras-cli` repository.
