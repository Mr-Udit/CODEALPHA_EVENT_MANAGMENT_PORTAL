# Frontend Testing Guide

This guide will help you test the Event Management System frontend application.

## 🚀 Quick Start

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Open the frontend:**
   - Navigate to `http://localhost:3000` in your browser
   - The frontend will automatically load

## 🎯 Frontend Features

### 📱 **Responsive Design**
- **Desktop**: Full-featured interface with grid layouts
- **Tablet**: Adaptive layouts with optimized spacing
- **Mobile**: Single-column layouts with touch-friendly buttons

### 🎨 **Modern UI Components**
- **Navigation Bar**: Sticky header with role-based menu items
- **Event Cards**: Hover effects with registration buttons
- **Forms**: Validation and real-time feedback
- **Modals**: Event details popup
- **Loading Spinner**: Visual feedback during API calls
- **Alert Messages**: Success, error, and warning notifications

## 🧪 Testing Scenarios

### 1. **Public Access (No Login)**
- ✅ View all events
- ✅ Search and filter events
- ✅ View event details in modal
- ❌ Cannot register for events
- ❌ Cannot access profile or admin panel

**Test Steps:**
1. Open `http://localhost:3000`
2. Browse events on the homepage
3. Try searching for events using the search bar
4. Filter events by category
5. Click on an event card to view details
6. Try to register - should redirect to login

### 2. **User Registration**
- ✅ Fill out registration form
- ✅ Validation for required fields
- ✅ Email format validation
- ✅ Password minimum length
- ✅ Phone number format (10 digits)
- ✅ Automatic login after registration

**Test Steps:**
1. Click "Register" in navigation
2. Fill out the form with valid data:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Phone: "1234567890"
   - Address: "123 Main St, City, State"
3. Submit the form
4. Should automatically log in and redirect to events

### 3. **User Login**
- ✅ Login with valid credentials
- ✅ Error handling for invalid credentials
- ✅ Remember login state (localStorage)
- ✅ Automatic logout on token expiration

**Test Steps:**
1. Click "Login" in navigation
2. Enter valid credentials
3. Submit the form
4. Should redirect to events page
5. Refresh the page - should stay logged in
6. Try invalid credentials - should show error

### 4. **Event Registration (User)**
- ✅ Register for available events
- ✅ Cannot register for full events
- ✅ Cannot register twice for same event
- ✅ Unregister from events
- ✅ View registered events in profile

**Test Steps:**
1. Login as a regular user
2. Browse events
3. Click "Register" on an available event
4. Check profile to see registered events
5. Try to register again - should show "Already registered"
6. Click "Unregister" to remove from event

### 5. **User Profile**
- ✅ View personal information
- ✅ See registered events
- ✅ Update profile information
- ✅ Logout functionality

**Test Steps:**
1. Login as a user
2. Click "Profile" in navigation
3. View personal information
4. Check registered events list
5. Click "Logout" - should clear session

### 6. **Admin Panel (Admin Only)**
- ✅ Create new events
- ✅ Manage all users
- ✅ Change user roles
- ✅ Delete users
- ✅ View all event registrations

**Test Steps:**
1. Login as admin (or change user role to admin)
2. Click "Admin Panel" in navigation
3. Create a new event:
   - Fill out all required fields
   - Set future date
   - Submit form
4. View user management section
5. Change a user's role
6. Delete a user (with confirmation)

### 7. **Event Management (Admin)**
- ✅ Create events with all details
- ✅ Set event capacity and pricing
- ✅ Choose event categories
- ✅ View event registrations
- ✅ Monitor event capacity

**Test Steps:**
1. Login as admin
2. Go to Admin Panel
3. Create a new event with:
   - Title: "Tech Conference 2024"
   - Category: Technology
   - Date: Future date
   - Capacity: 100
   - Price: $50
4. Check events page to see the new event
5. Register users for the event
6. Monitor capacity updates

## 🔍 **UI/UX Testing**

### **Visual Elements**
- ✅ **Color Scheme**: Purple gradient theme
- ✅ **Typography**: Clean, readable fonts
- ✅ **Icons**: Font Awesome icons throughout
- ✅ **Animations**: Smooth hover effects and transitions
- ✅ **Spacing**: Consistent padding and margins

