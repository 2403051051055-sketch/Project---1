# Natural-Language Task Manager (MERN + Google Gemini API)

A full-stack web application that transforms unstructured natural language text into structured tasks with due dates, priorities, tags, and automated reminders using the Google Gemini AI model.

## SRS & Context Documentation
- **SRS Document**: Located at [`docs/project_srs.pdf`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/docs/project_srs.pdf)
- **Comprehensive Project Context**: Available at [`PROJECT_CONTEXT.md`](file:///c:/Users/BHAVISHA%20DABHI/OneDrive/Desktop/Project%20-%201/PROJECT_CONTEXT.md)

## Tech Stack
- **Frontend**: React, React Router, TailwindCSS / Custom CSS, Lucide Icons, FullCalendar
- **Backend**: Node.js, Express.js, JWT, Bcrypt.js, Nodemailer, Cron
- **Database**: MongoDB (Mongoose ODM)
- **AI Integration**: Google Gemini API (`@google/genai`)

## Key Features
1. **Natural-Language Task Creation**: Type tasks in English (e.g. *"submit report by Friday 5pm, high priority"*).
2. **Parsed Task Preview Card**: AI parses attributes into title, due date, priority, and labels, showing a preview modal for quick user edit/confirmation.
3. **Task Views**:
   - **Dashboard / List View**: Search, filter by priority or labels, sorting by due date, overdue highlight.
   - **Calendar View**: Interactive Month/Week view for time management.
4. **Reminders & Notifications**: Scheduled in-app status updates and Nodemailer email reminders before tasks are due.
5. **Security**: Password hashing with Bcrypt, JWT stateless authentication, server-side API key protection.

## Setup & Quick Start

### 1. Server Setup
```bash
cd server
npm install
# Configure .env file with MONGO_URI, JWT_SECRET, and GEMINI_API_KEY
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```
