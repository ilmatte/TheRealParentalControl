# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Tutti gli endpoint (eccetto login e register) richiedono un JWT token nel header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "parent@example.com",
  "password": "securepassword123",
  "username": "John Parent",
  "role": "parent"  // o "child"
}

Response:
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "parent@example.com",
    "username": "John Parent",
    "role": "parent"
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "parent@example.com",
  "password": "securepassword123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "parent@example.com",
    "username": "John Parent",
    "role": "parent",
    "family_id": "507f1f77bcf86cd799439012"
  }
}
```

#### Get Current User
```
GET /auth/me

Response:
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "parent@example.com",
  "username": "John Parent",
  "role": "parent",
  "family_id": "507f1f77bcf86cd799439012",
  "preferences": {
    "notifications": true,
    "theme": "light"
  }
}
```

### Devices

#### Register Device
```
POST /devices/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "device_id": "device-uuid-12345",
  "device_name": "Tommy's Laptop",
  "os": "windows",
  "os_version": "10",
  "chrome_version": "120.0.0"
}

Response:
{
  "message": "Device registered successfully",
  "device": {
    "_id": "507f1f77bcf86cd799439013",
    "user_id": "507f1f77bcf86cd799439011",
    "device_id": "device-uuid-12345",
    "device_name": "Tommy's Laptop",
    "os": "windows",
    "os_version": "10",
    "chrome_version": "120.0.0",
    "is_active": true,
    "last_sync": "2024-04-30T10:00:00Z"
  }
}
```

#### Get User Devices
```
GET /devices/list
Authorization: Bearer <token>

Response:
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "user_id": "507f1f77bcf86cd799439011",
    "device_id": "device-uuid-12345",
    "device_name": "Tommy's Laptop",
    "os": "windows",
    "os_version": "10",
    "chrome_version": "120.0.0",
    "is_active": true,
    "last_sync": "2024-04-30T10:00:00Z"
  }
]
```

#### Sync Device
```
PUT /devices/:device_id/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "chrome_version": "120.0.1",
  "os_version": "10"
}

Response:
{
  "message": "Device synced",
  "device": { ... }
}
```

#### Get Device Details
```
GET /devices/:device_id
Authorization: Bearer <token>

Response:
{
  "_id": "507f1f77bcf86cd799439013",
  "user_id": "507f1f77bcf86cd799439011",
  "device_id": "device-uuid-12345",
  "device_name": "Tommy's Laptop",
  ...
}
```

### Restrictions

#### Create Restriction
```
POST /restrictions
Authorization: Bearer <token>
Content-Type: application/json

{
  "child_id": "507f1f77bcf86cd799439014",
  "device_id": "507f1f77bcf86cd799439013",
  "blocked_websites": ["facebook.com", "instagram.com"],
  "allowed_websites": ["wikipedia.org"],
  "daily_time_limit": 120,
  "usage_schedule": {
    "monday": { "start": "08:00", "end": "22:00" },
    "sunday": { "start": "09:00", "end": "22:00" }
  }
}

Response:
{
  "message": "Restriction created",
  "restriction": {
    "_id": "507f1f77bcf86cd799439015",
    "child_id": "507f1f77bcf86cd799439014",
    "device_id": "507f1f77bcf86cd799439013",
    "parent_id": "507f1f77bcf86cd799439011",
    "blocked_websites": ["facebook.com", "instagram.com"],
    "daily_time_limit": 120,
    ...
  }
}
```

#### Get Child Restrictions
```
GET /restrictions/child/:child_id
Authorization: Bearer <token>

Response:
{
  "_id": "507f1f77bcf86cd799439015",
  "child_id": { ... },
  "device_id": { ... },
  "blocked_websites": ["facebook.com", "instagram.com"],
  "daily_time_limit": 120,
  "screen_lock": {
    "enabled": false,
    "locked_at": null,
    "reason": null
  },
  ...
}
```

#### Update Restriction
```
PUT /restrictions/:restriction_id
Authorization: Bearer <token>
Content-Type: application/json

{
  "daily_time_limit": 150,
  "blocked_websites": ["facebook.com", "tiktok.com"]
}

