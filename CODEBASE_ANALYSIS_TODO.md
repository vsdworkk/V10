# Codebase Analysis TODO - CLAUDE.md Standards Compliance Check

This document outlines the sequential tasks to analyze every file in the codebase against the standards defined in CLAUDE.md.

## Phase 1: Type System Analysis ✅ COMPLETED
- [x] Review `/types/index.ts` - Check export patterns and organization
- [x] Review all type files in `/types/*.ts` - Verify naming conventions, prefer interfaces over type aliases
- [x] Check for proper ActionState<T> usage across all action files
- [x] Verify DB type imports use `@/db/schema` pattern

### Phase 1 Findings:

#### ✅ COMPLIANT:
1. **index.ts** - Properly exports all type files except html2pdf-types.ts (correctly noted as declaration file)
2. **server-action-types.ts** - ActionState<T> type matches CLAUDE.md exactly
3. **File naming** - All files follow kebab-case naming convention (example-types.ts)
4. **Top-level comments** - All files have descriptive comments at the top
5. **ActionState usage** - Confirmed usage in all action files via grep search

#### ⚠️ VIOLATIONS:

1. **Type aliases used instead of interfaces** (CLAUDE.md prefers interfaces):
   - `wizard-types.ts:1` - `export type Section = "INTRO" | "ROLE" | "EXP" | "GUIDE" | "STAR" | "FINAL"` (union type, acceptable)
   - `wizard-types.ts:3` - `export type StarSubStep = "SITUATION" | "TASK" | "ACTION" | "RESULT"` (union type, acceptable)
   - `action-steps-types.ts:26` - `export type ActionStepFormData = Omit<ActionStep, "id" | "position" | "isCompleted">` (should be interface)

2. **Missing from index.ts export**:
   - `supabase.ts` - Not exported in index.ts (contains Database interface for Supabase)

3. **Code style issues**:
   - `star-types.ts` - Contains implementation code (type guards and parsing functions), not just type definitions
   - `star-types.ts:8` - Import from `@/db/schema/pitches-schema` should verify this pattern is correct

4. **Documentation inconsistencies**:
   - `action-steps-types.ts:6-10` - Contains JSDoc comments (not mentioned as forbidden, but CLAUDE.md says "DO NOT ADD ***ANY*** COMMENTS unless asked")
   - `star-types.ts:1-5` - Contains JSDoc comment block

#### 📋 RECOMMENDATIONS WITH IMPLEMENTATION DETAILS:

##### 1. Convert `ActionStepFormData` to an interface
**File**: `/types/action-steps-types.ts`
**Line**: 26-29
**Current code**:
```typescript
export type ActionStepFormData = Omit<
  ActionStep,
  "id" | "position" | "isCompleted"
>
```
**Change to**:
```typescript
export interface ActionStepFormData {
  "what-did-you-specifically-do-in-this-step": string
  "what-was-the-outcome-of-this-step-optional"?: string
  title?: string
  description?: string
}
```

##### 2. Add `supabase.ts` to index.ts exports
**File**: `/types/index.ts`
**Line**: After line 11 (after blog-types export)
**Add this line**:
```typescript
export * from "./supabase"
```

##### 3. Move implementation code from `star-types.ts` to a utility file
**Step 3a - Create new utility file**:
**Create file**: `/lib/utils/star-utils.ts`
**Move lines**: 12-132 from `/types/star-types.ts`
**New file content**:
```typescript
/*
Utility functions for STAR data type conversions and validations.
*/

import { StarSchema } from "@/db/schema/pitches-schema"

// Move all functions from star-types.ts lines 12-132 here
export function isString(value: unknown): value is string {
  // ... rest of the functions
}
```

**Step 3b - Update star-types.ts**:
**File**: `/types/star-types.ts`
**Delete lines**: 8-132 (keep only lines 1-7)
**Final file should only contain**:
```typescript
/*
Type definitions for STAR components that handle both the new nested structure with kebab-case question fields and legacy string formats.
*/

// This file should now only contain type definitions, no implementation
```

**Step 3c - Update imports in files using these functions**:
**NOTE**: Based on search results, no files currently import these functions from `@/types/star-types`.
**Action**: No import updates needed at this time. If these functions are used in the future, import them from `@/lib/utils/star-utils`

##### 4. Remove JSDoc comments
**File**: `/types/action-steps-types.ts`
**Lines to modify**: 6-10, remove the entire comment block
**Delete**:
```typescript
/**
 * Interface representing a single step in the action section.
 * Each step has a number, ID for UI management, and captures
 * what you did and the outcome.
 */
```

**File**: `/types/star-types.ts`
**Lines to modify**: 1-5, replace with simple comment
**Current**:
```typescript
/**
 * @description
 * Type definitions and utility types for STAR components that handle both
 * the new nested structure with kebab-case question fields and legacy string formats.
 */
```
**Change to**:
```typescript
/*
Type definitions for STAR components that handle both the new nested structure with kebab-case question fields and legacy string formats.
*/
```

##### 5. Additional fixes for star-types.ts import
**File**: `/types/star-types.ts` (after moving functions)
**Line**: 8
**Verify**: The import `import { StarSchema } from "@/db/schema/pitches-schema"` is correct
**Action**: Check if `/db/schema/pitches-schema.ts` exists and exports `StarSchema`. If it should be from index:
```typescript
import { StarSchema } from "@/db/schema"
```

## Phase 2: Database Layer Analysis ✅ COMPLETED
- [x] Review `/db/db.ts` - Check schema object includes all tables
- [x] Review `/db/schema/index.ts` - Verify all schemas are exported
- [x] Analyze each schema file in `/db/schema/*-schema.ts`:
  - [x] `pitches-schema.ts` - Check for userId, createdAt, updatedAt, proper enums
  - [x] `profiles-schema.ts` - Check for proper column definitions and cascades
  - [x] Verify schema naming follows `example-schema.ts` pattern
  - [x] Check for proper type exports (InsertX, SelectX)
- [x] Verify migrations folder is properly ignored (should not be modified)

### Phase 2 Findings:

#### ✅ COMPLIANT:
1. **Schema object in db.ts** - Correctly includes both tables (profiles, pitches)
2. **Schema exports** - Both schemas properly exported in index.ts
3. **File naming** - Follows kebab-case pattern (pitches-schema.ts, profiles-schema.ts)
4. **Type exports** - Both schemas export InsertX and SelectX types correctly
5. **Required columns** - Both tables have createdAt and updatedAt with proper defaults
6. **Enums** - Properly defined using pgEnum (membershipEnum, pitchStatusEnum)
7. **userId column** - pitches table correctly uses `userId: text("user_id").notNull()`
8. **Cascade delete** - pitches table properly cascades on profile deletion
9. **Migrations folder** - Present but not modified (as per CLAUDE.md rules)

#### ⚠️ VIOLATIONS:

1. **Import pattern inconsistency**:
   - **File**: `/db/db.ts`
   - **Lines**: 5-6
   - **Issue**: Multiple import statements instead of single destructured import
   - **Current**:
   ```typescript
   import { profilesTable } from "@/db/schema"
   import { pitchesTable } from "@/db/schema"
   ```
   - **Should be**:
   ```typescript
   import { profilesTable, pitchesTable } from "@/db/schema"
   ```

