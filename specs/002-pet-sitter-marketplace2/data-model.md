# Data Model: Pet Sitter Marketplace Platform

**Feature Branch**: `002-pet-sitter-marketplace2`  
**Date**: October 21, 2025  
**Status**: Design Phase

This document defines the entity models and their relationships for the pet sitter marketplace platform.

---

## Entity Overview

```text
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  PetOwner   │──┬─────→│  PetProfile  │         │  PetSitter  │
└─────────────┘  │      └──────────────┘         └─────────────┘
       │         │              │                        │
       │         │              │                        │
       ↓         │              ↓                        ↓
┌─────────────┐  │      ┌──────────────┐         ┌─────────────┐
│   Booking   │←─┴──────┤   Booking    │←────────┤   Booking   │
└─────────────┘         └──────────────┘         └─────────────┘
       │                                                 │
       │                                                 │
       ↓                                                 ↓
┌─────────────┐                                  ┌─────────────┐
│   Message   │←─────────────────────────────────┤   Message   │
└─────────────┘                                  └─────────────┘
       ↓
┌─────────────┐
│   Review    │
└─────────────┘
```

---

## Core Entities

### 1. User (Base Account)

**Purpose**: Base authentication and account management for all users.

**Fields**:
- `Id` (Guid, PK): Unique identifier
- `Email` (string, unique, required): User email for authentication
- `PasswordHash` (string, required): Hashed password (never store plaintext)
- `UserType` (enum: Owner, Sitter, Both): Account type
- `EmailVerified` (bool): Email verification status
- `CreatedAt` (DateTime): Account creation timestamp
- `LastLoginAt` (DateTime, nullable): Last login timestamp

**Validation Rules**:
- Email must be valid format (RFC 5322)
- Password minimum 8 characters, must contain letters, numbers, symbols (per FR-039)
- Email verification required before accessing platform features (per FR-038)

**State Transitions**:
1. Created → EmailVerified (via verification link)
2. Active → Suspended (admin action for policy violations)
3. Suspended → Active (admin review)

---

### 2. PetOwner

**Purpose**: Profile information for pet owners seeking sitters.

**Fields**:
- `Id` (Guid, PK): Unique identifier
- `UserId` (Guid, FK → User): Associated user account
- `FirstName` (string, required): Owner first name
- `LastName` (string, required): Owner last name
- `PhoneNumber` (string, nullable): Contact phone
- `Address` (string, nullable): Primary address
- `City` (string, nullable): City
- `State` (string, nullable): State/province
- `ZipCode` (string, nullable): Postal code
- `ProfilePhotoUrl` (string, nullable): Azure Blob Storage URL
- `CreatedAt` (DateTime): Profile creation
- `UpdatedAt` (DateTime): Last profile update

**Relationships**:
- One-to-Many with `PetProfile` (owner has multiple pets)
- One-to-Many with `Booking` (owner creates bookings)
- One-to-Many with `Message` (owner sends/receives messages)

**Validation Rules**:
- Phone number format validation (E.164 standard)
- Zip code matches country format

---

### 3. PetProfile

**Purpose**: Detailed information about pets needing care.

**Fields**:
- `Id` (Guid, PK): Unique identifier
- `OwnerId` (Guid, FK → PetOwner): Associated owner
- `Name` (string, required): Pet name
- `Type` (enum: Dog, Cat, Bird, Reptile, SmallMammal): Pet type (per FR-018)
- `Breed` (string, nullable): Breed or species
- `Age` (int): Age in years
- `Weight` (decimal): Weight in pounds
- `Gender` (enum: Male, Female, Unknown): Pet gender
- `IsSpayedNeutered` (bool): Spayed/neutered status
- `ProfilePhotoUrl` (string, nullable): Primary photo URL
- `AdditionalPhotoUrls` (JSON array, max 5): Additional photos (per FR-022)
- `Allergies` (string, nullable): Known allergies
- `Medications` (string, nullable): Current medications
- `VetName` (string, nullable): Veterinarian name
- `VetPhone` (string, nullable): Veterinarian phone
- `VaccinationRecordUrl` (string, nullable): Uploaded vaccination record
- `DietaryNeeds` (string, nullable): Special dietary requirements
- `Temperament` (string, nullable): Behavioral description
- `EnergyLevel` (enum: Low, Medium, High): Activity level
- `SociabilityWithDogs` (enum: Unknown, Fearful, Neutral, Friendly): Dog socialization
- `SociabilityWithCats` (enum: Unknown, Fearful, Neutral, Friendly): Cat socialization
- `SociabilityWithChildren` (enum: Unknown, Fearful, Neutral, Friendly): Child socialization
- `TrainingStatus` (string, nullable): Training history
- `FearsAndTriggers` (string, nullable): Known fears
- `FeedingSchedule` (string, nullable): Feeding instructions
- `ExerciseRoutine` (string, nullable): Exercise needs
- `SpecialInstructions` (string, nullable): Care instructions
- `IsActive` (bool): Active/archived status
- `CreatedAt` (DateTime): Profile creation
- `UpdatedAt` (DateTime): Last update

