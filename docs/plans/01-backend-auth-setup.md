# Phase 1: Backend Setup & Authentication Service

## Objective
Establish the Node.js / Express backend infrastructure, configure MongoDB connectivity, define the User schema, and implement secure JWT user registration and authentication endpoints per **FR-1** and **NFR-2**.

---

## 1. Directory & Environment Configuration

### Target Files to Create
- `server/package.json`
- `server/.env`
- `server/src/server.js`

### Step 1.1: Package Dependencies
Initialize `server/package.json` with the following core dependencies:
- `express` — Web framework
- `mongoose` — MongoDB object modeling
- `dotenv` — Environment configuration
- `cors` — Cross-origin resource sharing
- `bcryptjs` — Secure password hashing
- `jsonwebtoken` — State-less JWT user sessions
- `@google/genai` — Official Google Gemini API client
- `nodemailer` — Email notifications
- `node-cron` — Scheduled reminder tasks
- `nodemon` *(dev)* — Automatic server restart

### Step 1.2: Environment Variables (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nltaskmanager
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
```

---

## 2. Database & Express App Scaffold

### Target Files to Create
- `server/src/config/db.js`
- `server/src/middleware/errorHandler.js`

### Step 2.1: Database Connection (`server/src/config/db.js`)
Implement Mongoose connection logic with connection error handling and retry mechanisms.

### Step 2.2: Central Error Handling (`server/src/middleware/errorHandler.js`)
Standardize error responses:
```json
{
  "success": false,
  "message": "Error description",
  "stack": "Development stack trace"
}
```

---

## 3. User Data Model & Auth Logic

### Target Files to Create
- `server/src/models/User.js`
- `server/src/middleware/authMiddleware.js`
- `server/src/controllers/authController.js`
- `server/src/routes/authRoutes.js`

### Step 3.1: User Schema Definition (`server/src/models/User.js`)
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  timeZone: { type: String, default: 'UTC' }
}, { timestamps: true });
```
- Add Mongoose `pre('save')` hook to automatically hash `password` using `bcrypt.hash()` if modified.
- Add instance method `matchPassword(enteredPassword)` to compare passwords.

### Step 3.2: JWT Verification Middleware (`server/src/middleware/authMiddleware.js`)
- Extract `Authorization` header (`Bearer <token>`).
- Verify token using `jwt.verify(token, process.env.JWT_SECRET)`.
- Attach decoded user ID to `req.user`.

### Step 3.3: Authentication Endpoints (`server/src/controllers/authController.js`)
1. `POST /api/auth/register`:
   - Validate input (name, email, password).
   - Check if email exists.
   - Create user record.
   - Respond with user details & JWT.
2. `POST /api/auth/login`:
   - Validate email & password presence.
   - Fetch user by email & check password match.
   - Respond with user details & JWT.
3. `GET /api/auth/me`:
   - Protected endpoint returning logged-in user profile.

---

## 4. Verification & Testing Checklist

- [ ] Execute `npm run dev` inside `server/` and verify server starts on port `5000`.
- [ ] Verify MongoDB connection logs `MongoDB Connected Successfully`.
- [ ] Test `POST /api/auth/register` using cURL / Postman. Confirm password is saved as a bcrypt hash in MongoDB.
- [ ] Test `POST /api/auth/login` and receive a valid JWT token.
- [ ] Test `GET /api/auth/me` with `Authorization: Bearer <token>` header to ensure protected routes function.