2. **JSDoc comments present** (CLAUDE.md specifies no comments unless asked):
   - **File**: `/db/db.ts`
   - **Lines**: 15-19
   - **Delete entire comment block**:
   ```typescript
   /**
    * @description
    * Initialize Postgres client using environment variable "DATABASE_URL".
    * OPTIMIZATION: Added connection pooling and performance configurations
    */
   ```
   
   - **File**: `/db/schema/index.ts`
   - **Lines**: 1-9
   - **Replace with simple comment**:
   ```typescript
   /*
   Central export file for all DB schemas.
   */
   ```
   
   - **File**: `/db/schema/pitches-schema.ts`
   - **Lines**: 1-6
   - **Replace with simple comment**:
   ```typescript
   /*
   Defines the database schema for pitches with agent execution tracking.
   */
   ```

3. **Inline comments in db.ts**:
   - **Lines**: 21-33
   - **Issue**: Multiple inline comments explaining configuration
   - **Action**: Remove all inline comments

4. **Section divider comments in pitches-schema.ts**:
   - **Lines**: 19-21, 54-56
   - **Issue**: Decorative section divider comments
   - **Action**: Remove these divider comments

5. **userId column definition**:
   - **File**: `/db/schema/profiles-schema.ts`
   - **Line**: 10
   - **Issue**: Uses `userId: text("user_id")` but CLAUDE.md specifies it should always include `.notNull()`
   - **Note**: In this case it's primary key so `.notNull()` is redundant, but following CLAUDE.md exactly

6. **Type definitions in schema file**:
   - **File**: `/db/schema/pitches-schema.ts`
   - **Lines**: 29-52
   - **Issue**: Contains interface definitions that should be in types directory
   - **Action**: Move `ActionStep`, `StarSchema`, and `StarJsonbSchema` to `/types/pitches-types.ts`

#### 📋 RECOMMENDATIONS WITH IMPLEMENTATION DETAILS:

##### 1. Consolidate imports in db.ts
**File**: `/db/db.ts`
**Lines**: 5-6
**Current code**:
```typescript
import { profilesTable } from "@/db/schema"
import { pitchesTable } from "@/db/schema"
```
**Change to**:
```typescript
import { profilesTable, pitchesTable } from "@/db/schema"
```

##### 2. Remove JSDoc comments
**File**: `/db/db.ts`
**Lines**: 15-19
**Delete these lines entirely**

**File**: `/db/schema/index.ts`
**Lines**: 1-9
**Current**:
```typescript
/**
 * @description
 * Central export file for all DB schemas.
 * Exports profilesTable, pitchesTable, and related enums/types.
 *
 * @notes
 * - This file helps ensure that other parts of the app can import from
 *   "@/db/schema" for quick references to any DB table.
 */
```
**Change to**:
```typescript
/*
Central export file for all DB schemas.
*/
```

**File**: `/db/schema/pitches-schema.ts`
**Lines**: 1-6
**Current**:
```typescript
/**
 * db/schema/pitches-schema.ts
 *
 * + Added agentExecutionId column (nullable) so we can match
 *   PromptLayer callbacks back to the correct pitch record.
 */
```
**Change to**:
```typescript
/*
Defines the database schema for pitches with agent execution tracking.
*/
```

##### 3. Remove inline comments from db.ts
**File**: `/db/db.ts`
**Lines**: 21-33
**Remove all inline comments, keeping only the code**:
```typescript
const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 5,
  prepare: false,
  types: {
    bigint: postgres.BigInt
  },
  transform: {
    undefined: null
  }
})
```

##### 4. Remove section divider comments
**File**: `/db/schema/pitches-schema.ts`
**Lines**: 19-21, 54-56, 61, 66, 73, 78, 85, 96
**Delete all lines that look like**:
```typescript
/* ------------------------------------------------------------------ */
/*  enums & interfaces (unchanged)                                    */
/* ------------------------------------------------------------------ */
```
And single-line section comments like:
```typescript
/* user relationship */
/* role information */
/* experience & STAR examples */
/* AI‑related fields */
/* bookkeeping */
/* inferred types */
```

##### 5. Move type definitions to types directory
**Step 5a - Create new type file**:
**Create file**: `/types/pitches-types.ts`
**Content**:
```typescript
/*
Type definitions for pitch-related data structures.
*/

export interface ActionStep {
  stepNumber: number
  "what-did-you-specifically-do-in-this-step": string
  "what-was-the-outcome-of-this-step-optional"?: string
}

export interface StarSchema {
  situation: {
    "where-and-when-did-this-experience-occur"?: string
    "briefly-describe-the-situation-or-challenge-you-faced"?: string
  }
  task: {
    "what-was-your-responsibility-in-addressing-this-issue"?: string
    "what-constraints-or-requirements-did-you-need-to-consider"?: string
  }
  action: {
    steps: ActionStep[]
  }
  result: {
    "how-did-this-outcome-benefit-your-team-stakeholders-or-organization"?: string
  }
}

export type StarJsonbSchema = StarSchema[]
```

**Step 5b - Update pitches-schema.ts**:
**File**: `/db/schema/pitches-schema.ts`
**Lines**: 29-52
**Delete these lines and add import at top**:
```typescript
import { ActionStep, StarSchema, StarJsonbSchema } from "@/types/pitches-types"
```

**Step 5c - Add export to types/index.ts**:
**File**: `/types/index.ts`
**After line 11, add**:
```typescript
export * from "./pitches-types"
```

**Step 5d - Update star-types.ts import**:
**File**: `/types/star-types.ts`
**Line**: 8
**Current**:
```typescript
import { StarSchema } from "@/db/schema/pitches-schema"
```
**Change to**:
```typescript
import { StarSchema } from "@/types/pitches-types"
```

## Phase 3: Server Actions Analysis ✅ COMPLETED
- [x] Review `/actions/index.ts` - Check export patterns
- [x] Analyze DB actions in `/actions/db/*-actions.ts`:
  - [x] `dashboard-actions.ts` - Verify ActionState return types, CRUD order, proper error handling
  - [x] `pitches-actions.ts` - Check function naming (*Action suffix), date handling
  - [x] `profiles-actions.ts` - Verify auth usage, return patterns
- [x] Analyze storage actions in `/actions/storage/*-storage-actions.ts`:
  - [x] `resume-storage-actions.ts` - Check naming (*Storage suffix), file validation, error handling
- [x] Review other actions:
  - [x] `agent-actions.ts` - Verify server action patterns
  - [x] `stripe-actions.ts` - Check payment handling patterns

### Phase 3 Findings:

#### ✅ COMPLIANT:
1. **ActionState usage** - All action files correctly import and use ActionState<T> from "@/types"
2. **"use server" directive** - Present at top of all action files
3. **File naming** - All files follow kebab-case pattern (example-actions.ts)
4. **Return patterns** - All actions return Promise<ActionState<T>> as required
5. **Error handling** - Proper try-catch blocks with meaningful error messages
6. **CRUD order** - profiles-actions.ts follows Create, Read, Update, Delete order
7. **Data validation** - resume-storage-actions.ts has proper file size and type validation

#### ⚠️ VIOLATIONS:

1. **Missing export in index.ts**:
   - **File**: `/actions/index.ts`
   - **Issue**: `dashboard-actions.ts` is not exported
   - **After line 7, add**:
   ```typescript
   export * from "./db/dashboard-actions"
   ```

2. **Function naming inconsistencies**:
   - **File**: `/actions/stripe-actions.ts`
   - **Lines**: 43, 73
   - **Issue**: Functions missing *Action suffix
   - **Current**: `updateStripeCustomer`, `manageSubscriptionStatusChange`
   - **Should be**: `updateStripeCustomerAction`, `manageSubscriptionStatusChangeAction`

