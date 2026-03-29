# Praxis Hosted CLI Migration

This repository now supports a project-local learner flow alongside the legacy
course CLI.

Use the new flow like this:

```bash
npm run build
npm run api:dev
praxis login
praxis whoami
praxis ping
praxis test
praxis task
praxis submit
```

Notes:

- `praxis` without positional arguments now shows a polished help screen.
- `praxis <subject> <command> <project>` still routes to the legacy CLI.
- `praxis setup --project cs161/exam1 --dir /tmp/my-project` bootstraps a local
  project manifest from the API.
