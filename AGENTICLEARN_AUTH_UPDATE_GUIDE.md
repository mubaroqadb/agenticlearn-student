# 🔐 AgenticLearn Auth Frontend Update Guide
## Memperbaiki Redirect Flow dan Token Management

**Target Repository**: `agenticlearn-auth`  
**Priority**: High - Critical for Authentication Flow  
**Estimated Time**: 2-3 hours

---

## 🎯 **OVERVIEW**

Frontend auth (`agenticlearn-auth`) perlu diupdate untuk:
1. Handle redirect parameter dari student/educator portals
2. Set cookies dengan domain yang benar untuk cross-subdomain access
3. Redirect kembali ke portal setelah login sukses
4. Standardize token management

---

## 🔧 **REQUIRED UPDATES**

### **1. Update Login Success Handler**

#### **File: `js/auth.js` (atau file utama auth)**
```javascript
// Add this function to handle successful login
function handleSuccessfulLogin(token, userData = {}) {
    console.log('✅ Login successful, processing...');
    
    // Set token with proper domain for cross-subdomain access
    const cookieOptions = 'path=/; domain=.github.io; max-age=86400; SameSite=Lax';
    
    // Set multiple token names for compatibility
    document.cookie = `access_token=${token}; ${cookieOptions}`;
    document.cookie = `student_login=${token}; ${cookieOptions}`;
    document.cookie = `login=${token}; ${cookieOptions}`;
    
    // Store user data in localStorage
    if (userData.name) localStorage.setItem('user_name', userData.name);
    if (userData.email) localStorage.setItem('user_email', userData.email);
    if (userData.role) localStorage.setItem('user_role', userData.role);
    
    console.log('✅ Token and user data stored');
    
    // Handle redirect
    handlePostLoginRedirect(userData.role);
}

function handlePostLoginRedirect(userRole = 'student') {
    // Get redirect URL from query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    
    if (redirectUrl) {
        console.log(`🔄 Redirecting to: ${redirectUrl}`);
        window.location.href = decodeURIComponent(redirectUrl);
        return;
    }
    
    // Default redirect based on user type
    const userType = urlParams.get('type') || userRole || 'student';
    const defaultRedirects = {
        'student': 'https://mubaroqadb.github.io/agenticlearn-student/',
        'educator': 'https://mubaroqadb.github.io/agenticlearn-educator/',
        'admin': 'https://mubaroqadb.github.io/agenticlearn-admin/'
    };
    
    const defaultUrl = defaultRedirects[userType] || defaultRedirects['student'];
    console.log(`🔄 Redirecting to default: ${defaultUrl}`);
    window.location.href = defaultUrl;
}
```

### **2. Update Demo Button Handlers**

#### **Update existing demo button code:**
```javascript
// Update demo button event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Handle demo buttons
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const role = this.dataset.role;
            console.log(`🎭 Demo login as: ${role}`);
            
            // Generate demo token
            const demoToken = `demo_${role}_token_${Date.now()}`;
            
            // Simulate successful login
            handleSuccessfulLogin(demoToken, { 
                role: role, 
                name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                email: `demo@${role}.com`
            });
        });
    });
    
    // Handle regular login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleRegularLogin);
    }
});

async function handleRegularLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        // Show loading state
        showLoadingState(true);
        
        // Call backend auth API
        const response = await fetch('https://asia-southeast2-agenticai-462517.cloudfunctions.net/domyid/api/agenticlearn/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
            // Handle successful login
            handleSuccessfulLogin(data.token, data.user || {});
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    } finally {
        showLoadingState(false);
    }
}

function showLoadingState(loading) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? 'Logging in...' : 'Login';
    }
}

function showError(message) {
    // Create or update error message element
    let errorEl = document.getElementById('login-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'login-error';
        errorEl.style.cssText = 'color: #dc3545; margin-top: 1rem; padding: 0.5rem; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;';
        document.querySelector('.login-form').appendChild(errorEl);
    }
    errorEl.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (errorEl) errorEl.remove();
    }, 5000);
}
```

### **3. Update HTML Structure (if needed)**

#### **Ensure demo buttons have proper data attributes:**
```html
<!-- Update demo buttons to have data-role attribute -->
<div class="demo-section">
    <h3>Demo Login</h3>
    <button type="button" class="demo-btn" data-role="student">
        👨‍🎓 Student
    </button>
    <button type="button" class="demo-btn" data-role="educator">
        👩‍🏫 Educator
    </button>
    <button type="button" class="demo-btn" data-role="admin">
        👨‍💼 Admin
    </button>
</div>
```