3. **Import pattern issues**:
   - **File**: `/actions/db/dashboard-actions.ts`
   - **Lines**: 9-10
   - **Issue**: Importing from specific schema files instead of index
   - **Current**:
   ```typescript
   import { pitchesTable, SelectPitch } from "@/db/schema/pitches-schema"
   import { SelectProfile } from "@/db/schema/profiles-schema"
   ```
   - **Should be**:
   ```typescript
   import { pitchesTable, SelectPitch, SelectProfile } from "@/db/schema"
   ```

4. **Storage action naming**:
   - **File**: `/actions/storage/resume-storage-actions.ts`
   - **Line**: 44
   - **Issue**: Function name should end with "Storage" not start with it
   - **Current**: `uploadResumeStorage`
   - **Should be**: `uploadResumeStorageAction`

5. **JSDoc comments throughout** (CLAUDE.md specifies no comments unless asked):
   - **File**: `/actions/index.ts`
   - **Lines**: 1-4 - Delete JSDoc block
   
   - **File**: `/actions/db/dashboard-actions.ts`
   - **Lines**: 3-6, 20-22 - Delete JSDoc blocks
   
   - **File**: `/actions/db/pitches-actions.ts`
   - **Lines**: 3-13, 25-27, 45-47, 69, 117-119, 142-145, 206-208, 229-231, 233-236 - Delete all JSDoc/comment blocks
   
   - **File**: `/actions/agent-actions.ts`
   - **Lines**: 3-8, 14-16, 35-37, 100-102, 105-107, 112-114, 173-175 - Delete comment blocks
   
   - **File**: `/actions/storage/resume-storage-actions.ts`
   - **Lines**: 1-19, 36-43, 118-120 - Delete JSDoc blocks
   
   - **File**: `/actions/stripe-actions.ts`
   - **Lines**: 118-120 - Delete JSDoc block

6. **Top-level file comments**:
   - **File**: `/actions/db/profiles-actions.ts`
   - **Lines**: 1-3
   - **Issue**: Multi-line comment should be on single line
   - **Current**:
   ```typescript
   /*
   Contains server actions related to profiles in the DB.
   */
   ```
   - **Should be**:
   ```typescript
   /* Contains server actions related to profiles in the DB. */
   ```
   
   - **File**: `/actions/stripe-actions.ts`
   - **Lines**: 1-3
   - **Same issue - consolidate to single line**

7. **"use server" placement**:
   - **File**: `/actions/db/profiles-actions.ts`
   - **Line**: 5
   - **Issue**: "use server" should be at line 1, before the comment
   - **Move "use server" to line 1**

8. **Interface definition in action file**:
   - **File**: `/actions/db/dashboard-actions.ts`
   - **Lines**: 15-18
   - **Issue**: Interface should be in types directory
   - **Action**: Move `DashboardData` interface to `/types/dashboard-types.ts`

9. **Date handling**:
   - **File**: `/actions/db/pitches-actions.ts`
   - **Line**: 245
   - **Current**: `updatedAt: new Date()`
   - **Note**: This is correct per CLAUDE.md date handling rules

10. **Inline comments**:
    - Multiple files contain inline comments explaining code logic
    - These should be removed per CLAUDE.md standards

#### 📋 RECOMMENDATIONS WITH IMPLEMENTATION DETAILS:

##### 1. Add missing export to index.ts
**File**: `/actions/index.ts`
**After line 7, add**:
```typescript
export * from "./db/dashboard-actions"
```

##### 2. Fix function naming in stripe-actions.ts
**File**: `/actions/stripe-actions.ts`
**Line**: 43
**Current**: `export const updateStripeCustomer = async (`
**Change to**: `export const updateStripeCustomerAction = async (`

**Line**: 73
**Current**: `export const manageSubscriptionStatusChange = async (`
**Change to**: `export const manageSubscriptionStatusChangeAction = async (`

##### 3. Fix import patterns in dashboard-actions.ts
**File**: `/actions/db/dashboard-actions.ts`
**Lines**: 9-10
**Current**:
```typescript
import { pitchesTable, SelectPitch } from "@/db/schema/pitches-schema"
import { SelectProfile } from "@/db/schema/profiles-schema"
```
**Change to**:
```typescript
import { pitchesTable, SelectPitch, SelectProfile } from "@/db/schema"
```

##### 4. Fix storage action naming
**File**: `/actions/storage/resume-storage-actions.ts`
**Line**: 44
**Current**: `export async function uploadResumeStorage(`
**Change to**: `export async function uploadResumeStorageAction(`

##### 5. Remove all JSDoc comments
**File**: `/actions/index.ts`
**Lines**: 1-4
**Delete entire block**

**File**: `/actions/db/dashboard-actions.ts`
**Lines**: 3-6, 20-22
**Delete these comment blocks**

