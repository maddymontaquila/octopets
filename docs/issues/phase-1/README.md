# Phase 1 Issues for Pet Sitter Marketplace

This directory contains issue documentation for Phase 1 tasks defined in `specs/001-pet-sitter-marketplace/tasks.md`.

## Tasks in Phase 1

Based on the task breakdown, Phase 1 includes:

1. **T001**: Create mock data source files ✅ (Already exists as [Issue #2](https://github.com/maddymontaquila/octopets/issues/2))
2. **T002**: Create backend model files (Group 1) - PetOwner, PetSitter, Booking
3. **T003**: Create backend model files (Group 2) - Service, Availability, Message, Pet
4. **T004**: Create repository interface files
5. **T005**: Review existing authentication patterns

## Issue Files

Each task has a corresponding markdown file with the full issue description:

- `T002-create-backend-model-files-group1.md`
- `T003-create-backend-model-files-group2.md`
- `T004-create-repository-interface-files.md`
- `T005-review-authentication-patterns.md`

## Creating the Issues

### Option 1: Using the Script (Recommended)

Run the provided script to create all issues at once:

```bash
# Prerequisites: gh CLI must be installed and authenticated
gh auth login

# Run the script
./create-issues.sh
```

### Option 2: Manual Creation

You can manually create each issue using the `gh` CLI:

```bash
gh issue create --repo maddymontaquila/octopets \
  --title "T002: Create backend model files (Group 1)" \
  --label "enhancement,phase-1,setup" \
  --body-file T002-create-backend-model-files-group1.md
```

Repeat for T003, T004, and T005.

### Option 3: Via GitHub UI

1. Go to https://github.com/maddymontaquila/octopets/issues/new
2. Copy the content from each markdown file
3. Add the appropriate labels: `enhancement`, `phase-1`, `setup` (and `documentation` for T005)
4. Create the issue

## Issue Format

All issues follow the same format as [Issue #2](https://github.com/maddymontaquila/octopets/issues/2):

- **Phase**: Identifies which phase the task belongs to
- **User Story**: The user story this task supports
- **Can run in parallel**: Whether this task can be done in parallel with others
- **Description**: Detailed description of what needs to be done
- **Acceptance Criteria**: Checklist of requirements for completion
- **Related Tasks**: How this task relates to other tasks
- **Labels**: Appropriate labels for categorization

## Labels Used

- `enhancement`: New feature or request
- `phase-1`: Task is part of Phase 1
- `setup`: Task is part of setup/infrastructure work
- `documentation`: Task involves documentation (T005 only)
