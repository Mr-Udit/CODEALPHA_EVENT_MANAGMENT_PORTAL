# API Testing Guide

This guide will help you test the Event Management System API step by step.

## Prerequisites

1. Make sure MongoDB is running
2. Start the server: `npm run dev`
3. Use a tool like Postman, cURL, or any API testing tool

## Step 1: Test Server Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Event Management System is running"
}
```

## Step 2: Create a Regular User

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

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": "1234567890",
      "address": "123 Main St, City, State"
    },
    "token": "..."
  }
}
```

## Step 3: Login with the User

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the token from the response for future requests.

## Step 4: Create an Admin User

Run the admin creation script:
```bash
node scripts/createAdmin.js
```

Or manually create an admin user by updating a user's role (you'll need to do this through the database or create a temporary admin creation endpoint).

## Step 5: Login as Admin

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the admin token.

## Step 6: Create an Event (Admin Only)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference featuring industry experts and latest trends",
    "date": "2024-06-15",
    "time": "09:00 AM",
    "location": "Convention Center, Downtown",
    "capacity": 500,
    "category": "Technology",
    "price": 50
  }'
```

## Step 7: Get All Events (Public)

```bash
curl http://localhost:3000/api/events
```

## Step 8: Register for Event (User)

```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/register \
  -H "Authorization: Bearer USER_TOKEN"
```

Replace `EVENT_ID` with the actual event ID from step 6.

## Step 9: Get User Profile

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer USER_TOKEN"
```

This should show the user's registered events.

## Step 10: Get All Users (Admin Only)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Step 11: Change User Role (Admin Only)

```bash
curl -X POST http://localhost:3000/api/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

## Step 12: Unregister from Event

```bash
curl -X DELETE http://localhost:3000/api/events/EVENT_ID/register \
  -H "Authorization: Bearer USER_TOKEN"
```

## Testing with Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:3000`
   - `user_token`: (from login response)
   - `admin_token`: (from admin login response)
   - `event_id`: (from create event response)

3. **Create Requests**:
   - Register User: `POST {{base_url}}/api/auth/register`
   - Login User: `POST {{base_url}}/api/auth/login`
   - Create Event: `POST {{base_url}}/api/events`
   - Get Events: `GET {{base_url}}/api/events`
   - Register for Event: `POST {{base_url}}/api/events/{{event_id}}/register`

## Common Test Scenarios

### 1. User Registration Validation
- Try registering with invalid email
- Try registering with short password
- Try registering with existing email

### 2. Event Creation Validation
- Try creating event without admin token
- Try creating event with past date
- Try creating event with invalid category

### 3. Event Registration Validation
- Try registering for full event
- Try registering for past event
- Try registering twice for same event

### 4. Authorization Tests
- Try accessing admin endpoints with user token
- Try accessing protected endpoints without token
- Try accessing user endpoints with invalid token

## Error Response Examples

### Validation Error
```json
{
  "success": false,
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please provide a valid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Event not found"
}
```

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test GET events endpoint
ab -n 100 -c 10 http://localhost:3000/api/events

# Test POST registration endpoint
ab -n 50 -c 5 -p registration_data.json -T application/json http://localhost:3000/api/events/EVENT_ID/register
```

## Security Testing

1. **SQL Injection**: Try malicious input in search parameters
2. **XSS**: Test with script tags in text fields
3. **Token Tampering**: Modify JWT tokens
4. **Rate Limiting**: Make rapid requests to test rate limiting

## Database Testing

1. **Connection**: Verify MongoDB connection
2. **CRUD Operations**: Test all database operations
3. **Indexes**: Check if proper indexes are created
4. **Data Integrity**: Verify foreign key relationships

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in config.env
   - Check network connectivity

2. **JWT Token Invalid**
   - Ensure token is not expired
   - Check JWT_SECRET in config.env
   - Verify token format

3. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Check data types and constraints

4. **Authorization Errors**
   - Verify user role
   - Check token validity
   - Ensure proper endpoint access

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in config.env.

## Next Steps

1. **Frontend Development**: Create a React/Vue.js frontend
2. **Email Notifications**: Add email confirmation for registrations
3. **File Upload**: Implement event image upload
4. **Payment Integration**: Add payment processing for paid events
5. **Analytics**: Add event analytics and reporting
6. **Mobile App**: Develop mobile application 