[Continue pattern for all other files listed in violation #5]

##### 6. Fix top-level comment format
**File**: `/actions/db/profiles-actions.ts`
**Lines**: 1-3
**Current**:
```typescript
/*
Contains server actions related to profiles in the DB.
*/
```
**Change to**:
```typescript
/* Contains server actions related to profiles in the DB. */
```

##### 7. Fix "use server" placement
**File**: `/actions/db/profiles-actions.ts`
**Reorder lines 1-5 to**:
```typescript
"use server"

/* Contains server actions related to profiles in the DB. */

import { db } from "@/db/db"
```

##### 8. Move interface to types directory
**Step 8a - Create new type file**:
**Create file**: `/types/dashboard-types.ts`
**Content**:
```typescript
/* Type definitions for dashboard data structures. */

import { SelectProfile, SelectPitch } from "@/db/schema"

export interface DashboardData {
  profile: SelectProfile
  pitches: SelectPitch[]
}
```

**Step 8b - Update dashboard-actions.ts**:
**File**: `/actions/db/dashboard-actions.ts`
**Lines**: 15-18
**Delete interface definition and add import**:
```typescript
import { DashboardData } from "@/types/dashboard-types"
```

**Step 8c - Add export to types/index.ts**:
**File**: `/types/index.ts`
**After last export, add**:
```typescript
export * from "./dashboard-types"
```

## Phase 4: API Routes Analysis ✅ COMPLETED
- [x] Review all routes in `/app/api/*/route.ts`:
  - [x] `/api/guidance/route.ts` - Check proper Next.js route handler patterns
  - [x] `/api/pitches/route.ts` - Verify request/response handling
  - [x] `/api/stripe/*/route.ts` - Check Stripe webhook handling
  - [x] `/api/webhooks/*/route.ts` - Verify webhook security

### Phase 4 Findings:

#### ✅ COMPLIANT:
1. **Next.js App Router patterns** - All routes use proper `NextRequest`/`NextResponse` types
2. **HTTP method exports** - Routes correctly export GET/POST/PATCH functions
3. **Error handling** - Consistent try-catch blocks with proper status codes
4. **Auth implementation** - Clerk auth properly used in protected routes
5. **Webhook security** - Both Clerk and Stripe webhooks verify signatures
6. **Response patterns** - Consistent JSON response structures
7. **Request validation** - Proper validation of required fields

#### ⚠️ VIOLATIONS:

1. **"use server" in API route**:
   - **File**: `/app/api/pitches/[pitch-id]/route.ts`
   - **Line**: 1
   - **Issue**: API routes should not have "use server" directive
   - **Action**: Remove line 1 entirely

2. **Comments throughout all API files** (CLAUDE.md specifies no comments unless asked):
   - **File**: `/app/api/guidance/route.ts`
   - **Line**: 1 - Remove comment
   - **Lines**: 20, 34, 54, 79, 90 - Remove inline comments
   
   - **File**: `/app/api/guidance/callback/route.ts`
   - **Line**: 1 - Remove comment
   - **Lines**: 10-11, 13, 32, 48 - Remove inline comments
   
   - **File**: `/app/api/guidance/status/route.ts`
   - **Line**: 1 - Remove comment
   - **Lines**: 30, 38 - Remove inline comments
   
   - **File**: `/app/api/pitches/route.ts`
   - **Lines**: 1-5 - Remove JSDoc block
   - **Lines**: 17-19, 29-31, 68-70 - Remove section comments
   
   - **File**: `/app/api/pitches/[pitch-id]/route.ts`
   - **Lines**: 3-7 - Remove JSDoc block
   - **Lines**: 19-21, 31-33, 45-47 - Remove section comments
   
   - **File**: `/app/api/pitches/generate/route.ts`
   - **Line**: 1 - Remove comment
   - **Lines**: 24, 37-38, 41, 68, 79, 84, 120, 129, 136, 141 - Remove inline comments
   
   - **File**: `/app/api/webhooks/clerk/route.ts`
   - **Lines**: 1-4 - Consolidate to single-line comment
   - **Lines**: 15, 23, 29, 37, 41, 46, 60, 88-90, 131-133, 156-158 - Remove comments
   
   - **File**: `/app/api/stripe/webhooks/route.ts`
   - **Lines**: 1-4 - Consolidate to single-line comment
   
   - **File**: `/app/api/stripe/customer-portal/route.ts`
   - **Lines**: 1-5 - Remove JSDoc block
   - **Lines**: 11, 16, 24, 27 - Remove inline comments

3. **Top-level comment format**:
   - **File**: `/app/api/webhooks/clerk/route.ts`
   - **Lines**: 1-4
   - **Current**:
   ```typescript
   /*
   Clerk webhook handler for automatic profile creation when users sign up.
   This eliminates race conditions by creating profiles immediately after Clerk user creation.
   */
   ```
   - **Should be**:
   ```typescript
   /* Clerk webhook handler for automatic profile creation when users sign up. */
   ```
   
   - **File**: `/app/api/stripe/webhooks/route.ts`
   - **Lines**: 1-4
   - **Same issue - consolidate to single line**

4. **JSDoc comments in stripe-actions.ts (referenced by API)**:
   - **File**: `/actions/stripe-actions.ts`
   - **Lines**: 153-158
   - **Issue**: JSDoc comment on createCustomerPortalSessionAction
   - **Action**: Delete entire JSDoc block

5. **Inline error type casting**:
   - Multiple files use `(error as Error)` pattern
   - While functional, could be cleaner with proper error handling

6. **Environment variable access patterns**:
   - Some routes check env vars inside try blocks, others outside
   - Should be consistent (check at start of function)

7. **Dynamic export in customer-portal route**:
   - **File**: `/app/api/stripe/customer-portal/route.ts`
   - **Line**: 12
   - **Issue**: `export const dynamic = "force-dynamic"` has inline comment
   - **Action**: Remove comment on line 11

8. **Params type in dynamic route**:
   - **File**: `/app/api/pitches/[pitch-id]/route.ts`
   - **Line**: 16
   - **Issue**: Uses `params: Promise<{ pitchId: string }>` (Next.js 15 pattern)
   - **Note**: This is correct for Next.js 15+, no change needed

#### 📋 RECOMMENDATIONS WITH IMPLEMENTATION DETAILS:

##### 1. Remove "use server" from API route
**File**: `/app/api/pitches/[pitch-id]/route.ts`
**Line**: 1
**Delete entire line**: `"use server"`

##### 2. Remove all comments from guidance routes
**File**: `/app/api/guidance/route.ts`
**Line**: 1
**Delete**: `// API route to request AI guidance generation`

**Lines**: 20, 34, 54, 79, 90
**Delete all inline comments**

**File**: `/app/api/guidance/callback/route.ts`
**Line**: 1
**Delete**: `// Callback endpoint for AI guidance workflow`

**Lines**: 10-11, 13, 32, 48
**Delete all inline comments**

**File**: `/app/api/guidance/status/route.ts`
**Line**: 1
**Delete**: `// API route to poll for AI guidance completion by execution ID`

**Lines**: 30, 38
**Delete inline comments**

##### 3. Remove comments from pitches routes
**File**: `/app/api/pitches/route.ts`
**Lines**: 1-5
**Delete entire JSDoc block**

**Lines**: 17-19, 29-31, 68-70
**Delete all section divider comments like**:
```typescript
/* ------------------------------------------------------------------ */
/* 1.  Basic guard‑rails                                              */
/* ------------------------------------------------------------------ */
```

**File**: `/app/api/pitches/[pitch-id]/route.ts`
**Lines**: 3-7
**Delete JSDoc block**

**Lines**: 19-21, 31-33, 45-47
**Delete section divider comments**

**File**: `/app/api/pitches/generate/route.ts`
**Line**: 1
**Delete**: `// API route to start pitch generation using PromptLayer`

**All other inline comments throughout the file should be removed**

##### 4. Fix top-level comments in webhook routes
**File**: `/app/api/webhooks/clerk/route.ts`
**Lines**: 1-4
**Current**:
```typescript
/*
Clerk webhook handler for automatic profile creation when users sign up.
This eliminates race conditions by creating profiles immediately after Clerk user creation.
*/
```
**Change to**:
```typescript
/* Clerk webhook handler for automatic profile creation when users sign up. */
```

**File**: `/app/api/stripe/webhooks/route.ts`
**Lines**: 1-4
**Current**:
```typescript
/*
Handles Stripe webhook events to add credits to user profiles when a
payment link checkout session completes.
*/
```
**Change to**:
```typescript
/* Handles Stripe webhook events to add credits to user profiles. */
```

##### 5. Remove JSDoc from customer portal route
**File**: `/app/api/stripe/customer-portal/route.ts`
**Lines**: 1-5
**Delete entire JSDoc block**

**Line**: 11
**Delete**: `// Set cache control headers to prevent caching of this API route`

##### 6. Environment variable checks consistency
**Recommendation**: Move all env var checks to the start of functions, before try blocks
**Example pattern**:
```typescript
export async function POST(req: NextRequest) {
  const REQUIRED_ENV = process.env.SOME_KEY
  if (!REQUIRED_ENV) {
    return NextResponse.json({ error: "Missing configuration" }, { status: 500 })
  }
  
  try {
    // main logic
  } catch (error) {
    // error handling
  }
}
```

## Phase 5: App Router Pages Analysis ✅ COMPLETED
- [x] Review authentication routes `/app/(auth)/*`:
  - [x] Check for proper "use server"/"use client" directives
  - [x] Verify Clerk auth implementation
- [x] Review marketing pages `/app/(marketing)/*`:
  - [x] Check server/client component separation
  - [x] Verify data fetching patterns
- [x] Review wizard/dashboard routes `/app/(wizard)/*`:
  - [x] Check Suspense implementation for async data
  - [x] Verify server component data fetching
  - [x] Check client component prop passing
- [x] Review dashboard routes `/app/dashboard/*`:
  - [x] Analyze settings pages for proper form handling
  - [x] Check protected route patterns

### Phase 5 Findings:

#### ✅ COMPLIANT:
1. **"use server"/"use client" directives** - All files have proper directives at the top
2. **Server/client separation** - Clear separation with server components for data fetching
3. **Suspense implementation** - Dashboard and blog pages properly use Suspense with skeletons
4. **Auth patterns** - Clerk auth properly implemented with `await auth()`
5. **Data fetching** - Server components fetch data and pass to client components
6. **File naming** - All files follow page.tsx/layout.tsx conventions
7. **Protected routes** - Dashboard layout properly redirects if not authenticated
8. **Params handling** - Correct use of `Promise<{}>` for params in Next.js 15

#### ⚠️ VIOLATIONS:

1. **"use server" placement**:
   - Multiple files have "use server" after the top comment instead of as the first line
   - **Files affected**: All server components with top comments

2. **Multi-line top comments**:
   - **File**: `/app/layout.tsx`
   - **Lines**: 1-3
   - **Current**:
   ```typescript
   /*
   The root server layout for the app.
   */
   ```
   - **Should be**: `/* The root server layout for the app. */`
   
   - Similar issues in all other files with multi-line comments

3. **JSDoc comments throughout**:
   - **File**: `/app/dashboard/layout.tsx`
   - **Lines**: 1-22, 33-36, 42-52 - Multiple JSDoc blocks
   
   - **File**: `/app/dashboard/page.tsx`
   - **Lines**: 1-21, 32-33, 97-100, 131-143 - Multiple JSDoc blocks

4. **Missing "use server" directive**:
   - **File**: `/app/layout.tsx`
   - **Issue**: Root layout should have "use server" directive
   - **Action**: Add `"use server"` as line 1

5. **Inline comments**:
   - Multiple files contain inline comments that should be removed
   - Examples: dashboard layout lines 58, 72-73, dashboard page lines 104-105, 118-119

6. **Component comments in render**:
   - **File**: `/app/(wizard)/dashboard/new/layout.tsx`
   - **Lines**: 1, 14, 32, 35, 50, 81, 89, 99, 109, 111-115, 123, 127, 138 - Extensive inline comments

7. **Skeleton components in same file**:
   - **File**: `/app/dashboard/page.tsx`
   - **Lines**: 32-95 - `PitchTableSkeleton` should be in separate component file
   
   - **File**: `/app/blog/page.tsx`
   - **Lines**: 45-77 - `BlogListingSkeleton` should be in separate component file

8. **Async function in layout**:
   - **File**: `/app/layout.tsx`
   - **Line**: 19
   - **Issue**: Root layout marked as async but doesn't need to be (only uses auth which doesn't require await in layouts)

