# Phase 3: Frontend Foundation & Auth UI

## Objective
Initialize the React frontend application using Vite, create a modern design system with TailwindCSS and glassmorphic aesthetic, set up React Router with protected routes, and build Login & Register user interfaces (**FR-1**, **NFR-4**).

---

## 1. React Application Initialization

### Target Files & Folder Structure
- `client/package.json`
- `client/vite.config.js`
- `client/index.html`
- `client/src/index.css`

### Step 1.1: Project Creation & Dependencies
Initialize Vite React app in `client/`:
- Dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `lucide-react`, `date-fns`, `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`.
- Dev Dependencies: `vite`, `tailwindcss`, `postcss`, `autoprefixer`.

### Step 1.2: Design System & Tokens (`client/src/index.css`)
Incorporate modern aesthetics (Google Font Inter/Outfit, dark mode slate background `#0f172a`, glassmorphism panels, subtle border glow effects, and linear gradient buttons):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  background-color: #0b0f19;
  color: #f1f5f9;
}

.glass-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
}
```

---

## 2. API Integration & Authentication Context

### Target Files to Create
- `client/src/services/api.js`
- `client/src/context/AuthContext.jsx`

### Step 2.1: Axios API Client (`client/src/services/api.js`)
Create configured Axios instance with base URL `VITE_API_BASE_URL` (default `http://localhost:5000/api`).
- Add request interceptor to automatically attach `Authorization: Bearer <token>` from `localStorage`.
- Add response interceptor to handle `401 Unauthorized` by logging out the user.

### Step 2.2: Auth Context Provider (`client/src/context/AuthContext.jsx`)
Provide global authentication state:
- State: `user`, `token`, `loading`, `error`.
- Functions: `login(email, password)`, `register(name, email, password)`, `logout()`.
- Check active token on startup via `GET /api/auth/me`.

---

## 3. Router & Navigation Structure

### Target Files to Create
- `client/src/components/ProtectedRoute.jsx`
- `client/src/components/Navbar.jsx`
- `client/src/pages/Login.jsx`
- `client/src/pages/Register.jsx`
- `client/src/App.jsx`

### Component Workflow
- `ProtectedRoute.jsx`: Redirects unauthenticated users to `/login`.
- `Login.jsx`: Sleek glassmorphic card form with email & password input, client-side validation, error alert banner, and smooth redirect to `/dashboard`.
- `Register.jsx`: Registration form with name, email, password fields, timezone auto-detection via `Intl.DateTimeFormat().resolvedOptions().timeZone`.

---

## 4. Verification Checklist

- [ ] Execute `npm run dev` in `client/` and view page in browser at `http://localhost:5173`.
- [ ] Test navigating to `/` or `/dashboard` while logged out; verify automatic redirect to `/login`.
- [ ] Fill out Register form and submit. Verify user is stored in backend DB and token is saved in `localStorage`.
- [ ] Test Logout button in Navbar; verify token cleared and redirected to `/login`.
- [ ] Test Login form with valid and invalid credentials to verify error alert banners.
