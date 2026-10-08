# Natural-Language Task Manager — Full Stack Project Summary

## 📌 Executive Overview
The **Natural-Language Task Manager** is a modern full-stack web application powered by the **Google Gemini API**. Users can type task descriptions in plain, conversational English (e.g. *"Submit project report by Friday at 5pm, high priority, #work"*), and the AI automatically extracts structured attributes including task title, due date/time, priority level, and category tags.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React (Vite), React Router, TailwindCSS, Lucide Icons, Custom Calendar Component.
- **Backend**: Node.js, Express.js, JWT Authentication, Bcrypt password hashing, Nodemailer (Email Service), `node-cron` (Background Scheduler).
- **Database**: MongoDB (Mongoose ODM) with automatic persistent storage fallback (`MongoMemoryServer`).
- **AI Integration**: Google Gemini API (`gemini-3.8-flash`) via `@google/generative-ai` SDK.

```
[ Browser / React App (localhost:5173) ]
           │
           ▼ (REST API / JWT Auth)
[ Express Server (localhost:5000) ] ───► [ Google Gemini API ] (NLP Parsing)
           │                        ───► [ Email Service ] (Nodemailer HTML Alerts)
           ▼
[ MongoDB Database ] (Users & Tasks Storage)
```

---

## ✨ Key Functional Features

1. **Natural Language Task Parsing**:
   - Accepts relative time expressions (*"tomorrow 9am"*, *"next Monday at 2pm"*, *"in 30 minutes"*).
   - Generates exact ISO 8601 timestamps dynamically adjusted for the user's timezone.
   - Extracts priority keywords (`high`, `medium`, `low`) and hashtags (`#work`, `#college`, `#shopping`).
   - Fallback offline parser if Gemini API key is uninitialized.

2. **Parsed Task Confirmation Modal**:
   - Interactive preview card displaying extracted attributes.
   - Inline manual editing capability for title, description, due date/time, priority level, and tag chips.

3. **Task Dashboard & Management**:
   - Title search filter.
   - Priority filter dropdown (`All`, `High`, `Medium`, `Low`).
   - Tag chip filtering.
   - Status toggle (`pending` ↔ `completed`).
   - Task card edit & delete controls.

4. **Interactive Calendar View**:
   - Month and Week visual views plotting scheduled tasks on date grids.

5. **Automated Multi-User Email Reminders**:
   - Background cron scheduler (`node-cron`) running every 15 minutes.
   - Identifies pending tasks due within 1 hour and dispatches HTML email notifications to the task owner's email address.

---

## 🚀 Running the Project Locally

### 1. Backend REST Server
```powershell
cd server
npm run dev
```
*Server runs on `http://localhost:5000`*

### 2. Frontend React Client
```powershell
cd client
npm run dev
```
*Client runs on `http://localhost:5173`*

---

## 🔑 Environment Configuration

### `server/.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nltaskmanager
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```