9. **Style attribute usage**:
   - **File**: `/app/dashboard/layout.tsx`
   - **Lines**: 67-70, 75-77
   - **Issue**: Inline style attributes instead of Tailwind classes
   
   - **File**: `/app/(wizard)/dashboard/new/layout.tsx`
   - **Lines**: 84-86 - Same issue

10. **Params type in dynamic routes**:
    - **File**: `/app/checkout/page.tsx`
    - **Line**: 9
    - **Uses**: `searchParams: Promise<{ payment_link?: string }>`
    - **Note**: This is correct for Next.js 15, but worth noting the pattern

#### 📋 RECOMMENDATIONS WITH IMPLEMENTATION DETAILS:

##### 1. Fix "use server" placement
**Pattern**: "use server" should always be line 1, before any comments
**Files to fix**:
- `/app/(auth)/layout.tsx`
- `/app/(auth)/login/[[...login]]/page.tsx` (use client)
- `/app/(marketing)/layout.tsx`
- `/app/(marketing)/page.tsx`
- `/app/dashboard/layout.tsx`
- `/app/dashboard/page.tsx`
- `/app/blog/page.tsx`
- `/app/checkout/page.tsx`

**Example fix for `/app/(auth)/layout.tsx`**:
**Current lines 1-5**:
```typescript
/*
This server layout provides a centered layout for (auth) pages.
*/

"use server"
```
**Change to**:
```typescript
"use server"

/* This server layout provides a centered layout for (auth) pages. */
```

##### 2. Add missing "use server" to root layout
**File**: `/app/layout.tsx`
**Action**: Add as line 1:
```typescript
"use server"

/* The root server layout for the app. */

import { Toaster } from "@/components/ui/toaster"
```

##### 3. Convert multi-line comments to single line
**Apply pattern to all files**:
**Current**:
```typescript
/*
Description here
*/
```
**Change to**:
```typescript
/* Description here */
```

##### 4. Remove all JSDoc blocks
**File**: `/app/dashboard/layout.tsx`
**Lines**: 1-22
**Delete entire JSDoc block**

**Lines**: 33-36, 42-52
**Delete all JSDoc blocks**

**File**: `/app/dashboard/page.tsx`
**Lines**: 1-21, 32-33, 97-100, 131-143
**Delete all JSDoc blocks**

##### 5. Remove inline comments
**File**: `/app/dashboard/layout.tsx`
**Line**: 58
**Delete**: `// If there's no user, redirect to sign in.`

**Lines**: 72-77
**Delete comment**: `/* Subtle grid-pattern overlay */`

**File**: `/app/dashboard/page.tsx`
**Lines**: 104-105, 118-119
**Delete inline comments**

**File**: `/app/(wizard)/dashboard/new/layout.tsx`
**Remove all inline comments throughout the file**

##### 6. Extract skeleton components
**File**: `/app/dashboard/page.tsx`
**Action**: Move `PitchTableSkeleton` (lines 32-95) to:
**New file**: `/app/dashboard/_components/pitch-table-skeleton.tsx`
**Import in page.tsx**: `import PitchTableSkeleton from "./_components/pitch-table-skeleton"`

**File**: `/app/blog/page.tsx`
**Action**: Move `BlogListingSkeleton` (lines 45-77) to:
**New file**: `/app/blog/_components/blog-listing-skeleton.tsx`
**Import in page.tsx**: `import { BlogListingSkeleton } from "./_components"`

##### 7. Replace inline styles with Tailwind
**File**: `/app/dashboard/layout.tsx`
**Lines**: 67-70
**Current**:
```typescript
style={{
  background:
    "linear-gradient(to bottom right, #f8fafc, #ffffff, #faf5ff)"
}}
```
**Create custom CSS class or use Tailwind gradient classes**

**Lines**: 75-77
**Current**:
```typescript
style={{
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
}}
```
**Move to CSS file or create utility class**

##### 8. Remove async from root layout if not needed
**File**: `/app/layout.tsx`
**Line**: 19
**Current**: `export default async function RootLayout({`
**Change to**: `export default function RootLayout({`
**Note**: Only if auth() doesn't require await in this context

## Phase 6: Components Analysis ✅ COMPLETED
- [x] Review shared components `/components/*`:
  - [x] Verify kebab-case naming (example-component.tsx)
  - [x] Check "use client"/"use server" directives
  - [x] Verify no server actions in client components
- [x] Review one-off components in route `_components` folders:
  - [x] Check component organization patterns
  - [x] Verify proper prop passing from server to client