**Relationships**:
- Many-to-One with `PetOwner`
- Many-to-Many with `Booking` (multiple pets per booking)

**Validation Rules**:
- Age must be >= 0
- Weight must be > 0
- Photos limited to 5MB each (per FR-022)
- VaccinationRecordUrl must be PDF or image format

---

### 4. PetSitter

**Purpose**: Profile and service information for pet sitters.

**Fields**:
- `Id` (Guid, PK): Unique identifier
- `UserId` (Guid, FK → User): Associated user account
- `FirstName` (string, required): Sitter first name
- `LastName` (string, required): Sitter last name
- `DisplayName` (string, nullable): Public display name
- `Bio` (string, max 500 chars): Sitter bio (per FR-013)
- `ExperienceYears` (int): Years of experience
- `ExperienceDescription` (string, nullable): Detailed experience
- `Certifications` (JSON array): List of certifications
- `Address` (string, required): Service location
- `City` (string, required): City
- `State` (string, required): State/province
- `ZipCode` (string, required): Postal code
- `Latitude` (double): Geocoded latitude
- `Longitude` (double): Geocoded longitude
- `ServiceRadius` (int): Service radius in miles
- `ProfilePhotoUrl` (string, nullable): Primary photo
- `AdditionalPhotoUrls` (JSON array, max 10): Gallery photos (per FR-014)
- `ServicesOffered` (JSON array): Services from predefined list (per FR-015)
- `PetTypesAccepted` (JSON array): Accepted pet types (per FR-018)
- `PetSizeRestrictions` (string, nullable): Size limitations
- `Skills` (JSON array): Skills/certifications tags (per FR-019)
- `RateStructure` (JSON object): Pricing per service type (per FR-016)
- `AverageRating` (decimal, 0-5): Calculated average rating
- `TotalReviews` (int): Total review count
- `ResponseTimeMinutes` (int, nullable): Average response time
- `IsActive` (bool): Active/inactive status
- `CreatedAt` (DateTime): Profile creation
- `UpdatedAt` (DateTime): Last update

**Relationships**:
- One-to-Many with `SitterAvailability` (availability calendar)
- One-to-Many with `Booking` (sitter receives bookings)
- One-to-Many with `Review` (sitter receives reviews)
- One-to-Many with `Message` (sitter sends/receives messages)

**Validation Rules**:
- Bio max 500 characters (per FR-013)
- Profile photo max 5MB (per FR-014)
- Additional photos max 10 total (per FR-014)
- ExperienceYears must be >= 0
- ServiceRadius must be > 0
- ServicesOffered must contain at least one service
- PetTypesAccepted must contain at least one type
- RateStructure must have rates for all offered services
- AverageRating between 0-5, calculated from reviews

**Enums**:
- **ServiceType**: OvernightSitting, DailyCheckIn, DogWalking, Grooming, Training, MedicationAdministration, SpecialNeedsCare (per FR-015)
- **PetType**: Dog, Cat, Bird, Reptile, SmallMammal (per FR-018)

---

### 5. SitterAvailability

**Purpose**: Calendar of available/blocked dates for sitters.

**Fields**:
- `Id` (Guid, PK): Unique identifier
- `SitterId` (Guid, FK → PetSitter): Associated sitter
- `Date` (DateOnly): Specific date
- `IsAvailable` (bool): Available vs blocked
- `Notes` (string, nullable): Availability notes
- `CreatedAt` (DateTime): Record creation
- `UpdatedAt` (DateTime): Last update

**Relationships**:
- Many-to-One with `PetSitter`

**Validation Rules**:
- Date must be >= today (per FR-017, up to 6 months in advance)
- Date must be <= 6 months from now

---

### 6. Booking

