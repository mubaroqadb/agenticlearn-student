# 🎓 Student Portal Authentication Fix
## agenticlearn-student Repository - Critical Update Guide

**Repository**: agenticlearn-student  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 hours

---

## 🎯 **SPECIFIC CHANGES FOR STUDENT PORTAL**

### **1. Update student-portal-integration.js**

#### **Current Issues:**
```javascript
// ❌ WRONG - Current implementation
class StudentPortalManager {
    constructor() {
        this.token = this.getCookie('student_token'); // Wrong token name
        this.apiBase = 'https://...';
    }
    
    async makeRequest(endpoint, options = {}) {
        const headers = {
            'Authorization': 'Bearer ' + this.token, // Wrong header
            'Content-Type': 'application/json'
        };
    }
}
```

#### **✅ FIXED Implementation:**
```javascript
// ✅ CORRECT - Updated implementation
class StudentPortalManager {
    constructor() {
        this.pasetoToken = this.getPasetoToken(); // Correct token handling
        this.apiBase = 'https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn';
    }
    
    getPasetoToken() {
        // Try multiple token names for compatibility
        const tokenNames = ['paseto_token', 'login', 'access_token', 'student_token'];
        for (const name of tokenNames) {
            const token = this.getCookie(name);
            if (token) return token;
        }
        return null;
    }
    
    async makeRequest(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // ✅ CORRECT - Use 'login' header with PASETO token
        if (this.pasetoToken) {
            headers['login'] = this.pasetoToken;
        }
        
        const config = {
            ...options,
            headers: { ...headers, ...options.headers }
        };
        
        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // ✅ CORRECT - Student login with phone number
    async login(phonenumber, password) {
        const response = await this.makeRequest('/student/login', {
            method: 'POST',
            body: JSON.stringify({
                phonenumber: phonenumber, // NOT email
                password: password
            })
        });
        
        if (response.success && response.paseto) {
            // ✅ CORRECT - Store PASETO token
            this.setPasetoToken(response.paseto);
            this.setUserData(response.student);
        }
        
        return response;
    }
    
    setPasetoToken(pasetoToken) {
        this.pasetoToken = pasetoToken;
        // Store with multiple names for compatibility
        document.cookie = `paseto_token=${pasetoToken}; path=/; max-age=86400`;
        document.cookie = `login=${pasetoToken}; path=/; max-age=86400`;
        document.cookie = `access_token=${pasetoToken}; path=/; max-age=86400`;
        localStorage.setItem('paseto_token', pasetoToken);
    }
    
    setUserData(userData) {
        // ✅ CORRECT - Store phone number (not email)
        localStorage.setItem('user_data', JSON.stringify(userData));
        localStorage.setItem('user_phone', userData.phonenumber);
        localStorage.setItem('user_name', userData.name);
    }
    
    getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }
    
    getUserPhone() {
        return localStorage.getItem('user_phone');
    }
    
    logout() {
        // Clear all tokens and data
        const tokenNames = ['paseto_token', 'login', 'access_token', 'student_token'];
        tokenNames.forEach(name => {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        });
        
        localStorage.removeItem('paseto_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_phone');
        localStorage.removeItem('user_name');
        
        // Redirect to auth
        window.location.href = 'https://mubaroqadb.github.io/agenticlearn-auth/?type=student';
    }
}
```

### **2. Update student-dashboard.js**

#### **Profile Display Fix:**
```javascript
// ❌ WRONG - Current profile display
function displayUserProfile(profile) {
    document.getElementById('userName').textContent = profile.name;
    document.getElementById('userEmail').textContent = profile.email; // Wrong field
}

// ✅ CORRECT - Updated profile display
function displayUserProfile(profile) {
    document.getElementById('userName').textContent = profile.name;
    document.getElementById('userPhone').textContent = profile.phonenumber; // Correct field
    document.getElementById('userLevel').textContent = profile.current_level;
    document.getElementById('userPoints').textContent = profile.points;
}
```

#### **Data Loading Fix:**
```javascript
// ✅ CORRECT - Updated data loading
async function loadStudentData() {
    if (window.studentPortal) {
        try {
            // Load real data from backend
            const [profile, stats, courses] = await Promise.all([
                window.studentPortal.makeRequest('/student/profile'),
                window.studentPortal.makeRequest('/student/dashboard/stats'),
                window.studentPortal.makeRequest('/student/courses/enrolled')
            ]);
            
            if (profile.success) {
                displayUserProfile(profile.data);
            }
            
            if (stats.success) {
                displayDashboardStats(stats.data);
            }
            
            if (courses.success) {
                displayEnrolledCourses(courses.data);
            }
            
        } catch (error) {
            console.error('Failed to load real data:', error);
            // Fallback to demo data
            loadDemoData();
        }
    } else {
        console.log('Student portal integration not available, using demo data');
        loadDemoData();
    }
}
```

### **3. Update HTML Templates**