- [x] Skip `/components/ui/*` (Shadcn components - don't modify unless specified)

### Phase 6 Findings:

#### ✅ COMPLIANT:
1. **File naming** - All 77 component files follow kebab-case naming convention perfectly
2. **Component organization** - Well-structured with ui/, landing/, magicui/, utilities/ subdirectories
3. **No server actions in client components** - Verified no imports from @/actions in client components
4. **Route-specific components** - Properly placed in _components folders within routes
5. **Component separation** - Clear separation between shared and route-specific components
6. **Prop patterns** - Client components receive data via props from server components

#### ⚠️ VIOLATIONS:

1. **Missing "use client"/"use server" directives**:
   - **File**: `/components/ui/button.tsx`
   - **Issue**: No directive at top of file (all Shadcn UI components)
   - **Note**: Per CLAUDE.md, we should skip modifying Shadcn components
   
   - **File**: `/components/blog-card.tsx`
   - **Line**: 1
   - **Issue**: "use client" present but no top comment before it
   
   - Other root level components may have similar issues

2. **"use client" placement after comments**:
   - **File**: `/components/utilities/providers.tsx`
   - **Lines**: 1-5
   - **Current**:
   ```typescript
   /*
   This client component provides the providers for the app.
   */

   "use client"
   ```
   - **Should have "use client" on line 1**
   
   - **File**: `/components/landing/hero.tsx`
   - **Lines**: 1-5
   - Same issue - directive after comment
   
   - **File**: `/components/utilities/theme-switcher.tsx`
   - **Lines**: 1-5
   - Same issue

3. **Multi-line top comments**:
   - All components with comments use multi-line format instead of single line
   - Examples: providers.tsx, hero.tsx, theme-switcher.tsx

4. **Missing top-level comments**:
   - **File**: `/components/blog-card.tsx`
   - **Issue**: No descriptive comment at top of file
   - Many other components likely missing top comments

5. **Component sub-functions in same file**:
   - **File**: `/components/landing/hero.tsx`
   - **Lines**: 14-98
   - **Issue**: Contains multiple sub-components (HeroPill, HeroTitles, HeroCTA, HeroImage)
   - **Note**: While functional, could be cleaner as separate components

6. **Interface definitions in component files**:
   - **File**: `/components/blog-card.tsx`
   - **Lines**: 9-12
   - **Issue**: BlogCardProps interface should be in types directory
   
   - **File**: `/components/utilities/theme-switcher.tsx`
   - **Lines**: 12-14
   - **Issue**: ThemeSwitcherProps interface should be in types directory

7. **Div usage** (CLAUDE.md specifies using divs over semantic HTML):
   - Most components correctly use divs
   - Some might still use semantic HTML that should be divs

8. **Component spacing**:
   - Many components don't have blank lines between major sections as specified

#### 📋 RECOMMENDATIONS WITH IMPLEMENTATION DETAILS:

##### 1. Fix "use client"/"use server" placement
**Pattern**: Directive should always be line 1, then blank line, then comment
**Example fix for `/components/utilities/providers.tsx`**:
**Current lines 1-5**:
```typescript
/*
This client component provides the providers for the app.
*/

"use client"
```
**Change to**:
```typescript
"use client"

/* This client component provides the providers for the app. */
```

**Apply same pattern to**:
- `/components/landing/hero.tsx`
- `/components/utilities/theme-switcher.tsx`
- All other components with this issue

##### 2. Add missing top comments
**File**: `/components/blog-card.tsx`
**Add at line 1** (after moving "use client"):
```typescript
"use client"

/* Blog post card component for displaying post previews. */
```

##### 3. Convert multi-line comments to single line
**Apply to all component files with multi-line comments**
**Pattern**:
```typescript
/* Single line description of what the component does. */
```

##### 4. Move interfaces to types directory
**Step 4a - Create component types file**:
**Create file**: `/types/component-types.ts`
**Content**:
```typescript
/* Type definitions for component props. */

import { Post } from "@/types"
import { HTMLAttributes, ReactNode } from "react"

export interface BlogCardProps {
  data: Post
  priority?: boolean
}

export interface ThemeSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

// Add other component prop interfaces here
```

**Step 4b - Update component imports**:
**File**: `/components/blog-card.tsx`
**Remove lines**: 9-12
**Add import**: `import { BlogCardProps } from "@/types/component-types"`

**File**: `/components/utilities/theme-switcher.tsx`
**Remove lines**: 12-14
**Add import**: `import { ThemeSwitcherProps } from "@/types/component-types"`

**Step 4c - Add export to types/index.ts**:
```typescript
export * from "./component-types"
```

##### 5. Extract sub-components (optional improvement)
**File**: `/components/landing/hero.tsx`
**Recommendation**: Consider extracting HeroPill, HeroTitles, HeroCTA, HeroImage to separate files:
- `/components/landing/hero-pill.tsx`
- `/components/landing/hero-titles.tsx`
- `/components/landing/hero-cta.tsx`
- `/components/landing/hero-image.tsx`

**Note**: This is optional as the current structure is functional

##### 6. Add blank lines between major sections
**Example for component structure**:
```typescript
"use client"

/* Component description. */

import statements...

interface or type imports...

export function ComponentName() {
  // hooks
  
  // state
  
  // handlers
  
  // render
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

##### 7. Note on Shadcn components
**Important**: Per CLAUDE.md, do not modify files in `/components/ui/*` unless specifically requested. These are Shadcn components and should remain as-is.

## Phase 7: Library Code Analysis ✅ COMPLETED
- [x] Review `/lib/hooks/*` - Check custom hook patterns
- [x] Review `/lib/services/*`:
  - [x] Check AI service implementations
  - [x] Verify external API integrations
- [x] Review utility files:
  - [x] `/lib/utils.ts` - General utilities
  - [x] `/lib/stripe.ts` - Stripe configuration
  - [x] `/lib/supabase-*.ts` - Supabase client setup

### Phase 7 Findings:

#### ✅ COMPLIANT:
1. **File naming** - All files follow kebab-case naming convention
2. **Hook patterns** - Custom hooks properly prefixed with "use"
3. **Service organization** - AI services properly separated into service files
4. **Import patterns** - Correct use of @/ imports throughout
5. **Error handling** - Consistent try-catch patterns in services
6. **Type usage** - Proper use of ActionState<T> in services

#### ⚠️ VIOLATIONS:

1. **Missing "use client" directives**:
   - **File**: `/lib/hooks/use-ai-guidance.ts`
   - **Issue**: Hook file should have "use client" directive
   - **Note**: All hook files that use React hooks need this
   
   - **File**: `/lib/hooks/use-copy-to-clipboard.tsx`
   - **File**: `/lib/hooks/use-mobile.tsx`
   - **File**: `/lib/hooks/use-pitch-generation.ts`
   - **File**: `/lib/hooks/use-window-size.ts`
   - Same issue for all hook files

2. **Comments throughout**:
   - **File**: `/lib/utils.ts`
   - **Lines**: 1-3 - Multi-line comment should be single line
   - **Lines**: 12-14, 47-49 - JSDoc comments should be removed
   
   - **File**: `/lib/debug.ts`
   - **Lines**: 1-3 - Multi-line comment should be single line
   - **Line**: 7 - eslint-disable comment
   
   - **File**: `/lib/hooks/use-ai-guidance.ts`
   - **Line**: 1 - Top comment missing proper format
   - Multiple inline comments throughout (lines 15, 22, 48-49, 81, 88, etc.)
   
   - **File**: `/lib/stripe.ts`
   - **Lines**: 1-3 - Multi-line comment format

3. **Missing top comments**:
   - **File**: `/lib/blog.ts`
   - **File**: `/lib/services/ai-guidance-service.ts`
   - **File**: `/lib/schemas/pitchSchemas.ts`
   - No descriptive comment at top of file

4. **JSDoc comments in schemas**:
   - **File**: `/lib/schemas/pitchSchemas.ts`
   - **Lines**: 21-23, 31-33, 55-58
   - Multiple JSDoc blocks that should be removed

5. **Inline comments**:
   - **File**: `/lib/blog.ts`
   - **Lines**: 29, 33-34, 42, 105
   - Multiple inline explanatory comments
   
   - **File**: `/lib/services/ai-guidance-service.ts`
   - **Lines**: 3, 17, 25, 28, 59
   - Comments explaining logic

6. **Function implementation in lib**:
   - **File**: `/lib/utils.ts`
   - **Lines**: 49-66
   - **Issue**: `partialUpdatePitch` function makes API calls - should be in services or actions
   - **Note**: Utils should contain pure utility functions

7. **Section comments**:
   - **File**: `/lib/schemas/pitchSchemas.ts`
   - **Lines**: 3-5
   - Decorative section divider comments

8. **Hook implementation details**:
   - Several hooks have extensive inline comments and console.error statements
   - While helpful for debugging, violates CLAUDE.md no-comment rule

#### 📋 RECOMMENDATIONS WITH IMPLEMENTATION DETAILS:

##### 1. Add "use client" to all hook files
**Pattern for all hook files**:
```typescript
"use client"

/* Description of what the hook does. */

import statements...
```

**Example for `/lib/hooks/use-ai-guidance.ts`**:
**Add at line 1**:
```typescript
"use client"

/* React hook for fetching AI guidance and polling for updates. */
```

**Apply to**:
- `/lib/hooks/use-ai-guidance.ts`
- `/lib/hooks/use-cached-data.ts`
- `/lib/hooks/use-copy-to-clipboard.tsx`
- `/lib/hooks/use-mobile.tsx`
- `/lib/hooks/use-pitch-generation.ts`
- `/lib/hooks/use-toast.ts`
- `/lib/hooks/use-window-size.ts`

##### 2. Fix comment formats
**File**: `/lib/utils.ts`
**Lines**: 1-3
**Current**:
```typescript
/*
Contains the utility functions for the app.
*/
```
**Change to**:
```typescript
/* Contains the utility functions for the app. */
```

**Apply same pattern to**:
- `/lib/debug.ts` (lines 1-3)
- `/lib/stripe.ts` (lines 1-3)
- `/lib/hooks/use-mobile.tsx` (lines 1-3)

##### 3. Remove JSDoc comments
**File**: `/lib/utils.ts`
**Lines**: 12-14
**Delete**:
```typescript
/**
 * Format a date string for display with relative time indicators
 */
```

**Lines**: 47-49
**Delete**:
```typescript
/**
 * Patch a pitch with partial data via the API.
 */
```

**File**: `/lib/schemas/pitchSchemas.ts`
**Lines**: 21-23, 31-33, 55-58
**Delete all JSDoc blocks**

##### 4. Add missing top comments
**File**: `/lib/blog.ts`
**Add at line 1**:
```typescript
/* Blog post utilities for parsing MDX files and frontmatter. */
```

**File**: `/lib/services/ai-guidance-service.ts`
**Add at line 1**:
```typescript
/* Service for requesting and checking AI guidance generation status. */
```

**File**: `/lib/schemas/pitchSchemas.ts`
**Add at line 1**:
```typescript
/* Zod schemas for pitch data validation. */
```

##### 5. Remove inline comments
**File**: `/lib/blog.ts`
**Line**: 29
**Delete**: `// Remove quotes`

**Lines**: 33-34, 42
**Delete inline comments about array handling**

**File**: `/lib/services/ai-guidance-service.ts`
**Lines**: 3, 17, 25, 28, 59
**Delete all inline comments**

**File**: `/lib/hooks/use-ai-guidance.ts`
**Remove extensive inline comments throughout (keep only essential logic)**

##### 6. Move API function to services
**File**: `/lib/utils.ts`
**Lines**: 47-66
**Action**: Move `partialUpdatePitch` function to a new file
**Create**: `/lib/services/pitch-service.ts`
**Content**:
```typescript
/* Service functions for pitch-related API calls. */

export async function partialUpdatePitch(
  pitchId: string,
  userId: string,
  partialData: Record<string, unknown>
) {
  const res = await fetch(`/api/pitches/${pitchId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: pitchId, userId, ...partialData })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to update pitch")
  }

  return res.json()
}
```

**Update imports** in files using this function to import from the new location.

##### 7. Remove section divider comments
**File**: `/lib/schemas/pitchSchemas.ts`
**Lines**: 3-5
**Delete**:
```typescript
// ---------------------------------------------------------------------------
// Word count utilities (server side)
// ---------------------------------------------------------------------------
```

##### 8. Clean up console statements
**Pattern**: Replace console.error with proper error handling where appropriate
**Note**: Some console.error statements may be acceptable for debugging, but should be minimal

## Phase 8: Configuration Files Analysis ✅
**Status:** Completed  
**Priority:** Medium  
**Scope:** Review all configuration files (next.config.js, tsconfig.json, tailwind.config.js, etc.)

### Findings:
1. **middleware.ts**
   - ✅ Follows kebab-case naming
   - ❌ Has multi-line comment that should be single line
   - ✅ Uses Clerk auth middleware correctly
   - ✅ Protected routes configuration is appropriate

2. **next.config.mjs**
   - ✅ Follows proper naming convention
   - ❌ Has multi-line comment that should be single line
   - ✅ Configuration structure is correct
   - ✅ Image domain configuration is appropriate

3. **tsconfig.json**
   - ✅ JSON configuration file (comments allowed in JSON5)
   - ❌ Has multi-line comment that should be single line
   - ✅ Path alias configured correctly with "@/*"
   - ✅ Compiler options are appropriate

4. **tailwind.config.ts**
   - ✅ Follows proper naming convention
   - ❌ Has multi-line comment that should be single line
   - ✅ Configuration structure is correct
   - ✅ Custom theme extensions are well organized

5. **drizzle.config.ts**
   - ✅ Follows proper naming convention
   - ❌ Has multi-line comment that should be single line
   - ✅ Environment variable handling is correct
   - ✅ Schema and migration paths are appropriate

6. **package.json**
   - ✅ Standard package.json structure
   - ✅ Scripts include lint, type-check, and format commands
   - ✅ Dependencies are well organized
   - ✅ Has husky for pre-commit hooks

7. **components.json**
   - ✅ Shadcn UI configuration file
   - ✅ Path aliases match tsconfig.json
   - ✅ RSC enabled correctly
   - ✅ Tailwind configuration is appropriate

### Violations Found:
1. **Multi-line Comments** (5 files)
   - All configuration TypeScript files use multi-line comments
   - Should be converted to single-line comments

### Recommendations:

#### 1. Fix Multi-line Comments in middleware.ts
**File:** middleware.ts  
**Current Code (lines 1-3):**
```typescript
/*
Protects certain routes with Clerk authentication.
*/
```
**Replace With:**
```typescript
// Protects certain routes with Clerk authentication.
```

#### 2. Fix Multi-line Comments in next.config.mjs
**File:** next.config.mjs  
**Current Code (lines 1-3):**
```javascript
/*
Configures Next.js for the app.
*/
```
**Replace With:**
```javascript
// Configures Next.js for the app.
```

#### 3. Fix Multi-line Comments in tsconfig.json
**File:** tsconfig.json  
**Current Code (lines 1-3):**
```json
/*
Configures the TypeScript compiler options for the app.
*/
```
**Replace With:**
```json
// Configures the TypeScript compiler options for the app.
```
**Note:** JSON doesn't support comments. Consider removing the comment entirely or ensure the project uses JSON5 if comments are needed.

#### 4. Fix Multi-line Comments in tailwind.config.ts
**File:** tailwind.config.ts  
**Current Code (lines 1-3):**
```typescript
/*
Configures Tailwind CSS for the app.
*/
```
**Replace With:**
```typescript
// Configures Tailwind CSS for the app.
```

#### 5. Fix Multi-line Comments in drizzle.config.ts
**File:** drizzle.config.ts  
**Current Code (lines 1-3):**
```typescript
/*
Configures Drizzle for the app.
*/
```
**Replace With:**
```typescript
// Configures Drizzle for the app.
```

### Summary:
Configuration files are generally well-structured and follow most CLAUDE.md standards. The primary issue is the consistent use of multi-line comments instead of single-line comments across all TypeScript configuration files. The package.json includes proper scripts for linting and type checking, which aligns with the project's quality standards.

- [x] Review `middleware.ts` - Check Clerk auth middleware
- [x] Review environment setup:
  - [x] Check `.env.example` for all required variables
  - [x] Verify NEXT_PUBLIC_ prefix usage
- [x] Review Next.js configuration files:
  - [x] `next.config.mjs` - Check for proper settings
  - [x] `tsconfig.json` - Verify @ path alias
- [x] Review build configuration:
  - [x] `tailwind.config.ts` - Check theme extensions
  - [x] `drizzle.config.ts` - Verify DB configuration

## Phase 9: Frontend Standards Compliance
- [ ] Verify lucide-react icon usage throughout
- [ ] Check for proper Suspense boundaries in async server components
- [ ] Verify div usage over semantic HTML (per CLAUDE.md)
- [ ] Check component spacing (blank lines between major sections)
- [ ] Verify no hardcoded values that should be env vars

## Phase 10: Auth Implementation Review ✅
**Status:** Completed  
**Priority:** High  
**Scope:** Verify Clerk authentication integration follows CLAUDE.md standards

### Findings:

#### Server-Side Auth Implementation:
1. **Import Pattern** ✅
   - All 15 files using server auth correctly import: `import { auth } from "@clerk/nextjs/server"`
   - No violations of the import pattern found

2. **Await Usage** ✅
   - All auth() calls are properly awaited
   - Pattern consistently used: `const { userId } = await auth()`
   - Found in: layouts, pages, and API routes

3. **Protected Routes** ✅
   - middleware.ts properly configures protected routes using `createRouteMatcher`
   - Layout components add additional auth checks with proper redirects
   - API routes return 401 status for unauthorized requests

4. **userId Schema Pattern** ✅
   - Database schemas correctly follow: `userId: text("user_id").notNull()`
   - Found in both profiles-schema.ts and pitches-schema.ts

#### Client-Side Auth Implementation:
1. **Clerk UI Components** ✅
   - SignIn/SignUp components properly imported from "@clerk/nextjs"
   - UserButton correctly used in header components
   - All client components have "use client" directive

2. **ClerkProvider** ✅
   - Properly wrapped around the app in root layout.tsx
   - Configured correctly at the highest level

3. **Conditional Rendering** ✅
   - Proper use of SignedIn/SignedOut components
   - Clean separation between authenticated and public content

### Violations Found:
**None** - The auth implementation fully complies with CLAUDE.md standards

### Summary:
The Clerk authentication implementation is exemplary:
- ✅ All server components use the correct import pattern
- ✅ All auth() calls are properly awaited
- ✅ Protected routes are implemented at multiple levels (middleware + layouts)
- ✅ Client components properly use Clerk UI components
- ✅ Database schemas follow the specified userId pattern
- ✅ Clean separation between server and client auth logic
- ✅ Proper error handling and unauthorized access responses

The implementation demonstrates security best practices with defense-in-depth through multiple auth check layers.

- [x] Verify `import { auth } from "@clerk/nextjs/server"` in server components
- [x] Check auth() is awaited in server actions
- [x] Review protected route implementations
- [x] Verify user context handling

## Phase 11: Storage Implementation Review
- [ ] Check Supabase storage bucket naming (kebab-case)
- [ ] Verify file path structures follow pattern
- [ ] Check for proper error handling in storage operations
- [ ] Review file validation implementations
- [ ] Document any required RLS policies for setup

## Phase 12: Code Style Compliance ✅
**Status:** Completed  
**Priority:** Low  
**Scope:** Verify coding standards adherence across the codebase

### Findings:

#### Overall Statistics:
- **Total TypeScript files**: 190 files (.ts/.tsx)
- **Files with violations**: ~100 files (52.6% of codebase)

#### 1. Comments Policy ❌ CRITICAL VIOLATIONS
**CLAUDE.md Rule**: "DO NOT ADD ***ANY*** COMMENTS unless asked"

**Violations Found**:
- **44 files** (23.2%) contain JSDoc blocks (`/** */`)
- **71 files** (37.4%) contain inline comments (`//`)
- **0 files** contain TODO/FIXME comments ✅

