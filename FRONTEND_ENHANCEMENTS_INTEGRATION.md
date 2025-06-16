# Frontend Integration - New Backend Features

## New Endpoints Available

### Notifications
```javascript
// Get student notifications
GET /api/agenticlearn/student/notifications

// Get educator notifications  
GET /api/agenticlearn/educator/notifications

// Mark notification as read
POST /api/agenticlearn/notifications/mark-read
{
  "notification_id": "...",
  "user_id": "student_001", 
  "user_type": "student"
}
```

## Frontend Updates Required

### 1. Add Notification Display

**Student Portal (agenticlearn-student):**
```javascript
// Add to student-portal-integration.js
async getNotifications() {
    return await this.makeRequest('/student/notifications');
}

// Add to student-dashboard.js
async loadNotifications() {
    try {
        const response = await window.studentPortal.getNotifications();
        if (response.success) {
            displayNotifications(response.data.notifications);
            updateNotificationBadge(response.data.unread_count);
        }
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

function displayNotifications(notifications) {
    const container = document.getElementById('notificationsContainer');
    container.innerHTML = notifications.map(notif => `
        <div class="notification ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
            <h4>${notif.title}</h4>
            <p>${notif.message}</p>
            <span class="priority ${notif.priority}">${notif.priority}</span>
            <time>${new Date(notif.created_at).toLocaleString()}</time>
        </div>
    `).join('');
}
```

**Educator Portal (agenticlearn-educator):**
```javascript
// Add to educator-portal.js
async getNotifications() {
    return await this.makeRequest('/educator/notifications');
}

async markNotificationRead(notificationId) {
    return await this.makeRequest('/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({
            notification_id: notificationId,
            user_id: 'educator_001',
            user_type: 'educator'
        })
    });
}
```

### 2. Add Notification UI Components

**HTML Structure:**
```html
<!-- Add to dashboard -->
<div class="notifications-panel">
    <div class="notifications-header">
        <h3>Notifications</h3>
        <span class="notification-badge" id="notificationBadge">0</span>
    </div>
    <div id="notificationsContainer" class="notifications-list">
        <!-- Notifications will be loaded here -->
    </div>
</div>
```

**CSS Styles:**
```css
.notification {
    padding: 12px;
    border-left: 4px solid #ddd;
    margin-bottom: 8px;
    background: white;
    border-radius: 4px;
}

.notification.unread {
    border-left-color: #4CAF50;
    background: #f8fff8;
}

.notification .priority.high {
    color: #f44336;
    font-weight: bold;
}

.notification .priority.medium {
    color: #ff9800;
}

.notification-badge {
    background: #f44336;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
}
```

### 3. Enhanced Error Handling

**Update API calls to handle new error format:**
```javascript
// Update makeRequest method
async makeRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${this.apiBase}${endpoint}`, {
            headers: {
                'login': this.getPasetoToken(),
                'Content-Type': 'application/json'
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Handle new structured error format
            const error = data.error || {};
            throw new Error(`${error.code || 'API_ERROR'}: ${error.message || 'Request failed'}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

### 4. Caching Integration

**Add cache indicators:**
```javascript
function displayCacheStatus(response) {
    if (response.cached) {
        console.log('📦 Data loaded from cache');
        // Optional: Show cache indicator in UI
        const cacheIndicator = document.getElementById('cacheStatus');
        if (cacheIndicator) {
            cacheIndicator.textContent = '📦 Cached';
            cacheIndicator.style.display = 'inline';
        }
    }
}
```

## Implementation Priority

### High Priority (Implement First):
1. **Notification display** - Users need to see notifications
2. **Mark as read functionality** - Essential UX feature
3. **Enhanced error handling** - Better debugging

### Medium Priority:
1. **Cache status indicators** - Nice to have
2. **Notification filtering** - By type/priority
3. **Real-time updates** - Auto-refresh notifications

## Testing

### Test Notification System:
```javascript
// Test in browser console
const notifications = await window.studentPortal.getNotifications();
console.log('Notifications:', notifications);

// Test mark as read
await window.studentPortal.markNotificationRead('notification_id_here');
```

### Test Enhanced Errors:
```javascript
// Test invalid endpoint
try {
    await window.studentPortal.makeRequest('/invalid-endpoint');
} catch (error) {
    console.log('Error format:', error.message);
}
```

## Deployment

1. **Update JavaScript files** with new methods
2. **Add HTML components** for notifications
3. **Add CSS styles** for notification UI
4. **Test integration** with backend
5. **Deploy to GitHub Pages**

**Estimated time: 2-3 hours per portal**