#### **Profile Section:**
```html
<!-- ❌ WRONG - Email display -->
<div class="profile-info">
    <h3 id="userName">Loading...</h3>
    <p id="userEmail">Loading...</p>
</div>

<!-- ✅ CORRECT - Phone number display -->
<div class="profile-info">
    <h3 id="userName">Loading...</h3>
    <p id="userPhone">Loading...</p>
    <span class="user-level" id="userLevel">Loading...</span>
    <span class="user-points" id="userPoints">0 points</span>
</div>
```

#### **Login Form (if exists):**
```html
<!-- ✅ CORRECT - Phone number login form -->
<form id="studentLoginForm" class="login-form">
    <div class="form-group">
        <label for="phonenumber">Nomor Telepon:</label>
        <input type="tel" id="phonenumber" name="phonenumber" 
               placeholder="082119000486" 
               pattern="[0-9]{10,13}" 
               required>
        <small>Format: 082119000486</small>
    </div>
    <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
    </div>
    <button type="submit" class="btn-primary">Login</button>
</form>

<script>
document.getElementById('studentLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phonenumber = document.getElementById('phonenumber').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await window.studentPortal.login(phonenumber, password);
        
        if (response.success) {
            // Reload page to show dashboard
            window.location.reload();
        } else {
            alert('Login failed: ' + response.message);
        }
    } catch (error) {
        alert('Login error: ' + error.message);
    }
});
</script>
```

### **4. Update index.html Script Loading**

```html
<!-- ✅ CORRECT - Script loading order -->
<head>
    <!-- Configuration -->
    <script src="js/config.js"></script>
    
    <!-- Authentication Manager -->
    <script src="js/auth-manager.js"></script>
    
    <!-- Updated Student Portal Integration -->
    <script src="js/student-portal-integration.js"></script>
    
    <!-- Dashboard Implementation -->
    <script src="js/student-dashboard.js"></script>
</head>
```

### **5. Create config.js**

```javascript
// ✅ CORRECT - Configuration file
window.AgenticLearnConfig = {
    API_BASE: 'https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn',
    AUTH_REDIRECT: 'https://mubaroqadb.github.io/agenticlearn-auth/?type=student',
    TOKEN_NAMES: ['paseto_token', 'login', 'access_token', 'student_token'],
    PHONE_PATTERN: /^08[0-9]{8,11}$/,
    REFRESH_INTERVAL: 30000,
    DEBUG: true,
    VERSION: '2.0.0'
};

console.log('🔧 AgenticLearn Student Config loaded:', window.AgenticLearnConfig);
```

---

## 🧪 **TESTING CHECKLIST FOR STUDENT PORTAL**

### **Authentication Test:**
- [ ] Login form accepts phone number (082119000486)
- [ ] PASETO token is stored correctly
- [ ] Login header is sent in API requests
- [ ] Logout clears all tokens
- [ ] Redirect to auth page works

### **Profile Test:**
- [ ] Profile displays phone number (not email)
- [ ] User name displays correctly
- [ ] Current level shows
- [ ] Points display correctly
- [ ] Profile picture loads

### **Dashboard Test:**
- [ ] Dashboard stats load from real API
- [ ] Enrolled courses display
- [ ] Progress bars work
- [ ] Recent activity shows
- [ ] AI recommendations appear

### **Integration Test:**
- [ ] StudentPortalManager class available globally
- [ ] API calls use correct headers
- [ ] Error handling works
- [ ] Fallback to demo data works
- [ ] Real data integration works

### **Phone Number Test:**
- [ ] Phone number validation works
- [ ] Indonesian format accepted (08xxxxxxxxxx)
- [ ] Invalid formats rejected
- [ ] Phone number stored correctly

---

## 📋 **DEPLOYMENT STEPS**

### **1. Update Files:**
```bash
# Update student portal integration
git checkout main
git pull origin main

# Edit files according to this guide
# - js/student-portal-integration.js
# - js/student-dashboard.js
# - index.html
# - Add js/config.js
# - Add js/auth-manager.js

git add .
git commit -m "fix: update authentication to use PASETO and phone numbers"
git push origin main
```

### **2. Test Deployment:**
```bash
# Test on GitHub Pages
# Visit: https://mubaroqadb.github.io/agenticlearn-student/

# Test login with: 082119000486
# Verify PASETO token storage
# Check API calls in Network tab
```

### **3. Verify Integration:**
```javascript
// Test in browser console
console.log('StudentPortalManager:', typeof StudentPortalManager);
console.log('Config:', window.AgenticLearnConfig);

// Test token
const token = AuthManager.getPasetoToken();
console.log('Token:', token);

// Test API call
const profile = await window.studentPortal.makeRequest('/student/profile');
console.log('Profile:', profile);
```

---

## ⚠️ **CRITICAL NOTES**

1. **Breaking Change**: Users must re-login with phone number
2. **Token Migration**: Old JWT tokens will not work
3. **Data Format**: Profile data structure changed
4. **API Headers**: All requests now use 'login' header
5. **Phone Validation**: Implement proper Indonesian phone format

**Timeline**: Complete within 24 hours for critical authentication fix.
