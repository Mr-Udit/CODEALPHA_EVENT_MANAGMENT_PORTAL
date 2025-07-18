# Event Management System

A Node.js-based event management system with role-based access control. Only admins can create events, while users can register for events.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Event Management**: Admin-only event creation, editing, and deletion
- **Event Registration**: Users can register and unregister for events
- **User Management**: Admin can manage users and their roles
- **Data Validation**: Comprehensive input validation using express-validator
- **MongoDB Integration**: MongoDB database with Mongoose ODM
- **Security**: Password hashing with bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Update `config.env` with your values:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/event_management
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

3. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas and update the connection string

4. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St, City, State"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Event Endpoints

#### Create Event (Admin Only)
```http
POST /api/events
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference featuring industry experts",
  "date": "2024-06-15",
  "time": "09:00 AM",
  "location": "Convention Center, Downtown",
  "capacity": 500,
  "category": "Technology",
  "price": 50
}
```

#### Get All Events
```http
GET /api/events
GET /api/events?category=Technology
GET /api/events?status=upcoming
GET /api/events?search=conference
```

#### Register for Event
```http
POST /api/events/:id/register
Authorization: Bearer <token>
```

#### Unregister from Event
```http
DELETE /api/events/:id/register
Authorization: Bearer <token>
```

### User Management Endpoints (Admin Only)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <admin_token>
```

#### Change User Role
```http
POST /api/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}
```

## Role-Based Access Control

### Admin Permissions
- Create, read, update, delete events
- Manage all users (view, update, delete, change roles)
- View all event registrations
- Access to all system features

### User Permissions
- View events (public)
- Register/unregister for events
- Update own profile
- View own registered events

## Testing the API

### Using cURL

1. **Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "address": "123 Main St, City, State"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Health Check

```http
GET /api/health
```

Returns:
```json
{
  "status": "OK",
  "message": "Event Management System is running"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/event_management |
| JWT_SECRET | JWT secret key | your_jwt_secret_key_here_change_in_production |
| NODE_ENV | Environment mode | development | #   C O D E A L P H A _ E V E N T _ M A N A G M E N T _ P O R T A L  
 