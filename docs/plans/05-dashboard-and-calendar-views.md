# Phase 5: Task Dashboard, List View & Calendar View

## Objective
Implement the main task management interface, featuring a rich list view with search, filtering, and sorting (**FR-4**, **FR-5**), and an interactive calendar view displaying tasks across Month and Week grids (**FR-6**).

---

## 1. Dashboard Layout & State Management

### Target File to Create
- `client/src/pages/Dashboard.jsx`

### Page Structure
- **Header Bar**: Application logo, user profile avatar, view toggle button (`List View` vs `Calendar View`), and Logout button.
- **Top Section**: `TaskInputForm` (Natural Language prompt bar).
- **Filter Toolbar**:
  - Search input box (live filtering by task title).
  - Priority dropdown (`All Priorities`, `High`, `Medium`, `Low`).
  - Label filter dropdown / tag pills.
  - Sort dropdown (`Due Date (Ascending)`, `Due Date (Descending)`, `Priority`, `Creation Date`).
- **Main View Area**: Conditionally renders `TaskList` or `CalendarView`.

---

## 2. Task List Component & Task Card

### Target Files to Create
- `client/src/components/TaskList.jsx`
- `client/src/components/TaskCard.jsx`
- `client/src/components/EditTaskModal.jsx`

### Features & Styling
- **Status Toggle**: Interactive checkbox on each task card to toggle between `pending` and `completed` with strike-through styling.
- **Overdue Highlighting**: If `dueDate < Current Time` and status is `pending`, highlight card with red border and `OVERDUE` badge (**FR-5.4**).
- **Priority Badges**:
  - High: Crimson text on dark red background.
  - Medium: Amber text on dark yellow background.
  - Low: Emerald text on dark green background.
- **Label Tags**: Rounded chip badges displaying associated tags.
- **Card Actions**:
  - Edit button: Opens `EditTaskModal` to modify title, due date, priority, or tags.
  - Delete button: Triggers confirmation prompt and calls `DELETE /api/tasks/:id`.

---

## 3. Interactive Calendar View

### Target File to Create
- `client/src/components/CalendarView.jsx`

### Features (`FullCalendar` Integration)
- Configured with `@fullcalendar/react`, `@fullcalendar/daygrid` (Month view), and `@fullcalendar/timegrid` (Week view).
- Maps task array to calendar events:
  ```javascript
  const events = tasks.map(task => ({
    id: task._id,
    title: task.title,
    start: task.dueDate,
    backgroundColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981',
    borderColor: 'transparent',
    extendedProps: { ...task }
  }));
  ```
- **Event Click Handler**: Clicking a calendar task event opens a details view/edit modal displaying task status, priority, and tags.
- **Drag and Drop Reschedule** *(Optional FR-6.3)*: Triggers `PUT /api/tasks/:id` with new start date when event is dragged to a new calendar date slot.

---

## 4. Verification Checklist

- [ ] Add 5 tasks with varying priorities, labels, and due dates (including 1 overdue task).
- [ ] Verify overdue task displays red warning banner and overdue badge.
- [ ] Test searching for a specific keyword in search bar; confirm list filters in real time.
- [ ] Test filtering by `priority=high`; verify only high priority tasks are shown.
- [ ] Toggle completed checkbox on a task; verify strike-through effect and status update in database.
- [ ] Switch to Calendar view; verify tasks appear on correct dates/times with matching priority colors.
- [ ] Click a calendar event; confirm detail edit modal opens.