**Most Heavily Commented Files**:
1. `/app/(wizard)/dashboard/new/components/wizard/use-wizard.tsx` - 66 comment lines
2. `/types/supabase.ts` - 31 comment lines
3. `/app/(wizard)/dashboard/new/components/wizard/validation.tsx` - 26 comment lines
4. `/app/(wizard)/dashboard/new/components/steps/action-step.tsx` - 19 comment lines
5. `/lib/hooks/use-pitch-generation.ts` - 16 comment lines

**Comment Patterns**:
- Wizard components are heavily commented (likely for complex logic)
- API routes contain many explanatory comments
- Hook files have extensive inline documentation
- Schema files have type documentation

#### 2. File Naming ✅ MOSTLY COMPLIANT
**Violations Found**: Only 1 file
- `/lib/schemas/pitchSchemas.ts` should be `pitch-schemas.ts`

All other files correctly follow kebab-case naming convention.

#### 3. Import Patterns ⚠️ MINOR VIOLATIONS
**Violations Found**: 29 files (15.3%) use relative imports
- Most are within feature folders (e.g., wizard components)
- Common pattern: `from "./components"` or `from "../utilities"`
- Should use `@/` imports for consistency

#### 4. Component Structure ✅ COMPLIANT
- Proper directive placement (after moving to line 1)
- Good spacing between sections
- Consistent patterns across components

