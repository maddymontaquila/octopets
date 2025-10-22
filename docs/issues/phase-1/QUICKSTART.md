# Quick Start: Create Phase 1 Issues

## TL;DR

Run these commands to create all Phase 1 issues:

```bash
# Navigate to the issue directory
cd docs/issues/phase-1

# Ensure you're authenticated with GitHub
gh auth login

# Run the script
./create-issues.sh
```

That's it! Four new issues (T002-T005) will be created in the repository.

## What Gets Created

| Task | Title | Labels |
|------|-------|--------|
| T002 | Create backend model files (Group 1) | enhancement, phase-1, setup |
| T003 | Create backend model files (Group 2) | enhancement, phase-1, setup |
| T004 | Create repository interface files | enhancement, phase-1, setup |
| T005 | Review existing authentication patterns | enhancement, phase-1, setup, documentation |

## Verification

After running the script, verify the issues were created:

```bash
gh issue list --repo maddymontaquila/octopets --label phase-1
```

You should see 5 total issues (including the existing T001/Issue #2).

## Troubleshooting

### "gh: command not found"
Install the GitHub CLI: https://cli.github.com/

### "authentication required"
Run: `gh auth login` and follow the prompts

### "rate limit exceeded"
Wait a few minutes and try again, or create issues manually via the web UI

## Alternative: Create One Issue at a Time

If you prefer to create issues individually:

```bash
# T002
gh issue create --repo maddymontaquila/octopets \
  --title "T002: Create backend model files (Group 1)" \
  --label "enhancement,phase-1,setup" \
  --body-file T002-create-backend-model-files-group1.md

# T003
gh issue create --repo maddymontaquila/octopets \
  --title "T003: Create backend model files (Group 2)" \
  --label "enhancement,phase-1,setup" \
  --body-file T003-create-backend-model-files-group2.md

# T004
gh issue create --repo maddymontaquila/octopets \
  --title "T004: Create repository interface files" \
  --label "enhancement,phase-1,setup" \
  --body-file T004-create-repository-interface-files.md

# T005
gh issue create --repo maddymontaquila/octopets \
  --title "T005: Review existing authentication patterns" \
  --label "enhancement,phase-1,setup,documentation" \
  --body-file T005-review-authentication-patterns.md
```

## Need Help?

See `README.md` in this directory for more detailed instructions and alternative methods.
