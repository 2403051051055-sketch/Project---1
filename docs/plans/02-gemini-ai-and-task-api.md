# Phase 2: Gemini AI Integration & Task API Service

## Objective
Implement the Google Gemini AI parsing service to convert natural language task inputs into structured task metadata (**FR-2**, **FR-3**), and build out complete MongoDB CRUD endpoints for task management (**FR-4**, **FR-5**, **FR-8**).

---

## 1. Task Data Model

### Target File to Create
- `server/src/models/Task.js`

### Schema Details
```javascript
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  dueDate: { type: Date, default: null, index: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  labels: [{ type: String, trim: true }],
  status: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true },
  reminderSent: { type: Boolean, default: false },
  originalText: { type: String, default: '' },
  assignee: { type: String, default: '' },
  subject: { type: String, default: '' }
}, { timestamps: true });
```

---

## 2. Gemini AI Parsing Service

### Target Files to Create
- `server/src/config/gemini.js`
- `server/src/services/geminiService.js`

### Step 2.1: Gemini Client Setup (`server/src/config/gemini.js`)
Initialize `@google/genai` with `process.env.GEMINI_API_KEY`. Select model `gemini-2.5-flash` for high-speed structured text extraction.

### Step 2.2: Prompt Engineering (`server/src/services/geminiService.js`)
The parsing function accepts `rawText`, `timeZone`, and `clientNow` timestamp.

#### Structured Output System Prompt:
```text
You are a specialized task parser. Parse the user's task input into a JSON object.

Current Reference Context:
- Local Time: ${clientNow}
- User Timezone: ${timeZone}

User Input: "${rawText}"

Rules:
1. Extract a clear "title".
2. Infer "dueDate" in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Convert relative phrases like "tomorrow", "next Friday at 4pm" relative to local time context. If no time is specified, default to 09:00:00 local time.
3. Classify "priority" into "low", "medium", or "high" (default "medium").
4. Extract tags/categories into "labels" array.
5. Return ONLY a valid JSON object with keys: title, description, dueDate, priority, labels.
```

### Step 2.3: Resilience & Fallback Handling
If the Gemini API request fails or times out (> 5 seconds per **NFR-1**), catch the exception gracefully and return a fallback structured object:
```json
{
  "title": "Raw user input",
  "description": "",
  "dueDate": null,
  "priority": "medium",
  "labels": [],
  "isFallback": true
}
```

---

## 3. Task API Endpoints & Controller

### Target Files to Create
- `server/src/controllers/taskController.js`
- `server/src/routes/taskRoutes.js`

### Endpoint Specifications

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks/parse` | Sends raw text + timezone to Gemini; returns parsed preview JSON. | Yes |
| `POST` | `/api/tasks` | Creates a confirmed task record in MongoDB. | Yes |
| `GET` | `/api/tasks` | Fetches tasks with query filters (`status`, `priority`, `label`, `search`, `sortBy`). | Yes |
| `GET` | `/api/tasks/:id` | Fetches single task details. | Yes |
| `PUT` | `/api/tasks/:id` | Updates task details. | Yes |
| `PATCH` | `/api/tasks/:id/status` | Toggles status (`pending` <-> `completed`). | Yes |
| `DELETE` | `/api/tasks/:id` | Removes task by ID. | Yes |

### Controller Logic Highlights
- `parseTask`: Receives `{ text, timeZone, clientNow }`. Calls `geminiService.parseTaskText()`.
- `getTasks`: Builds dynamic MongoDB query filters:
  ```javascript
  const query = { userId: req.user._id };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (label) query.labels = label;
  if (search) query.title = { $regex: search, $options: 'i' };
  ```

---

## 4. Verification & Testing Checklist

- [ ] Test `POST /api/tasks/parse` with input *"submit math assignment by next Monday 3pm high priority"*. Verify extracted date matches the upcoming Monday at 15:00.
- [ ] Test API key fallback by temporarily passing an invalid API key; verify manual fallback object is returned without server crash.
- [ ] Test `POST /api/tasks` to create task and verify it appears in `GET /api/tasks`.
- [ ] Test filtering by `priority=high` and searching by keyword.
- [ ] Verify `DELETE /api/tasks/:id` removes task only for the owning user ID.
