# JWT Authentication API

A secure Express.js REST API implementing JWT-based authentication with access and refresh tokens.

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Running the Server

```bash
npm start
```

Server will run on `http://localhost:5000`

For development with auto-reload:
```bash
npm run dev
```

## 🔑 Test Credentials

**Email:** `testuser@example.com`  
**Password:** `password123`

## 📋 API Endpoints

### 1. Login
**POST** `/auth/login`

Validates user credentials and returns JWT tokens.

**Request:**
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "admin"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testuser@example.com\",\"password\":\"password123\"}"
```

---

### 2. Refresh Token
**POST** `/auth/refresh`

Issues a new access token using a valid refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
```

---

### 3. Get Profile (Protected)
**GET** `/profile`

Returns user profile. Requires valid access token in Authorization header.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "testuser@example.com",
  "name": "Test User",
  "role": "admin",
  "tokenInfo": {
    "userId": 1,
    "email": "testuser@example.com",
    "role": "admin"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Logout
**POST** `/auth/logout`

Revokes refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

## 🧪 Testing with Postman

### Step 1: Login
1. Create a new POST request to `http://localhost:5000/auth/login`
2. Set Body → raw → JSON
3. Use the test credentials
4. Save `accessToken` and `refreshToken` from response

### Step 2: Access Protected Route
1. Create a new GET request to `http://localhost:5000/profile`
2. Go to Authorization tab
3. Select Type: "Bearer Token"
4. Paste the `accessToken`
5. Send request - you should see user profile

### Step 3: Test Token Expiration
1. Wait 15 minutes (or modify `.env` to shorter expiry for testing)
2. Try accessing `/profile` again
3. You'll get a 401 "Token expired" error

### Step 4: Refresh Token
1. Create a POST request to `http://localhost:5000/auth/refresh`
2. Send the `refreshToken` in the body
3. Get a new `accessToken`
4. Use the new token to access `/profile`

---

## 🔒 Security Features

- ✅ **Password Hashing:** Uses bcrypt with 10 salt rounds
- ✅ **JWT Tokens:** Signed with secret keys
- ✅ **Token Expiry:** Access tokens expire in 15 minutes
- ✅ **Refresh Tokens:** Long-lived (7 days) for getting new access tokens
- ✅ **Token Storage:** Refresh tokens stored in-memory (use Redis in production)
- ✅ **Protected Routes:** Middleware validates tokens on protected endpoints
- ✅ **Error Handling:** Proper HTTP status codes and error messages

---

## 📁 Project Structure

```
backend/
├── server.js              # Main Express app
├── .env                   # Environment variables
├── package.json           # Dependencies
├── data/
│   ├── users.json        # User data with bcrypt hash
│   └── README.md         # Test credentials
├── middleware/
│   └── auth.js           # JWT verification middleware
└── routes/
    ├── auth.js           # Login, refresh, logout endpoints
    └── profile.js        # Protected profile endpoint
```

---

## ⚙️ Environment Variables

Edit `.env` file to customize:

```env
PORT=5000
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

⚠️ **Important:** Change the secret keys in production!

---

## 🎯 Authentication Flow

```
1. User sends email + password
   ↓
2. Server validates credentials
   ↓
3. Server generates Access Token (15min) + Refresh Token (7 days)
   ↓
4. User stores both tokens
   ↓
5. User sends Access Token with each request
   ↓
6. When Access Token expires → Use Refresh Token to get new Access Token
   ↓
7. Repeat until Refresh Token expires → Login again
```

---

## 🛠️ Key Implementation Details

### JWT Middleware (`middleware/auth.js`)
- Extracts Bearer token from Authorization header
- Verifies token signature and expiry
- Attaches decoded user data to `req.user`
- Returns appropriate error codes (401, 403, 500)

### Token Generation
- **Access Token:** Contains userId, email, role - expires in 15 minutes
- **Refresh Token:** Same payload - expires in 7 days
- Both signed with different secret keys for security

### Password Security
- Passwords never stored in plain text
- Bcrypt hash stored in `users.json`
- Password comparison done with `bcrypt.compare()`

---

## 📝 Common Error Responses

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Missing credentials | Email or password not provided |
| 401 | Invalid credentials | Wrong email or password |
| 401 | Token expired | Access token has expired |
| 401 | Access token required | No token in Authorization header |
| 403 | Invalid token | Token is malformed or wrong signature |
| 403 | Invalid refresh token | Refresh token not found or revoked |
| 404 | User not found | User account doesn't exist |
| 500 | Internal server error | Server-side error |

---

## 🚀 Production Considerations

- [ ] Use environment-specific `.env` files
- [ ] Store refresh tokens in Redis or database
- [ ] Add rate limiting to prevent brute force attacks
- [ ] Use HTTPS in production
- [ ] Implement token rotation
- [ ] Add input validation with libraries like Joi
- [ ] Use helmet.js for security headers
- [ ] Implement logging with Winston or Morgan
- [ ] Add user registration endpoint
- [ ] Implement password reset functionality

---

## 📚 Technologies Used

- **Express.js** - Web framework
- **jsonwebtoken** - JWT implementation
- **bcryptjs** - Password hashing
- **dotenv** - Environment configuration
- **cors** - Cross-origin resource sharing

---

## 🎓 Learning Resources

- [JWT.io](https://jwt.io/) - Understand JWT structure
- [bcrypt explained](https://en.wikipedia.org/wiki/Bcrypt)
- [Express.js docs](https://expressjs.com/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