### **Responsive Design**
- ✅ **Desktop (1200px+)**: Full grid layout
- ✅ **Tablet (768px-1199px)**: Adaptive grid
- ✅ **Mobile (<768px)**: Single column layout
- ✅ **Touch Targets**: Minimum 44px for mobile buttons

### **Accessibility**
- ✅ **Keyboard Navigation**: Tab through all interactive elements
- ✅ **Screen Reader**: Proper labels and alt text
- ✅ **Color Contrast**: High contrast for readability
- ✅ **Focus Indicators**: Visible focus states

## 🐛 **Error Handling Testing**

### **Network Errors**
1. **Disconnect internet** and try to:
   - Load events
   - Login/register
   - Register for events
   - Should show "Network error" messages

### **Validation Errors**
1. **Registration Form**:
   - Try empty fields
   - Invalid email format
   - Short password
   - Invalid phone number
   - Should show specific error messages

2. **Event Creation**:
   - Try past dates
   - Zero capacity
   - Missing required fields
   - Should show validation errors

### **Authorization Errors**
1. **Access Admin Panel** as regular user
2. **Create Events** as regular user
3. **Manage Users** as regular user
4. Should show "Access denied" messages

## 📊 **Performance Testing**

### **Load Testing**
1. **Multiple Events**: Create 50+ events and test loading
2. **Large User Lists**: Create 100+ users and test admin panel
3. **Event Registration**: Register 100+ users for same event

### **Browser Compatibility**
- ✅ **Chrome**: Full functionality
- ✅ **Firefox**: Full functionality
- ✅ **Safari**: Full functionality
- ✅ **Edge**: Full functionality

## 🛠️ **Developer Tools Testing**

### **Console Testing**
1. Open browser developer tools
2. Check for JavaScript errors
3. Monitor network requests
4. Test localStorage functionality

### **API Integration**
1. Monitor API calls in Network tab
2. Verify request/response formats
3. Check authentication headers
4. Test error responses

## 📱 **Mobile Testing**

### **Touch Interactions**
- ✅ Tap to register/unregister
- ✅ Swipe through event cards
- ✅ Tap to open modals
- ✅ Form input on mobile keyboard

### **Mobile Browsers**
- ✅ **iOS Safari**: Full functionality
- ✅ **Android Chrome**: Full functionality
- ✅ **Mobile Firefox**: Full functionality

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Events Not Loading**
   - Check if backend server is running
   - Verify MongoDB connection
   - Check browser console for errors

2. **Login Not Working**
   - Verify email/password
   - Check if user exists in database
   - Clear browser localStorage

3. **Admin Panel Not Accessible**
   - Verify user role is 'admin'
   - Check JWT token validity
   - Try logging out and back in

4. **Registration Fails**
   - Check all required fields
   - Verify email format
   - Ensure password is 6+ characters
   - Check if email already exists

### **Debug Mode**
1. Open browser developer tools
2. Check Console tab for errors
3. Monitor Network tab for failed requests
4. Check Application tab for localStorage

## 🎯 **Test Data Setup**

### **Create Test Users**
```bash
# Create admin user
node scripts/createAdmin.js

# Admin credentials:
# Email: admin@example.com
# Password: admin123
```

### **Create Test Events**
1. Login as admin
2. Go to Admin Panel
3. Create multiple events with different:
   - Categories
   - Capacities
   - Prices
   - Dates

### **Test Scenarios**
1. **Empty System**: Test with no events/users
2. **Full Events**: Create events at capacity
3. **Past Events**: Create events with past dates
4. **Large Data**: Test with many events/users

## 📈 **Success Criteria**

### **Functional Requirements**
- ✅ All API endpoints work correctly
- ✅ User authentication and authorization
- ✅ Event creation and management
- ✅ User registration for events
- ✅ Admin user management
- ✅ Responsive design on all devices

### **User Experience**
- ✅ Intuitive navigation
- ✅ Clear error messages
- ✅ Loading states
- ✅ Smooth animations
- ✅ Consistent design

### **Technical Requirements**
- ✅ No JavaScript errors
- ✅ Proper API integration
- ✅ Local storage management
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness

## 🚀 **Next Steps**

After testing, consider implementing:
1. **Email notifications** for event registrations
2. **File upload** for event images
3. **Payment integration** for paid events
4. **Real-time updates** with WebSocket
5. **Advanced filtering** and search
6. **Event analytics** and reporting 