#### 5. Top-Level File Comments ✅ COMPLIANT
- Most files have appropriate single-line descriptions
- Format follows CLAUDE.md guidelines when present

### Summary of Violations:

1. **Critical Issue - Comments**: 
   - 100+ files need comment removal
   - This represents over half the codebase
   - Systematic violation of the "no comments" rule

2. **Minor Issues**:
   - 1 file naming violation (pitchSchemas.ts)
   - 29 files with relative imports

3. **Compliant Areas**:
   - File naming (99.5% compliance)
   - Component structure
   - No TODO/FIXME comments
   - Top-level descriptions follow format

### Recommendations:

#### 1. Mass Comment Removal Campaign
Given the scale (100+ files), consider:
- Automated script to remove JSDoc blocks
- Systematic removal of inline comments
- Preserve only top-level file descriptions

#### 2. File Rename
**File**: `/lib/schemas/pitchSchemas.ts`
**Rename to**: `pitch-schemas.ts`
**Update imports**: Search and replace all imports of this file

#### 3. Import Pattern Updates
Update 29 files to use `@/` imports instead of relative paths for consistency.

### Impact Assessment:
- **High Impact**: Comment removal will significantly change code readability
- **Low Risk**: Changes are purely stylistic, no functional impact
- **Time Estimate**: 2-4 hours for complete cleanup

The codebase shows good structural compliance but has a systemic comment violation issue that affects over half the files.

- [x] Verify NO comments unless explicitly needed
- [x] Check all files have top-level description comments
- [x] Verify @ import usage throughout
- [x] Check kebab-case naming for all files/folders
- [x] Verify proper blank line spacing in components

## Phase 13: Final Review
- [ ] Create summary report of all violations found
- [ ] List all files that need updates
- [ ] Prioritize critical fixes vs minor style issues
- [ ] Document any patterns that deviate from CLAUDE.md but might be intentional

## Execution Notes:
- Each phase should be completed sequentially
- Document all findings with specific file paths and line numbers
- Create fix recommendations for each violation
- Flag any ambiguous cases for clarification

Total estimated files to review: ~150-200 files