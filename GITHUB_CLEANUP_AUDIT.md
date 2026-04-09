GITHUB_CLEANUP_AUDIT.md
> 📅 Last Updated: April 2026  
> 👤 Maintainer: Mahmoud Alashwal  
> 🔗 Branch: `grading-system`  
> 📦 Package: `@nibras/grading`

---

## 🎯 Purpose
Document the cleanup, structure, and security rules for the `nibras-cli` repository to ensure:
- ✅ Clean development environment (no stale branches/files)
- ✅ Strict protection of API keys & sensitive data
- ✅ Smooth onboarding for new team members

---

## 🧹 Branches Audit

### Active Branches
| Branch          | Status   | Description                          |
|-----------------|----------|--------------------------------------|
| `grading-system`| ✅ Active | Main development branch for AI grading package |

### Cleaned/Removed
- `main` (local only) → migrated logic to `grading-system`
- `test-*` → temporary testing branches deleted
- Any branch with `sk-` or `.env` in commit history → force-pushed & rewritten safely

---

## 🔐 Security & Environment Rules

### 🚫 NEVER COMMIT THESE (enforced via `.gitignore`):
```bash
.env
.env.*
*.log
node_modules/
dist/
coverage/
.DS_Store