**Purpose**: Transaction record between owner and sitter for pet care services.

**Fields**:
- `Id` (Guid, PK): Unique identifier
- `OwnerId` (Guid, FK → PetOwner): Requesting owner
- `SitterId` (Guid, FK → PetSitter): Target sitter
- `ServiceType` (enum: ServiceType): Requested service (per FR-007)
- `StartDate` (DateTime): Service start date/time
- `EndDate` (DateTime): Service end date/time
- `Status` (enum: Pending, Accepted, Declined, Cancelled, Completed): Booking status
- `TotalCost` (decimal): Calculated total cost
- `SpecialRequests` (string, nullable): Owner notes
- `SitterNotes` (string, nullable): Sitter internal notes
- `DeclineReason` (string, nullable): Reason for decline
- `CancellationReason` (string, nullable): Reason for cancellation
- `CancelledBy` (enum: Owner, Sitter, System): Who cancelled
- `CancelledAt` (DateTime, nullable): Cancellation timestamp
- `CreatedAt` (DateTime): Booking request creation
- `AcceptedAt` (DateTime, nullable): Acceptance timestamp
- `CompletedAt` (DateTime, nullable): Completion timestamp
- `UpdatedAt` (DateTime): Last update

**Relationships**:
- Many-to-One with `PetOwner`
- Many-to-One with `PetSitter`
- Many-to-Many with `PetProfile` (via BookingPet join table)
- One-to-Many with `Message` (booking conversation thread)
- One-to-One with `Review` (post-booking review)

**Validation Rules**:
- StartDate must be >= today
- EndDate must be > StartDate
- Status transitions:
  - Pending → Accepted (sitter accepts)
  - Pending → Declined (sitter declines)
  - Accepted → Cancelled (owner or sitter cancels)
  - Accepted → Completed (service completed)
- Cancellation requires 24-48 hour notice (per FR-012)
- Review can only be submitted if Status = Completed (per FR-034)

**State Diagram**:
```text
   [Created]
       ↓
   [Pending] ←──────── Initial state
    ↙     ↘
[Accepted] [Declined] ← Sitter response within 24h (per FR-009)
    ↓
[Cancelled] ← With notice period (per FR-012)
    or
[Completed] ← Service finished
    ↓
[Reviewed] ← Owner reviews (optional, within 7 days per FR-034)
```

---

### 7. BookingPet (Join Table)

**Purpose**: Many-to-many relationship between bookings and pets.

**Fields**:
- `BookingId` (Guid, FK → Booking): Associated booking
- `PetProfileId` (Guid, FK → PetProfile): Selected pet

**Relationships**:
- Links `Booking` ↔ `PetProfile`

---

### 8. Message

**Purpose**: Communication thread between owners and sitters.

**Fields**:
- `Id` (Guid, PK): Unique identifier
- `BookingId` (Guid, FK → Booking, nullable): Associated booking (nullable for pre-booking chats)
- `SenderId` (Guid, FK → User): Message sender
- `RecipientId` (Guid, FK → User): Message recipient
- `MessageText` (string, required): Message content
- `AttachmentUrls` (JSON array): Attached files (per FR-028, max 10MB)
- `IsRead` (bool): Read status
- `ReadAt` (DateTime, nullable): Read timestamp
- `CreatedAt` (DateTime): Message sent timestamp

**Relationships**:
- Many-to-One with `Booking` (optional)
- Many-to-One with `User` (sender)
- Many-to-One with `User` (recipient)

**Validation Rules**:
- MessageText max 5,000 characters
- Attachments max 10MB total (per FR-028)
- Attachment file types: PDF, JPEG, PNG, DOCX only
- Messages trigger notification within 1 minute (per FR-029)

---

### 9. Review

**Purpose**: Post-booking feedback from owners about sitters.

**Fields**:
- `Id` (Guid, PK): Unique identifier
- `BookingId` (Guid, FK → Booking): Associated booking
- `SitterId` (Guid, FK → PetSitter): Reviewed sitter
- `OwnerId` (Guid, FK → PetOwner): Reviewer
- `Rating` (int, 1-5): Star rating (per FR-031)
- `ReviewText` (string, max 500 chars, nullable): Written review (per FR-031)
- `SitterResponse` (string, max 500 chars, nullable): Sitter reply (per FR-035)
- `IsModerated` (bool): Content moderation flag
- `ModerationStatus` (enum: Approved, Flagged, Rejected): Moderation result
- `ModerationReason` (string, nullable): Reason if flagged/rejected
- `CreatedAt` (DateTime): Review submission
- `RespondedAt` (DateTime, nullable): Sitter response timestamp
- `UpdatedAt` (DateTime): Last update

