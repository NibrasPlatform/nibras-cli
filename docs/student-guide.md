# Student Guide

This guide explains how to set up the Nibras CLI, submit work, and track your progress.

---

## 1. Installing the CLI

```bash
npm install -g @nibras/cli
```

Verify:

```bash
nibras --version
```

---

## 2. Logging In

```bash
nibras login
```

You will see a one-time code. Open the URL shown, paste the code, and authorise with your GitHub account. Once authorised, the CLI saves your tokens in `~/.nibras/cli.json` and you are ready to go.

---

## 3. Joining a Course

Your instructor will share an invite link. Open it in your browser while logged into GitHub — you will be enrolled automatically.

---

## 4. Setting Up a Project

```bash
cd ~/projects
nibras setup cs161/lab1
```

This creates a local directory `nibras-cs161-lab1/` cloned from the starter repo and links it to your account.

---

## 5. Working on a Submission

1. Read the task file:
   ```bash
   nibras task
   ```
2. Implement your solution inside the project directory.
3. Run the test suite locally (optional but recommended):
   ```bash
   nibras test
   ```
   This runs the same tests the server will run and reports a local pass/fail.

---

## 6. Submitting

```bash
nibras submit
```

The CLI will:
1. Stage only the **allowed files** (configured in `.nibras/project.json`).
2. Commit and push to your remote branch.
3. Poll the API for verification results.
4. Print the final status: `passed`, `failed`, or `needs_review`.

> **Deadline enforcement:** Submissions after the milestone due date will be rejected with a 422 error. Contact your instructor if you need an extension.

---

## 7. Checking Status

```bash
nibras status
```

Shows the most recent submission and its verification status.

You can also watch live status updates from the web dashboard — the submission detail page streams real-time updates via Server-Sent Events.

---

## 8. Token Refresh

Access tokens expire after 8 hours. The CLI refreshes them automatically when you run any command. If you get an `INVALID_SESSION` error, re-run `nibras login`.

---

## 9. Logging Out

```bash
nibras logout
```

Revokes your CLI session. Use `nibras login` again when needed.

---

## 10. Account Deletion (GDPR)

To permanently delete your account and all personal data:

```bash
curl -X DELETE https://nibras.yourschool.edu/v1/me/account \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"confirm": "DELETE MY ACCOUNT"}'
```

This anonymises your profile, revokes all sessions, and removes your course memberships. Submission records are retained in anonymised form for academic integrity purposes.

---

## 11. Common Errors

| Error | Cause | Fix |
|---|---|---|
| `AUTH_REQUIRED` | No token or cookie | Run `nibras login` |
| `INVALID_SESSION` | Token expired or revoked | Run `nibras login` |
| `NOT_FOUND` | Wrong project key or ID | Check `nibras task` for the correct key |
| `VALIDATION_ERROR` (deadline) | Past the due date | Contact your instructor |
| `RATE_LIMITED` | Too many requests | Wait the indicated number of seconds |

---

## 12. Getting Help

Ask your instructor or open an issue on your course platform. For CLI bugs, open an issue in the `nibras-cli` repository.
