// Global variables
let currentUser = null;
let authToken = localStorage.getItem('authToken');
const API_BASE_URL = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadEvents();
    
    // Check if user is already logged in
    if (authToken) {
        checkAuthStatus();
    }
});

// Initialize the application
function initializeApp() {
    // Set minimum date for event creation to today
    const today = new Date().toISOString().split('T')[0];
    const eventDateInput = document.getElementById('eventDate');
    if (eventDateInput) {
        eventDateInput.min = today;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Create event form
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', handleCreateEvent);
    }

    // Modal close
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Load section-specific data
    switch(sectionId) {
        case 'events':
            loadEvents();
            break;
        case 'profile':
            if (currentUser) {
                loadUserProfile();
            }
            break;
        case 'admin':
            if (currentUser && currentUser.role === 'admin') {
                loadUsers();
            }
            break;
    }
}

// Authentication functions
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateNavigation();
            showAlert('Login successful!', 'success');
            showSection('events');
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        phone: document.getElementById('registerPhone').value,
        address: document.getElementById('registerAddress').value
    };

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateNavigation();
            showAlert('Registration successful!', 'success');
            showSection('events');
        } else {
            if (data.errors) {
                const errorMessages = data.errors.map(error => error.msg).join(', ');
                showAlert(errorMessages, 'error');
            } else {
                showAlert(data.message || 'Registration failed', 'error');
            }
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateNavigation();
        } else {
            logout();
        }
    } catch (error) {
        logout();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateNavigation();
    showSection('events');
    showAlert('Logged out successfully', 'success');
}

function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const adminLink = document.getElementById('adminLink');
    const logoutLink = document.getElementById('logoutLink');

    if (currentUser) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        profileLink.style.display = 'inline-block';
        logoutLink.style.display = 'inline-block';
        
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'inline-block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginLink.style.display = 'inline-block';
        registerLink.style.display = 'inline-block';
        profileLink.style.display = 'none';
        adminLink.style.display = 'none';
        logoutLink.style.display = 'none';
    }
}

// Event functions
async function loadEvents() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/events`);
        const data = await response.json();

        if (data.success) {
            displayEvents(data.data.events);
        } else {
            showAlert('Failed to load events', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function displayEvents(events) {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;

    if (events.length === 0) {
        eventsList.innerHTML = '<p class="no-events">No events found.</p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="event-card" onclick="showEventDetails('${event._id}')">
            <div class="event-image">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <span class="event-category ${event.category}">${event.category}</span>
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-calendar"></i>
                        ${new Date(event.date).toLocaleDateString()}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-clock"></i>
                        ${event.time}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-users"></i>
                        ${event.registeredUsers.length}/${event.capacity} registered
                    </div>
                </div>
                <div class="event-price">
                    ${event.price > 0 ? `$${event.price}` : 'Free'}
                </div>
                <div class="event-actions">
                    ${currentUser ? 
                        (event.registeredUsers.includes(currentUser.id) ?
                            `<button class="btn btn-danger" onclick="event.stopPropagation(); unregisterFromEvent('${event._id}')">Unregister</button>` :
                            `<button class="btn btn-success" onclick="event.stopPropagation(); registerForEvent('${event._id}')" ${event.registeredUsers.length >= event.capacity ? 'disabled' : ''}>${event.registeredUsers.length >= event.capacity ? 'Full' : 'Register'}</button>`
                        ) : 
                        `<button class="btn btn-secondary" onclick="event.stopPropagation(); showSection('login')">Login to Register</button>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

