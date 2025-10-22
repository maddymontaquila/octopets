#!/bin/bash

# Script to create GitHub issues for Phase 1 tasks
# Usage: ./create-issues.sh
# Prerequisites: gh CLI must be installed and authenticated (gh auth login)

REPO="maddymontaquila/octopets"

echo "Creating Phase 1 issues for $REPO..."

# T002: Create backend model files (Group 1)
echo "Creating T002..."
gh issue create \
  --repo "$REPO" \
  --title "T002: Create backend model files (Group 1)" \
  --label "enhancement,phase-1,setup" \
  --body "**Phase**: 1 - Setup (Shared Infrastructure)
**User Story**: Setup
**Can run in parallel**: Yes

## Description
Create backend model files for the pet sitter marketplace:
- \`backend/Models/PetOwner.cs\`
- \`backend/Models/PetSitter.cs\`
- \`backend/Models/Booking.cs\`

These model files will define the core data structures for pet owners, pet sitters, and bookings in the marketplace.

## Acceptance Criteria
- [ ] \`backend/Models/PetOwner.cs\` created with appropriate properties
- [ ] \`backend/Models/PetSitter.cs\` created with appropriate properties
- [ ] \`backend/Models/Booking.cs\` created with appropriate properties
- [ ] All model files follow existing backend model conventions
- [ ] Models align with the data model specification

## Related Tasks
Part of Phase 1 (Setup) - Foundation for all marketplace features"

# T003: Create backend model files (Group 2)
echo "Creating T003..."
gh issue create \
  --repo "$REPO" \
  --title "T003: Create backend model files (Group 2)" \
  --label "enhancement,phase-1,setup" \
  --body "**Phase**: 1 - Setup (Shared Infrastructure)
**User Story**: Setup
**Can run in parallel**: Yes

## Description
Create backend model files for the pet sitter marketplace:
- \`backend/Models/Service.cs\`
- \`backend/Models/Availability.cs\`
- \`backend/Models/Message.cs\`
- \`backend/Models/Pet.cs\`

These model files will define the data structures for services, availability schedules, messaging, and pet information in the marketplace.

## Acceptance Criteria
- [ ] \`backend/Models/Service.cs\` created with appropriate properties
- [ ] \`backend/Models/Availability.cs\` created with appropriate properties
- [ ] \`backend/Models/Message.cs\` created with appropriate properties
- [ ] \`backend/Models/Pet.cs\` created with appropriate properties
- [ ] All model files follow existing backend model conventions
- [ ] Models align with the data model specification

## Related Tasks
Part of Phase 1 (Setup) - Foundation for all marketplace features"

# T004: Create repository interface files
echo "Creating T004..."
gh issue create \
  --repo "$REPO" \
  --title "T004: Create repository interface files" \
  --label "enhancement,phase-1,setup" \
  --body "**Phase**: 1 - Setup (Shared Infrastructure)
**User Story**: Setup
**Can run in parallel**: No

## Description
Create repository interface files in \`backend/Repositories/Interfaces/\` for the pet sitter marketplace entities.

These interfaces will define the contract for data access operations across all marketplace entities (PetOwner, PetSitter, Booking, Service, Availability, Message, Pet).

## Acceptance Criteria
- [ ] Repository interface files created in \`backend/Repositories/Interfaces/\` directory
- [ ] Interfaces defined for all marketplace entities (PetOwner, PetSitter, Booking, Service, Availability, Message, Pet)
- [ ] Interfaces follow existing repository pattern conventions in the codebase
- [ ] Standard CRUD operations defined in each interface as appropriate
- [ ] Interfaces include any specialized query methods needed for marketplace functionality

## Related Tasks
Part of Phase 1 (Setup) - Foundation for all marketplace features
Prerequisite for T008, T009, T010 (repository implementations)"

# T005: Review existing authentication patterns
echo "Creating T005..."
gh issue create \
  --repo "$REPO" \
  --title "T005: Review existing authentication patterns" \
  --label "enhancement,phase-1,setup,documentation" \
  --body "**Phase**: 1 - Setup (Shared Infrastructure)
**User Story**: Setup
**Can run in parallel**: No

## Description
Review existing authentication patterns in \`backend/Program.cs\` and document the approach for marketplace functionality.

This task involves understanding how authentication is currently implemented and documenting how it should be applied to marketplace features (pet owner and pet sitter accounts).

## Acceptance Criteria
- [ ] Existing authentication patterns in \`backend/Program.cs\` reviewed and understood
- [ ] Authentication approach documented for marketplace (separate doc or inline comments)
- [ ] Clarification on whether pet owners and pet sitters share authentication or need separate mechanisms
- [ ] Any necessary authentication configuration identified for marketplace endpoints
- [ ] Documentation includes examples of how to apply authentication to marketplace routes

## Related Tasks
Part of Phase 1 (Setup) - Foundation for all marketplace features
Prerequisite for implementing secure marketplace endpoints in later phases"

echo "Done! All Phase 1 issues created."
