# FixIt Campus Chat Context

Use this context when chatting about the FixIt Campus project.

## 1) Product Context
- **Project:** FixIt Campus
- **Goal:** Centralize campus maintenance incident reporting, assignment, tracking, and resolution.
- **Core flow:** Users create tickets → managers/dispatch assign and update status → history is auditable.

## 2) Technology Context
- **Frontend:** React 19 + Vite 8 + React Router + Axios + Bootstrap/Sass
- **Backend:** Node.js + Express 5
- **Database:** PostgreSQL (via `pg`)
- **Auth/Identity:** JWT + Google OAuth support
- **Infrastructure:** Docker + Docker Compose

## 3) Current Functional Context
- Authentication context exists in frontend (`AuthContext`) and JWT token is stored as `fixit_token`.
- Tickets API includes:
  - `GET /api/tickets`
  - `POST /api/tickets`
  - `PUT /api/tickets/:id/status`
  - `GET /api/tickets/:id/history`
- Ticket object shape in UI includes:
  - `id`, `title`, `description`, `category`, `status`, `priority`
  - `slaDeadline`, `creatorId`, `assignedTechnicianId`
  - `evidence[]`, `createdAt`, `updatedAt`

## 4) Latest Update Context (most recent feature direction)
- The latest repository update introduced a **comprehensive Ticket Details View UI (Linear-style)**.
- Dashboard now supports a 3-pane workspace:
  - left navigation sidebar
  - center ticket feed grouped by workflow status
  - right area for either assignee metrics or full ticket detail
- Ticket detail panel now supports:
  - inline status changes (optimistic update)
  - activity timeline rendering from ticket history
  - comment submission through status update endpoint
  - evidence/image preview and property sidebar

## 5) Chat Behavior Context (for assistants)
When answering questions about FixIt Campus:
- Prioritize current stack (React/Vite + Express + PostgreSQL + Docker).
- Assume ticket lifecycle and auditability are central requirements.
- Reference the new Ticket Details experience as the latest UX direction.
- Keep suggestions aligned with existing route patterns and ticket field naming.
- Prefer incremental, PR-friendly changes over large rewrites.
