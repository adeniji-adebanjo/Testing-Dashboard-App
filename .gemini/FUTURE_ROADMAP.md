# Future Roadmap: Testing Management Portal - Advanced Features

This document outlines the implementation plan for features that are currently beyond the MVP scope but essential for a production-grade enterprise testing solution.

---

## Phase 5: AI Intelligence & Document Processing (Priority: HIGH)

### 5.1 Real LLM Integration

- **Objective**: Connect `PRDUploader` to Gemini 1.5 Pro or Flash via an Edge Function.
- **Tasks**:
  - Implement a Next.js API route (`/api/analyze-prd`) to handle model communication.
  - Setup PDF/Word parsing using `pdf-parse` or similar server-side library.
  - Engineer prompt templates for extracting functional test cases, edge cases, and security scenarios.
  - Implement streaming response for the "AI is thinking" UI state.

### 5.2 Supabase Storage for PRDs

- **Objective**: Persist uploaded documents for future reference.
- **Tasks**:
  - Create a Supabase Storage bucket named `prd-documents`.
  - Update `projects` table to include `prd_file_url` and `prd_last_analyzed`.
  - Link original file to the analysis history.

---

## Phase 6: Real-Time Collaboration & Synchronization (Priority: MEDIUM)

### 6.1 Supabase Realtime Integration

- **Objective**: Allow multi-user collaboration on the same project dashboard.
- **Tasks**:
  - Enable `Realtime` on `test_data` and `projects` tables.
  - Implement `useRealtimeSync` hook to update TanStack Query cache on broadcast events.
  - Add "Presence" indicators (e.g., "Ade is viewing this test case") in the Sidebar.

### 6.2 Collaborative Locking (Optimistic)

- **Objective**: Prevent "last save wins" data loss.
- **Tasks**:
  - Implement a locking mechanism when a user opens the "Edit Test Case" modal.
  - Show warning if someone else is currently editing the same record.

---

## Phase 7: Global Reporting & Enterprise Analytics (Priority: MEDIUM)

### 7.1 Cross-Project Metrics

- **Objective**: High-level overview for QA Managers.
- **Tasks**:
  - Create a "Global Dashboard" route (`/admin/dashboard`).
  - Implement aggregate queries using Supabase RPC for:
    - Total bugs across all projects.
    - Average pass rate across the organization.
    - Resource allocation (which projects have the most testers).
  - Add data visualization using Recharts or similar for org-wide trends.

---

## Phase 8: Robust Auth & Access Control (Priority: HIGH)

### 8.1 Supabase Auth Integration

- **Objective**: Move from `session_id` to real user accounts.
- **Tasks**:
  - Implement login/signup using Supabase Auth (Email + Google/GitHub).
  - Update `users` table to link `auth.users` via UUID.
  - Implement Row Level Security (RLS) policies to ensure users only see projects they are invited to.

### 8.2 Role-Based Access Control (RBAC)

- **Objective**: Define Tester, Developer, and Admin permissions.
- **Tasks**:
  - Create `user_roles` lookup table.
  - Protect "Delete Project" and "Sign-Off" actions based on user claims.

---

## Future Implementation Order

### Sprint 5: Intelligence & Storage

1. ⬜ Setup Supabase Storage bucket.
2. ⬜ Implement server-side PRD parsing.
3. ⬜ Connect Gemini API for real requirement extraction.
4. ⬜ Store analysis history in `test_data`.

### Sprint 6: Collaboration & Auth

1. ⬜ Implement Supabase Auth (Email Login).
2. ⬜ Refactor RLS for user-owned projects.
3. ⬜ Enable Supabase Realtime for live dashboard updates.

### Sprint 7: Analytics

1. ⬜ Build global "Manager View" with organization-wide metrics.
2. ⬜ Implement automated weekly PDF summary reports across all projects.
