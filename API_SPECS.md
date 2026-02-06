# API Specifications for Ottering - Advice and Listening App

## Base URL
```
Production: https://api.ottering.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 1. Authentication & User Management

### 1.1 User Signup
**POST** `/auth/signup`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string (min 8 chars)",
  "birthYear": "string",
  "birthMonth": "string",
  "gender": "male | female | non-binary | prefer-not-to-say"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "email": "string",
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### 1.2 User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "USER | LISTENER",
    "accessToken": "string",
    "refreshToken": "string",
    "profileComplete": "boolean"
  }
}
```

### 1.3 Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### 1.4 Get User Profile
**GET** `/users/me`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "displayName": "string",
    "bio": "string",
    "profileImage": "string (URL)",
    "birthYear": "string",
    "birthMonth": "string",
    "gender": "string",
    "role": "USER | LISTENER",
    "createdAt": "ISO 8601 datetime"
  }
}
```

### 1.5 Update User Profile
**PATCH** `/users/me`

**Request Body:**
```json
{
  "displayName": "string (optional)",
  "bio": "string (optional)",
  "profileImage": "string (base64 or URL, optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "displayName": "string",
    "bio": "string",
    "profileImage": "string"
  }
}
```

---

## 2. Listener Management

### 2.1 Get All Listeners (Browse)
**GET** `/listeners`

**Query Parameters:**
- `search`: string (optional) - Search by name, title, or bio
- `category`: string (optional) - Filter by category
- `minPrice`: number (optional) - Minimum price per hour
- `maxPrice`: number (optional) - Maximum price per hour
- `tone`: string[] (optional) - Filter by tone (comma-separated)
- `relationalEnergy`: string[] (optional) - Filter by relational energy
- `approach`: string[] (optional) - Filter by approach
- `verifiedOnly`: boolean (optional) - Show only verified listeners
- `minRating`: number (optional) - Minimum rating (0-5)
- `availability`: "available | busy | offline" (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listeners": [
      {
        "id": "string",
        "name": "string",
        "title": "string",
        "bio": "string",
        "categories": ["string"],
        "rating": "number",
        "reviewCount": "number",
        "pricePerHour": "number",
        "availability": "available | busy | offline",
        "image": "string (URL)",
        "verified": "boolean",
        "experience": "string",
        "industry": "string",
        "tone": ["string"],
        "relationalEnergy": ["string"],
        "approach": ["string"]
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

### 2.2 Get Listener Details
**GET** `/listeners/:listenerId`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "title": "string",
    "bio": "string",
    "categories": ["string"],
    "rating": "number",
    "reviewCount": "number",
    "pricePerHour": "number",
    "price30Min": "number",
    "price60Min": "number",
    "price120Min": "number",
    "availability": "available | busy | offline",
    "image": "string",
    "verified": "boolean",
    "experience": "string",
    "industry": "string",
    "tone": ["string"],
    "relationalEnergy": ["string"],
    "approach": ["string"],
    "portfolioUrl": "string",
    "availabilitySchedule": {
      "monday": {
        "enabled": "boolean",
        "slots": [{ "start": "HH:mm", "end": "HH:mm" }]
      }
      // ... other days
    }
  }
}
```

### 2.3 Get Listener Reviews
**GET** `/listeners/:listenerId/reviews`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "string",
        "userId": "string",
        "userName": "string",
        "rating": "number",
        "comment": "string",
        "date": "ISO 8601 datetime"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number"
    }
  }
}
```

### 2.4 Become a Listener (Onboarding)
**POST** `/listeners/onboard`

**Request Body:**
```json
{
  "name": "string",
  "title": "string",
  "bio": "string",
  "categories": ["string"],
  "experience": "string",
  "industry": "string",
  "pricePerHour": "number",
  "price30Min": "number",
  "price60Min": "number",
  "price120Min": "number",
  "tone": ["string"],
  "relationalEnergy": ["string"],
  "approach": ["string"],
  "portfolioUrl": "string",
  "portfolioFile": "file (optional)",
  "bankDetails": {
    "accountName": "string",
    "accountNumber": "string",
    "routingNumber": "string"
  },
  "availability": {
    "monday": {
      "enabled": "boolean",
      "slots": [{ "start": "HH:mm", "end": "HH:mm" }]
    }
    // ... other days
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "listenerId": "string",
    "status": "pending_verification",
    "message": "Your listener profile has been submitted for verification"
  }
}
```

### 2.5 Update Listener Profile
**PATCH** `/listeners/me`

**Request Body:** (Same as onboarding, all fields optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listenerId": "string",
    "message": "Profile updated successfully"
  }
}
```

---

## 3. Booking & Sessions

### 3.1 Create Booking
**POST** `/bookings`

**Request Body:**
```json
{
  "listenerId": "string",
  "duration": "30 | 60 | 120",
  "scheduledTime": "ISO 8601 datetime (optional for instant)",
  "isInstant": "boolean",
  "notes": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "bookingId": "string",
    "listenerId": "string",
    "duration": "number",
    "scheduledTime": "ISO 8601 datetime",
    "price": "number",
    "status": "pending_payment",
    "paymentIntentId": "string"
  }
}
```

### 3.2 Get User Sessions
**GET** `/sessions`

**Query Parameters:**
- `status`: "upcoming | completed | cancelled" (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "string",
        "listenerId": "string",
        "listenerName": "string",
        "listenerImage": "string",
        "date": "ISO 8601 date",
        "time": "string",
        "duration": "number",
        "status": "upcoming | completed | cancelled",
        "price": "number",
        "type": "Video Call | Phone Call | Text Chat"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number"
    }
  }
}
```

### 3.3 Cancel Session
**POST** `/sessions/:sessionId/cancel`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "status": "cancelled",
    "refundAmount": "number",
    "message": "Session cancelled and refunded"
  }
}
```

