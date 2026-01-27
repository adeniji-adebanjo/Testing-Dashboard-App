# QA Executive Dashboard - Advanced Features Implementation Plan

## Overview

This plan outlines the implementation of advanced features tailored for a **single QA Executive** user who needs:

- Centralized workflow management across multiple projects
- Public-facing summary reports (read-only)
- Private authentication gate for all editing operations
- AI-powered PRD analysis
- Cross-project KPI tracking

---

## Phase A: Authentication & Access Control (Priority: CRITICAL)

### A.1 Supabase Auth Setup

- **Objective**: Implement email-based authentication for the executive user
- **Tasks**:
  - Configure Supabase Auth with email provider
  - Create `src/lib/auth.ts` for auth utilities
  - Implement `AuthContext` for session management
  - Create login page at `/login`

### A.2 Route Protection Middleware

- **Objective**: Protect all editing routes, allow public access to reports
- **Tasks**:
  - Create Next.js middleware for route protection
  - Define public routes: `/projects/[id]/reports`, `/public/*`
  - Redirect unauthenticated users to login for protected routes
  - Add "View Only" mode for summary reports

### A.3 UI Auth Components

- **Tasks**:
  - Update Sidebar to show login/logout state
  - Hide edit buttons for unauthenticated users
  - Add "Executive Mode" indicator when logged in

---

## Phase B: Cross-Project Executive Dashboard (Priority: HIGH)

### B.1 Global Overview Page

- **Route**: `/dashboard` or `/executive`
- **Features**:
  - Total test cases across all projects
  - Organization-wide pass rate
  - Critical defects summary
  - Project health scorecards
  - Recent activity timeline

### B.2 Aggregate Metrics API

- **Tasks**:
  - Create `src/lib/aggregateStats.ts` for cross-project queries
  - Implement Supabase RPC functions for efficient aggregation
  - Cache results for performance

---

## Phase C: Real AI-Powered PRD Processing (Priority: HIGH)

### C.1 Gemini API Integration

- **Objective**: Replace mock PRD analysis with real AI extraction
- **Tasks**:
  - Create API route `/api/analyze-prd` for server-side processing
  - Integrate Google Generative AI SDK
  - Engineer prompt for test case extraction
  - Handle PDF text extraction server-side

### C.2 Permanent File Storage

- **Objective**: Store uploaded PRDs in Supabase Storage
- **Tasks**:
  - Create Supabase Storage bucket `prd-documents`
  - Update `projects` table with `prd_file_url` column
  - Store analysis history for re-processing

---

## Phase D: Public Summary Reports (Priority: MEDIUM)

### D.1 Public Report Routes

- **Route**: `/public/projects/[id]/summary`
- **Features**:
  - Read-only project summary
  - Pass/fail statistics
  - Defect counts by severity
  - No edit controls visible
  - Shareable link for stakeholders

---

## Implementation Order

### Sprint A1: Auth Foundation ✅ COMPLETED

1. ✅ Create auth utilities and context - `src/lib/auth.ts`, `src/context/AuthContext.tsx`
2. ✅ Implement login page - `src/app/login/page.tsx`
3. ⬜ Add Next.js middleware for route protection (optional - can be client-side)
4. ✅ Update UI for auth state - Sidebar with login/logout, user info

### Sprint A2: Executive Dashboard ✅ COMPLETED

1. ✅ Create global dashboard page - `src/app/executive/page.tsx`
2. ✅ Implement aggregate statistics - `src/lib/aggregateStats.ts`
3. ✅ Add project health scorecards

### Sprint A3: AI Integration ✅ COMPLETED

1. ✅ Setup Gemini API route - `src/app/api/analyze-prd/route.ts`
2. ✅ Connect PRDUploader to real API
3. ⬜ Implement Supabase Storage for PRDs (future enhancement)

### Sprint A4: Public Access ✅ COMPLETED

1. ✅ Create public report routes - `src/app/public/projects/[projectId]/page.tsx`
2. ✅ Implement view-only mode - No sidebar, read-only stats display
3. ✅ Generate shareable links - `src/components/project/ShareableLink.tsx`

---

## Environment Variables Required

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# New - Add these
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
EXECUTIVE_EMAIL=your_email@example.com
```

---

## Database Schema Additions

```sql
-- Add to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prd_file_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prd_analyzed_at TIMESTAMPTZ;

-- Create PRD analysis history
CREATE TABLE IF NOT EXISTS prd_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  extracted_tests JSONB,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);
```
