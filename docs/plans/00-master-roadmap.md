# Master Implementation Roadmap: Natural-Language Task Manager

This document provides an executive summary and milestone roadmap for building the **Natural-Language Task Manager** based on the Software Requirements Specification ([project_srs.pdf](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/project_srs.pdf)).

## Implementation Phase Structure

The project implementation is divided into 6 modular, sequential phases in dedicated plan files:

| Phase | Plan Document | Scope & Key Deliverables | Estimated Dependencies |
| :--- | :--- | :--- | :--- |
| **Phase 1** | [`01-backend-auth-setup.md`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/plans/01-backend-auth-setup.md) | Node/Express backend scaffold, MongoDB database connection, User Model, Bcrypt hashing, JWT authentication middleware, `/api/auth` endpoints. | None |
| **Phase 2** | [`02-gemini-ai-and-task-api.md`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/plans/02-gemini-ai-and-task-api.md) | Google Gemini API integration, prompt engineering for NLP task parsing, Task Model, `/api/tasks/parse` endpoint, full Task CRUD endpoints. | Phase 1 |
| **Phase 3** | [`03-frontend-setup-and-auth.md`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/plans/03-frontend-setup-and-auth.md) | Vite + React frontend setup, TailwindCSS & UI tokens, React Router, Auth Context state, Login & Register views. | Phase 1 |
| **Phase 4** | [`04-nl-input-and-preview-card.md`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/plans/04-nl-input-and-preview-card.md) | Single natural language prompt input UI, live shimmer loading state, parsed task preview modal with editable fields, confirm/save workflow & manual entry fallback. | Phase 2, Phase 3 |
| **Phase 5** | [`05-dashboard-and-calendar-views.md`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/plans/05-dashboard-and-calendar-views.md) | Task Dashboard with search bar, priority & label filtering, overdue highlight, completion toggling, interactive Calendar View (Month/Week views). | Phase 4 |
| **Phase 6** | [`06-reminders-and-final-polish.md`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/plans/06-reminders-and-final-polish.md) | Automated background cron service (`node-cron`), Nodemailer email reminders, error handling, performance optimization, and end-to-end verification. | Phase 5 |

---

## Architectural Workflow
```
 ┌─────────────────────────────────────────────────────────────┐
 │                      React Frontend                         │
 │ ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
 │ │ Auth Views       │  │ Task Dashboard   │  │ Calendar    │ │
 │ │ (Login/Register) │  │ (List, Search)   │  │ View        │ │
 │ └──────────────────┘  └──────────────────┘  └─────────────┘ │
 │                          ▲                                  │
 │                          │ (Input Text & Confirm)           │
 │                 ┌────────┴────────┐                         │
 │                 │ NL Preview Card │                         │
 │                 └─────────────────┘                         │
 └──────────────────────────┬──────────────────────────────────┘
                            │ REST API (HTTPS / JWT)
 ┌──────────────────────────▼──────────────────────────────────┐
 │                     Express Backend                         │
 │  ┌─────────────────┐ ┌──────────────────┐ ┌───────────────┐ │
 │  │ Auth Middleware │ │ Task Controller  │ │ Gemini Parser │ │
 │  └─────────────────┘ └──────────────────┘ └───────┬───────┘ │
 └─────────────┬──────────────────┬──────────────────┼─────────┘
               │                  │                  │
               ▼                  ▼                  ▼
          [ MongoDB ]       [ Nodemailer ]    [ Gemini API ]
```

---

## Development Guidelines & SRS Alignment
- **FR-1**: Security via Bcrypt hashing, JWT tokens stored securely.
- **FR-2 & FR-3**: High-accuracy natural language processing via Gemini with relative date awareness and confirmation preview.
- **FR-4 & FR-5**: Flexible task querying by search, tag, priority, and date sorting.
- **FR-6**: Full visual calendar integration.
- **FR-7**: Dual in-app & email notification scheduler.
- **NFR-1 to NFR-8**: Sub-3s page loads, sub-5s AI parsing, resilient manual fallback if AI is offline.
