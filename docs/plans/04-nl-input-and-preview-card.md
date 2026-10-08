# Phase 4: Natural-Language Input UI & Preview Modal

## Objective
Build the signature user interaction feature of the application: a single conversational English text prompt input box (**FR-2**), dynamic loading animation during AI extraction, a Parsed Task Preview Card modal with inline attribute editing (**FR-3**), and a resilient manual task creation fallback (**NFR-3**).

---

## 1. Component Architecture & Workflow

```
[ User types text in TaskInputForm ]
                 │
                 ▼ (Submits text)
[ Call POST /api/tasks/parse with timezone ]
                 │
                 ├── (Loading state: Shimmer Card / Pulse animation)
                 │
                 ▼
[ Opens TaskPreviewModal ]
 ├── Displays Extracted Title (Editable)
 ├── Displays Extracted Due Date & Time Picker (Editable)
 ├── Displays Priority Level Selector (Low / Medium / High)
 ├── Displays Tag/Label Chips (Add / Remove)
 │
 ├── User clicks "Confirm & Save Task" ──► POST /api/tasks ──► Refresh Task List
 └── User clicks "Cancel" ──────────────► Close Modal
```

---

## 2. Natural Language Task Input Component

### Target File to Create
- `client/src/components/TaskInputForm.jsx`

### Features
- Hero prompt card positioned at the top of the dashboard.
- Prominent input box with placeholder: `"e.g., Submit project report by Friday 5pm, high priority, #college"`
- AI Sparkles Icon (`Sparkles` from `lucide-react`) on submit button.
- Submits `text`, client ISO timestamp, and `timeZone`.
- Triggers loading overlay with dynamic text (`"Gemini is parsing your task details..."`).

---

## 3. Parsed Task Preview Modal

### Target File to Create
- `client/src/components/TaskPreviewModal.jsx`

### Interactive Fields & Layout
1. **Header**: "Confirm Parsed Task" with AI badge.
2. **Title Field**: Standard input box initialized with `parsedData.title`.
3. **Description Field**: Optional text area initialized with `parsedData.description`.
4. **Due Date & Time**: Interactive HTML datetime-local picker (`<input type="datetime-local">`) displaying converted `parsedData.dueDate`.
5. **Priority Selector**: Visual radio buttons or pill toggles for `Low`, `Medium`, and `High` with color badges (Green for Low, Amber for Medium, Crimson for High).
6. **Labels / Tags**: Multi-select tag chips with `+ Add Label` input box.
7. **Fallback Banner**: If `parsedData.isFallback` is true, display a notice: *"AI parser unavailable. Please complete task details manually."*
8. **Action Buttons**:
   - Primary: `"Save Task"` (Triggers `POST /api/tasks`)
   - Secondary: `"Cancel"` (Closes modal without saving)

---

## 4. Manual Task Creation Fallback Modal

### Target File to Create
- `client/src/components/ManualTaskModal.jsx`

### Features
- Dedicated modal for users who prefer creating tasks without AI parsing or if Gemini is completely unreachable.
- Clean blank form with default priority `medium`.

---

## 5. Verification Checklist

- [ ] Enter text *"Buy groceries tomorrow at 6pm, medium priority"* in `TaskInputForm`. Confirm preview modal pops up in under 3 seconds.
- [ ] Verify extracted title is `"Buy groceries"` and date is set to tomorrow's date at 18:00.
- [ ] Edit the title in the preview modal to *"Buy groceries and supplies"*, change priority to `High`, add label `shopping`, and click Save.
- [ ] Verify the saved task appears in the backend MongoDB database with updated title, priority, and label.
- [ ] Click Cancel in preview modal and ensure task is not saved.
