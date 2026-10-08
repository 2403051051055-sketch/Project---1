# Project Context: Natural-Language Task Manager

## 1. Executive Summary
The **Natural-Language Task Manager** is a full-stack MERN (MongoDB, Express.js, React, Node.js) web application powered by the Google Gemini API. It enables users to type task descriptions in natural, conversational English (e.g., *"submit report by Friday 5pm, high priority"*) and automatically extracts structured attributes including task title, description, due date/time, priority level, and tags/labels. Users can preview and tweak the parsed metadata before committing it to their personal task list or calendar.

Detailed phase-by-phase implementation plans are maintained in separate markdown documents under [`docs/plans/`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/plans/00-master-roadmap.md).

---

## 2. Technology Stack & Architecture

### Tech Stack
- **Frontend**: React (Vite / CRA), React Router, TailwindCSS / CSS Modules, Lucide Icons, FullCalendar / Custom Calendar UI
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, Nodemailer (Email Reminders), node-cron (Scheduled Reminder Jobs)
- **Database**: MongoDB (Mongoose ODM)
- **AI Integration**: Google Gemini API (`@google/genai` or `@google/generative-ai`)
- **API Style**: RESTful over HTTPS with JSON payload exchange

### Architecture Diagram
```
[ Browser / React Frontend ]
           │
           ▼ (HTTPS / REST API / JWT Auth)
[ Node.js + Express REST Server ] ───► [ Google Gemini API ] (Text Parsing)
           │                      ───► [ Nodemailer / Email Service ] (Reminders)
           ▼
     [ MongoDB ] (Users & Tasks Storage)
```

---

## 3. Data Models (MongoDB / Mongoose Schemas)

### 3.1 User Schema (`users`)
| Field | Type | Options / Validation | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated | Primary Key |
| `name` | String | Required, Trim | User's full name |
| `email` | String | Required, Unique, Lowercase | User email login |
| `password` | String | Required, Min length 6 | Hashed password (Bcrypt) |
| `timeZone` | String | Default: `"UTC"` | Preferred timezone (e.g. `"Asia/Kolkata"`, `"America/New_York"`) |
| `createdAt` | Date | Default: `Date.now` | Registration timestamp |

### 3.2 Task Schema (`tasks`)
| Field | Type | Options / Validation | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated | Primary Key |
| `userId` | ObjectId | Ref: `'User'`, Required, Indexed | Task owner ID |
| `title` | String | Required, Trim | Task title |
| `description` | String | Default: `""` | Additional task notes |
| `dueDate` | Date | Optional, Indexed | Target completion date & time |
| `priority` | String | Enum: `['low', 'medium', 'high']`, Default: `'medium'` | Priority level |
| `labels` | [String] | Array of strings | Categorization tags (e.g., `"work"`, `"college"`) |
| `status` | String | Enum: `['pending', 'completed']`, Default: `'pending'` | Task completion status |
| `reminderSent` | Boolean | Default: `false` | Tracking reminder notification status |
| `originalText` | String | Default: `""` | Original raw user prompt input |
| `assignee` | String | Optional (Use-Case Extension) | Assigned team member name/email |
| `subject` | String | Optional (Use-Case Extension) | Course/subject name for academic tracking |
| `createdAt` | Date | Default: `Date.now` | Creation timestamp |
| `updatedAt` | Date | Default: `Date.now` | Last edit timestamp |

---

## 4. API Endpoints Specification

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` — Register new user account. Returns JWT token & user info.
- `POST /api/auth/login` — Authenticate user email & password. Returns JWT token.
- `GET /api/auth/me` — Fetch currently authenticated user profile.

### Task Management Routes (`/api/tasks`) *(Protected via JWT Middleware)*
- `POST /api/tasks/parse` — Accept raw natural text + client date/timezone -> Calls Gemini API -> Returns structured preview JSON.
- `POST /api/tasks` — Save confirmed task object to database.
- `GET /api/tasks` — Retrieve list of tasks for current user. Supports query parameters (`status`, `priority`, `label`, `search`, `sortBy`).
- `GET /api/tasks/:id` — Retrieve single task details.
- `PUT /api/tasks/:id` — Update existing task.
- `PATCH /api/tasks/:id/status` — Toggle status (`pending` <-> `completed`).
- `DELETE /api/tasks/:id` — Remove task by ID.

---

## 5. Gemini NLP Integration Strategy

### Prompt Formulation
To reliably parse relative time expressions (e.g., *"tomorrow at 3pm"*), the backend provides the current reference date, current weekday, and user timezone to Gemini.

### Prompt Template
```text
System: You are a precise task metadata extractor. Convert the following natural language task input into a clean JSON object.

Context:
- Current Timestamp: ${currentIsoTimestamp}
- Current Day of Week: ${dayOfWeek}
- User Timezone: ${timeZone}

User Input: "${userInput}"

Output Specification:
Return strictly a valid JSON object matching this structure (no markdown fences, no extra text):
{
  "title": "string (clear concise action title)",
  "description": "string (optional extra context, or empty string)",
  "dueDate": "ISO 8601 string YYYY-MM-DDTHH:mm:ss.sssZ or null if no date mentioned",
  "priority": "low" | "medium" | "high",
  "labels": ["string"]
}

Rule: If no year or time is given, default to current year and 09:00:00 local time.
```

---

## 6. Functional & UI Modules

1. **Auth View**: Login and Register screens with responsive form validation and error handling.
2. **Natural Language Input & Preview Modal**:
   - Single clean input prompt box.
   - Live loading state with dynamic shimmer/spinner while Gemini parses text.
   - Parsed Task Preview Card displaying extracted Title, Due Date, Priority badge, and Tag Chips with full manual inline editing capability before clicking "Save Task".
   - Fallback button for manual task creation if parsing fails or input is unstructured.
3. **Task Dashboard (List View)**:
   - Search bar for quick title filter.
   - Priority filter dropdown (`All`, `High`, `Medium`, `Low`).
   - Label/Tag multi-filter.
   - Overdue tasks visually highlighted with warning badges.
   - Checkbox for marking complete/incomplete.
4. **Calendar View**:
   - Interactive Month and Week views displaying scheduled tasks.
   - Quick view/edit modal on clicking any task event.
5. **Reminders & Cron Service**:
   - Automated background cron runner polling pending tasks whose `dueDate` is within the notification window (e.g., 1 hour prior).
   - Triggers in-app status flag updates and Nodemailer email alerts.

---

## 7. Recommended Directory Blueprint

```
Project - 1/
├── docs/
│   └── project_srs.pdf
├── PROJECT_CONTEXT.md
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── gemini.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   ├── emailService.js
│   │   │   └── reminderScheduler.js
│   │   └── server.js
└── client/
    ├── package.json
    ├── .env.example
    ├── src/
    │   ├── components/
    │   │   ├── TaskInputForm.jsx
    │   │   ├── TaskPreviewModal.jsx
    │   │   ├── TaskList.jsx
    │   │   ├── TaskCard.jsx
    │   │   └── CalendarView.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
```

---

## 8. Environment Configuration (`.env`)

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nltaskmanager
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