### 3.4 Get Listener Session Requests (Listener Dashboard)
**GET** `/listeners/me/requests`

**Query Parameters:**
- `status`: "pending | accepted | declined" (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "string",
        "clientName": "string",
        "clientId": "string",
        "date": "ISO 8601 date",
        "time": "string",
        "duration": "number",
        "price": "number",
        "status": "pending | accepted | declined",
        "timestamp": "ISO 8601 datetime"
      }
    ]
  }
}
```

### 3.5 Accept/Decline Session Request
**POST** `/listeners/me/requests/:requestId/respond`

**Request Body:**
```json
{
  "action": "accept | decline"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "requestId": "string",
    "status": "accepted | declined",
    "message": "Session request accepted/declined"
  }
}
```

---

## 4. Messaging & Chat

### 4.1 Get All Chats
**GET** `/chats`

**Query Parameters:**
- `status`: "scheduled | active | completed" (optional)
- `search`: string (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "string",
        "listenerId": "string",
        "listenerName": "string",
        "listenerImage": "string",
        "scheduledTime": "ISO 8601 datetime",
        "status": "scheduled | active | completed",
        "lastMessage": "string",
        "lastMessageTime": "ISO 8601 datetime",
        "unreadCount": "number",
        "isInstant": "boolean"
      }
    ]
  }
}
```

### 4.2 Get Chat Messages
**GET** `/chats/:chatId/messages`

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "string",
        "senderId": "string",
        "senderName": "string",
        "message": "string",
        "timestamp": "ISO 8601 datetime",
        "isRead": "boolean"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number"
    }
  }
}
```

### 4.3 Send Message
**POST** `/chats/:chatId/messages`

**Request Body:**
```json
{
  "message": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "messageId": "string",
    "senderId": "string",
    "message": "string",
    "timestamp": "ISO 8601 datetime"
  }
}
```

### 4.4 Mark Messages as Read
**POST** `/chats/:chatId/read`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chatId": "string",
    "markedAsRead": "number"
  }
}
```

---

## 5. Reviews & Ratings

### 5.1 Submit Review
**POST** `/reviews`

**Request Body:**
```json
{
  "sessionId": "string",
  "listenerId": "string",
  "rating": "number (1-5)",
  "comment": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "reviewId": "string",
    "rating": "number",
    "comment": "string",
    "date": "ISO 8601 datetime"
  }
}
```

---

## 6. Payments

### 6.1 Create Payment Intent
**POST** `/payments/intent`

**Request Body:**
```json
{
  "bookingId": "string",
  "amount": "number",
  "paymentMethod": "credit_card | debit_card | e-wallet"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "paymentIntentId": "string",
    "clientSecret": "string",
    "amount": "number",
    "currency": "IDR"
  }
}
```

### 6.2 Confirm Payment
**POST** `/payments/:paymentIntentId/confirm`

**Request Body:**
```json
{
  "paymentMethodId": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "paymentId": "string",
    "status": "succeeded | failed",
    "bookingId": "string",
    "sessionId": "string"
  }
}
```

### 6.3 Get Listener Earnings
**GET** `/listeners/me/earnings`

**Query Parameters:**
- `startDate`: ISO 8601 date (optional)
- `endDate`: ISO 8601 date (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEarnings": "number",
    "availableForWithdrawal": "number",
    "pendingEarnings": "number",
    "transactions": [
      {
        "id": "string",
        "type": "session_payment | withdrawal",
        "amount": "number",
        "status": "completed | pending",
        "date": "ISO 8601 datetime",
        "description": "string"
      }
    ]
  }
}
```

### 6.4 Request Withdrawal
**POST** `/listeners/me/withdrawals`

**Request Body:**
```json
{
  "amount": "number",
  "bankAccountId": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "withdrawalId": "string",
    "amount": "number",
    "status": "pending",
    "estimatedArrival": "ISO 8601 date",
    "message": "Withdrawal request submitted"
  }
}
```

---

## 7. Statistics & Analytics

### 7.1 Get Listener Dashboard Stats
**GET** `/listeners/me/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEarnings": "number",
    "totalSessions": "number",
    "hoursLogged": "number",
    "averageRating": "number",
    "trends": {
      "earningsTrend": "string (e.g., '+12%')",
      "sessionsTrend": "string",
      "hoursTrend": "string",
      "ratingTrend": "string"
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

---

## WebSocket Events (Real-time Features)

### Connection
```
ws://api.ottering.com/ws?token=<access_token>
```

### Events:

#### 1. New Message
```json
{
  "event": "message:new",
  "data": {
    "chatId": "string",
    "messageId": "string",
    "senderId": "string",
    "senderName": "string",
    "message": "string",
    "timestamp": "ISO 8601 datetime"
  }
}
```

#### 2. Listener Availability Changed
```json
{
  "event": "listener:availability",
  "data": {
    "listenerId": "string",
    "availability": "available | busy | offline"
  }
}
```

#### 3. Session Request (for listeners)
```json
{
  "event": "session:request",
  "data": {
    "requestId": "string",
    "clientName": "string",
    "scheduledTime": "ISO 8601 datetime",
    "duration": "number",
    "price": "number"
  }
}
```

#### 4. Session Status Update
```json
{
  "event": "session:status",
  "data": {
    "sessionId": "string",
    "status": "upcoming | active | completed | cancelled"
  }
}
```