Response:
{
  "message": "Restriction updated",
  "restriction": { ... }
}
```

#### Block Website
```
POST /restrictions/:restriction_id/block-website
Authorization: Bearer <token>
Content-Type: application/json

{
  "website": "youtube.com"
}

Response:
{
  "message": "Website blocked",
  "restriction": { ... }
}
```

#### Unblock Website
```
POST /restrictions/:restriction_id/unblock-website
Authorization: Bearer <token>
Content-Type: application/json

{
  "website": "youtube.com"
}

Response:
{
  "message": "Website unblocked",
  "restriction": { ... }
}
```

#### Lock Screen
```
POST /restrictions/:restriction_id/lock-screen
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Time limit reached"
}

Response:
{
  "message": "Screen locked",
  "restriction": { ... }
}
```

#### Unlock Screen
```
POST /restrictions/:restriction_id/unlock-screen
Authorization: Bearer <token>

Response:
{
  "message": "Screen unlocked",
  "restriction": { ... }
}
```

### Activity

#### Log Activity
```
POST /activity/log
Authorization: Bearer <token>
Content-Type: application/json

{
  "device_id": "507f1f77bcf86cd799439013",
  "activity_type": "website_visit",
  "details": {
    "url": "https://google.com",
    "title": "Google",
    "duration": 300
  }
}

Response:
{
  "message": "Activity logged",
  "activity": {
    "_id": "507f1f77bcf86cd799439016",
    "child_id": "507f1f77bcf86cd799439011",
    "device_id": "507f1f77bcf86cd799439013",
    "activity_type": "website_visit",
    "details": {
      "url": "https://google.com",
      "title": "Google",
      "duration": 300
    },
    "timestamp": "2024-04-30T10:00:00Z"
  }
}
```

#### Get Child Activity
```
GET /activity/child/:child_id?limit=100&start_date=2024-04-30&end_date=2024-05-01
Authorization: Bearer <token>

Response:
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "child_id": "507f1f77bcf86cd799439011",
    "device_id": "507f1f77bcf86cd799439013",
    "activity_type": "website_visit",
    "details": { ... },
    "timestamp": "2024-04-30T10:00:00Z"
  }
]
```

#### Get Website Visits Summary
```
GET /activity/child/:child_id/websites
Authorization: Bearer <token>

Response:
[
  {
    "_id": "https://google.com",
    "visits": 45,
    "lastVisit": "2024-04-30T10:00:00Z",
    "totalTime": 3600
  }
]
```

#### Get Screen Time Summary
```
GET /activity/child/:child_id/screen-time
Authorization: Bearer <token>

Response:
[
  {
    "_id": "2024-04-30",
    "totalTime": 7200,
    "count": 15
  },
  {
    "_id": "2024-04-29",
    "totalTime": 5400,
    "count": 12
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "param": "email",
      "msg": "Invalid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Device not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

## WebSocket Events

### Client to Server

#### register-device
```javascript
socket.emit('register-device', {
  device_id: 'device-uuid-12345',
  user_id: '507f1f77bcf86cd799439011'
});
```

#### join-parent-room
```javascript
socket.emit('join-parent-room', {
  parent_id: '507f1f77bcf86cd799439011'
});
```

#### activity-update
```javascript
socket.emit('activity-update', {
  device_id: '507f1f77bcf86cd799439013',
  child_id: '507f1f77bcf86cd799439011',
  activity_type: 'website_visit',
  details: {
    url: 'https://google.com',
    title: 'Google'
  }
});
```

#### check-website
```javascript
socket.emit('check-website', {
  device_id: '507f1f77bcf86cd799439013',
  url: 'https://facebook.com',
  child_id: '507f1f77bcf86cd799439011'
});
```

### Server to Client

#### website-check-result
```javascript
socket.on('website-check-result', (data) => {
  // { url, blocked, timestamp }
});
```

#### screen-lock
```javascript
socket.on('screen-lock', (data) => {
  // { reason }
});
```

#### screen-unlock
```javascript
socket.on('screen-unlock', (data) => {
  // {}
});
```

## Rate Limiting
- Login attempts: 5 per minute
- API requests: 100 per minute
- WebSocket messages: 50 per minute

## Versioning
Current API version: v1
The API uses semantic versioning for future updates.