### **4. Add URL Parameter Display (Optional)**

#### **Show current parameters for debugging:**
```javascript
// Add this for debugging (can be removed in production)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const redirect = urlParams.get('redirect');
    
    if (type || redirect) {
        console.log('🔍 Auth parameters:', { type, redirect });
        
        // Optionally show in UI for debugging
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = 'background: #e3f2fd; padding: 0.5rem; margin-bottom: 1rem; border-radius: 4px; font-size: 0.8rem;';
        debugInfo.innerHTML = `
            <strong>Debug Info:</strong><br>
            Type: ${type || 'not specified'}<br>
            Redirect: ${redirect ? decodeURIComponent(redirect) : 'not specified'}
        `;
        document.querySelector('.login-container').prepend(debugInfo);
    }
});
```

---

## 🧪 **TESTING CHECKLIST**

### **Test Scenarios:**

#### **1. Direct Access**
- Navigate to: `https://mubaroqadb.github.io/agenticlearn-auth/`
- Click demo student button
- Should redirect to: `https://mubaroqadb.github.io/agenticlearn-student/`

#### **2. With Type Parameter**
- Navigate to: `https://mubaroqadb.github.io/agenticlearn-auth/?type=educator`
- Click demo educator button
- Should redirect to: `https://mubaroqadb.github.io/agenticlearn-educator/`

#### **3. With Redirect Parameter**
- Navigate to: `https://mubaroqadb.github.io/agenticlearn-auth/?type=student&redirect=https%3A//mubaroqadb.github.io/agenticlearn-student/`
- Click demo student button
- Should redirect to: `https://mubaroqadb.github.io/agenticlearn-student/`

#### **4. Cross-Domain Token Test**
- Login at auth frontend
- Navigate to student portal
- Should be automatically authenticated (no additional login required)

#### **5. Token Persistence Test**
- Login at auth frontend
- Close browser
- Reopen and navigate to student portal
- Should remain authenticated

---

## 📋 **IMPLEMENTATION STEPS**

### **Step 1: Backup Current Code**
```bash
# Create backup of current auth frontend
git checkout -b backup-before-auth-fix
git commit -am "Backup before auth flow fix"
git checkout main
```

### **Step 2: Update JavaScript**
1. Add `handleSuccessfulLogin` function
2. Add `handlePostLoginRedirect` function
3. Update demo button handlers
4. Update regular login handler
5. Add error handling

### **Step 3: Test Locally**
1. Test direct access
2. Test with parameters
3. Test cross-domain token access
4. Test all user types

### **Step 4: Deploy and Test**
1. Deploy to GitHub Pages
2. Test from student portal
3. Test from educator portal
4. Verify token persistence

---

## 🚀 **EXPECTED RESULTS**

### **Before Fix:**
❌ User logs in at auth frontend  
❌ User stuck at auth page  
❌ User must manually navigate to portal  
❌ Token may not work across subdomains  

### **After Fix:**
✅ User logs in at auth frontend  
✅ User automatically redirected to portal  
✅ Token works across all AgenticLearn subdomains  
✅ Seamless authentication experience  

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

#### **Issue: Redirect not working**
- Check URL encoding/decoding
- Verify redirect parameter is passed correctly
- Check browser console for errors

#### **Issue: Token not recognized in portal**
- Verify cookie domain is set to `.github.io`
- Check cookie names match between auth and portal
- Verify cookie expiration time

#### **Issue: Demo buttons not working**
- Check data-role attributes on buttons
- Verify event listeners are attached
- Check browser console for JavaScript errors

### **Debug Commands:**
```javascript
// Check cookies in browser console
document.cookie

// Check localStorage
localStorage

// Check URL parameters
new URLSearchParams(window.location.search)
```

---

## 📊 **SUCCESS CRITERIA**

✅ **Authentication Flow Complete When:**
- User can login from any AgenticLearn portal
- After login, user returns to original portal
- Token works across all subdomains
- Demo buttons work correctly
- No manual navigation required
- Error handling works properly

**Timeline**: 2-3 hours implementation + 1 hour testing  
**Priority**: High - Blocking user experience