**Relationships**:
- One-to-One with `Booking`
- Many-to-One with `PetSitter`
- Many-to-One with `PetOwner`

**Validation Rules**:
- Rating must be 1-5 (per FR-031)
- ReviewText max 500 characters (per FR-031)
- Can only submit 24 hours after booking start (per FR-034)
- Must submit within 7 days of booking end (per FR-034)
- Content moderation via Azure AI Content Safety (per FR-036)
- Sitter can respond once per review (per FR-035)
- Sitter response max 500 characters

**Content Moderation Rules** (per FR-036):
- Profanity → Flagged or Rejected
- Hate speech → Rejected
- Policy violations → Rejected
- Approved reviews appear immediately
- Flagged reviews shown but marked for manual review

---

## Aggregate Calculations

### Sitter Average Rating Calculation

Triggered after each new review:

```csharp
// Update PetSitter.AverageRating
var reviews = dbContext.Reviews.Where(r => r.SitterId == sitterId && r.ModerationStatus == Approved);
var avgRating = reviews.Average(r => r.Rating);
var totalReviews = reviews.Count();

sitter.AverageRating = avgRating;
sitter.TotalReviews = totalReviews;
```

### Sitter Response Time Calculation

Triggered after sitter responds to booking:

```csharp
// Update PetSitter.ResponseTimeMinutes
var responseMinutes = (int)(booking.AcceptedAt.Value - booking.CreatedAt).TotalMinutes;
sitter.ResponseTimeMinutes = CalculateMovingAverage(sitter.ResponseTimeMinutes, responseMinutes);
```

---

## Mock Data Synchronization Requirements

Per constitution, mock data must be synchronized across:

1. **Source of Truth**: `/data/*.json`
   - `sitters.json` → PetSitter entities
   - `pets.json` → PetProfile entities
   - `bookings.json` → Booking entities
   - `messages.json` → Message entities
   - `reviews.json` → Review entities

2. **Frontend Mock Data**: `frontend/src/data/*Data.ts`
   - Must match structure exactly
   - TypeScript interfaces mirror C# models

3. **Backend Seed Data**: `backend/Data/AppDbContext.cs`
   - SeedData method populates in-memory DB
   - Must match JSON structure

**Toggle Control**: `REACT_APP_USE_MOCK_DATA` (frontend), in-memory DB (backend)

---

## Index Strategy (Production Azure SQL)

```sql
-- Sitter search by location (per FR-001)
CREATE SPATIAL INDEX IX_PetSitter_Location ON PetSitter(Latitude, Longitude);

-- Booking lookups
CREATE INDEX IX_Booking_Owner ON Booking(OwnerId, Status);
CREATE INDEX IX_Booking_Sitter ON Booking(SitterId, Status);
CREATE INDEX IX_Booking_Dates ON Booking(StartDate, EndDate);

-- Message threads
CREATE INDEX IX_Message_Booking ON Message(BookingId, CreatedAt DESC);
CREATE INDEX IX_Message_Recipient ON Message(RecipientId, IsRead, CreatedAt DESC);

-- Review sorting
CREATE INDEX IX_Review_Sitter ON Review(SitterId, ModerationStatus, CreatedAt DESC);

-- Availability lookups
CREATE INDEX IX_SitterAvailability_Date ON SitterAvailability(SitterId, Date);
```

---

## Migration Plan

1. **Create EF Core Migrations**:
   ```bash
   dotnet ef migrations add InitialMarketplaceSchema --project backend
   ```

2. **Mock Data Expansion**:
   - Extend existing `/data/listing.json` or create new `/data/sitters.json`
   - Create new JSON files for pets, bookings, messages, reviews
   - Update frontend `*Data.ts` files to match
   - Update backend `AppDbContext.SeedData()` to match

3. **Production Database Setup**:
   - Aspire provisions Azure SQL via AppHost
   - Apply migrations on first production deploy
   - Seed with initial test data (3-5 sitters, 5-10 pets)

---

## Next Steps

1. Generate API contracts (Phase 1 continued)
2. Create quickstart guide (Phase 1 continued)
3. Update agent context (Phase 1 continued)
4. Generate tasks breakdown (Phase 2)