async function showEventDetails(eventId) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const data = await response.json();

        if (data.success) {
            const event = data.data.event;
            const modal = document.getElementById('eventModal');
            const modalContent = document.getElementById('modalContent');

            modalContent.innerHTML = `
                <h2>${event.title}</h2>
                <span class="event-category ${event.category}">${event.category}</span>
                <p><strong>Description:</strong> ${event.description}</p>
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <strong>Location:</strong> ${event.location}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-calendar"></i>
                        <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-clock"></i>
                        <strong>Time:</strong> ${event.time}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-users"></i>
                        <strong>Capacity:</strong> ${event.registeredUsers.length}/${event.capacity}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-dollar-sign"></i>
                        <strong>Price:</strong> ${event.price > 0 ? `$${event.price}` : 'Free'}
                    </div>
                </div>
                ${event.registeredUsers.length > 0 ? `
                    <h3>Registered Users (${event.registeredUsers.length})</h3>
                    <div class="registered-users">
                        ${event.registeredUsers.map(user => `
                            <div class="user-item">
                                <span>${user.name}</span>
                                <span>${user.email}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `;

            modal.style.display = 'block';
        } else {
            showAlert('Failed to load event details', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function registerForEvent(eventId) {
    if (!currentUser) {
        showAlert('Please login to register for events', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Successfully registered for the event!', 'success');
            loadEvents();
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function unregisterFromEvent(eventId) {
    if (!currentUser) {
        showAlert('Please login to unregister from events', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Successfully unregistered from the event!', 'success');
            loadEvents();
        } else {
            showAlert(data.message || 'Unregistration failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Admin functions
async function handleCreateEvent(event) {
    event.preventDefault();
    
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('Admin access required', 'error');
        return;
    }

    const formData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        capacity: parseInt(document.getElementById('eventCapacity').value),
        category: document.getElementById('eventCategory').value,
        price: parseFloat(document.getElementById('eventPrice').value) || 0
    };

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Event created successfully!', 'success');
            event.target.reset();
            loadEvents();
        } else {
            if (data.errors) {
                const errorMessages = data.errors.map(error => error.msg).join(', ');
                showAlert(errorMessages, 'error');
            } else {
                showAlert(data.message || 'Failed to create event', 'error');
            }
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function loadUsers() {
    if (!currentUser || currentUser.role !== 'admin') {
        return;
    }

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            displayUsers(data.data.users);
        } else {
            showAlert('Failed to load users', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    if (!usersList) return;

    if (users.length === 0) {
        usersList.innerHTML = '<p>No users found.</p>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.email}</div>
            </div>
            <span class="user-role ${user.role}">${user.role}</span>
            <div class="user-actions">
                ${user.role === 'user' ? 
                    `<button class="btn btn-success" onclick="changeUserRole('${user._id}', 'admin')">Make Admin</button>` :
                    `<button class="btn btn-secondary" onclick="changeUserRole('${user._id}', 'user')">Make User</button>`
                }
                <button class="btn btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function changeUserRole(userId, newRole) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ role: newRole })
        });

        const data = await response.json();

        if (data.success) {
            showAlert(`User role changed to ${newRole}`, 'success');
            loadUsers();
        } else {
            showAlert(data.message || 'Failed to change user role', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert('User deleted successfully', 'success');
            loadUsers();
        } else {
            showAlert(data.message || 'Failed to delete user', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Profile functions
async function loadUserProfile() {
    if (!currentUser) return;

    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const user = data.data.user;
            
            // Update profile info
            document.getElementById('profileName').textContent = user.name;
            document.getElementById('profileEmail').textContent = user.email;
            document.getElementById('profilePhone').textContent = user.phone;
            document.getElementById('profileAddress').textContent = user.address;
            document.getElementById('profileRole').textContent = user.role;

            // Display user's events
            if (user.registeredEvents && user.registeredEvents.length > 0) {
                displayUserEvents(user.registeredEvents);
            } else {
                document.getElementById('userEvents').innerHTML = '<p>No registered events.</p>';
            }
        } else {
            showAlert('Failed to load profile', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function displayUserEvents(events) {
    const userEvents = document.getElementById('userEvents');
    if (!userEvents) return;

    userEvents.innerHTML = events.map(event => `
        <div class="event-card">
            <div class="event-image">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <span class="event-category ${event.category}">${event.category}</span>
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-calendar"></i>
                        ${new Date(event.date).toLocaleDateString()}
                    </div>
                    <div class="event-detail">
                        <i class="fas fa-clock"></i>
                        ${event.time}
                    </div>
                </div>
                <div class="event-actions">
                    <button class="btn btn-danger" onclick="unregisterFromEvent('${event._id}')">Unregister</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter functions
function filterEvents() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const title = card.querySelector('.event-title').textContent.toLowerCase();
        const category = card.querySelector('.event-category').textContent;
        
        const matchesCategory = !categoryFilter || category === categoryFilter;
        const matchesSearch = !searchFilter || title.includes(searchFilter);
        
        card.style.display = matchesCategory && matchesSearch ? 'block' : 'none';
    });
}

// Utility functions
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // Insert at the top of the main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(alert, mainContent.firstChild);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
} 