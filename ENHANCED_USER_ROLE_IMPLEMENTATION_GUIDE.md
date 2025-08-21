# Enhanced User Role System Implementation Guide

## 🎯 **Overview**

This guide provides step-by-step instructions for implementing the enhanced user role system in your radamtaani project. The system includes:

- **4 User Roles**: Anonymous, Educator, Moderator, Admin
- **Trust Score System**: Merit-based advancement
- **Enhanced Security**: Rate limiting, account locking
- **Auto-Moderation**: AI-powered content screening
- **Community Self-Moderation**: Peer review system
- **Government Engagement Pipeline**: Official submissions
- **Crisis Response System**: Emergency protocols

## 📋 **Implementation Steps**

### **Step 1: Database Setup**

1. **Run the enhanced database schema:**
   ```bash
   mysql -u your_username -p your_database < enhanced_user_role_system.sql
   ```

2. **Verify tables were created:**
   ```sql
   SHOW TABLES LIKE '%staff%';
   SHOW TABLES LIKE '%trust%';
   SHOW TABLES LIKE '%moderation%';
   ```

### **Step 2: Server Integration**

1. **Install required dependencies:**
   ```bash
   npm install bcrypt jsonwebtoken express-rate-limit
   ```

2. **Update your main server file (`server.js`):**
   ```javascript
   // Add these imports at the top
   const enhancedAuthMiddleware = require('./enhanced_auth_middleware');
   const enhancedApiRoutes = require('./enhanced_api_routes');
   
   // Add rate limiting
   app.use(enhancedAuthMiddleware.generalLimiter);
   
   // Add enhanced routes
   app.use('/api', enhancedApiRoutes);
   ```

3. **Update your existing user routes to use the enhanced system:**
   ```javascript
   // Replace existing user creation with enhanced version
   app.post('/users', async (req, res) => {
     try {
       const newUser = enhancedAuthMiddleware.generateAnonymousUser();
       // Save to database
       const result = await createUser(newUser);
       res.json(result);
     } catch (error) {
       res.status(500).json({ error: 'User creation failed' });
     }
   });
   ```

### **Step 3: Client Integration**

1. **Replace the existing UserContext with EnhancedUserContext:**
   ```javascript
   // In your App.js or main component
   import { EnhancedUserProvider } from './contexts/EnhancedUserContext';
   
   function App() {
     return (
       <EnhancedUserProvider>
         {/* Your app components */}
       </EnhancedUserProvider>
     );
   }
   ```

2. **Update components to use the enhanced context:**
   ```javascript
   // Replace useUser with useEnhancedUser
   import { useEnhancedUser } from '../contexts/EnhancedUserContext';
   
   function MyComponent() {
     const { user, checkPermission, getTrustLevelInfo } = useEnhancedUser();
     
     // Use enhanced features
     if (checkPermission('peer_review')) {
       // Show peer review features
     }
   }
   ```

3. **Add the enhanced navigation:**
   ```javascript
   import EnhancedNavigation from './components/EnhancedNavigation';
   
   function Layout() {
     return (
       <div className="layout">
         <EnhancedNavigation />
         {/* Your content */}
       </div>
     );
   }
   ```

### **Step 4: Admin Dashboard Integration**

1. **Add the enhanced moderation queue:**
   ```javascript
   // In your admin routes
   import EnhancedModerationQueue from '../components/admin/EnhancedModerationQueue';
   
   // Add to your admin dashboard
   <Route path="/admin/moderate" element={<EnhancedModerationQueue />} />
   ```

2. **Create staff login component:**
   ```javascript
   // Create components/admin/StaffLogin.js
   import React, { useState } from 'react';
   import { useEnhancedUser } from '../../contexts/EnhancedUserContext';
   
   const StaffLogin = () => {
     const { staffLogin } = useEnhancedUser();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     
     const handleLogin = async (e) => {
       e.preventDefault();
       const result = await staffLogin(email, password);
       if (result.success) {
         // Redirect to admin dashboard
       }
     };
     
     return (
       <form onSubmit={handleLogin}>
         <input
           type="email"
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           placeholder="Staff Email"
         />
         <input
           type="password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           placeholder="Password"
         />
         <button type="submit">Login</button>
       </form>
     );
   };
   ```

### **Step 5: Database Functions Implementation**

You need to implement the database helper functions in your server. Here's an example:

```javascript
// In your server file, add these functions:

const getUserByUuid = async (uuid) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE uuid = ?';
    db.query(query, [uuid], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

const updateUserTrustScore = async (uuid, newScore) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE users SET trust_score = ? WHERE uuid = ?';
    db.query(query, [newScore, uuid], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

const recordTrustEvent = async (uuid, eventType, change, newScore, reason) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO trust_events (user_uuid, event_type, trust_change, new_trust_score, reason)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [uuid, eventType, change, newScore, reason], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Add all other database functions similarly...
```

### **Step 6: Environment Variables**

Add these to your `.env` file:

```env
# JWT Secret for staff authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Rate limiting settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Trust score settings
MIN_TRUST_SCORE=0.1
MAX_TRUST_SCORE=5.0
AUTO_APPROVAL_THRESHOLD=2.5
```

### **Step 7: Testing the System**

1. **Test anonymous user creation:**
   ```javascript
   // Should create user with trust_score = 1.0
   const response = await fetch('/api/users', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({})
   });
   ```

2. **Test staff login:**
   ```javascript
   // Should return JWT token
   const response = await fetch('/api/auth/staff/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'admin@rada.ke',
       password: 'password'
     })
   });
   ```

3. **Test content submission with auto-moderation:**
   ```javascript
   // Should auto-approve if trust_score > 2.5
   const response = await fetch('/api/posts', {
     method: 'POST',
     headers: { 
       'Content-Type': 'application/json',
       'x-user-uuid': userUuid
     },
     body: JSON.stringify({
       type: 'story',
       title: 'Test Post',
       content: 'This is a test post'
     })
   });
   ```

## 🔧 **Configuration Options**

### **Trust Score Thresholds**

You can customize the trust score thresholds in the middleware:

```javascript
// In enhanced_auth_middleware.js
const TRUST_THRESHOLDS = {
  AUTO_APPROVAL: 2.5,
  PEER_REVIEW: 2.0,
  CHALLENGE_CREATION: 2.0,
  MODERATION_POWERS: 3.0
};
```

### **Permission Matrix**

Customize permissions for each role:

```javascript
// In EnhancedUserContext.js
const PERMISSION_MATRIX = {
  anonymous: {
    submit_posts: true,
    // Add more permissions...
  },
  // Customize other roles...
};
```

### **Rate Limiting**

Adjust rate limiting settings:

```javascript
// In enhanced_auth_middleware.js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts'
});
```

## 🚀 **Advanced Features**

### **AI Content Screening**

To implement AI content screening, replace the placeholder in `enhanced_auth_middleware.js`:

```javascript
const runAIScreening = async (content) => {
  // Integrate with your preferred AI service
  // Example with OpenAI:
  const response = await openai.moderations.create({
    input: content
  });
  
  const flags = [];
  if (response.results[0].flagged) {
    if (response.results[0].categories.hate) flags.push('hate');
    if (response.results[0].categories.violence) flags.push('violence');
    // Add more categories...
  }
  
  return flags;
};
```

### **Government Engagement Pipeline**

Implement the government submission system:

```javascript
// Add to your admin dashboard
const GovernmentEngagement = () => {
  const [submissions, setSubmissions] = useState([]);
  
  const curateContent = async () => {
    const response = await api.get('/government/curate?timeframe=7days');
    setSubmissions(response.data);
  };
  
  return (
    <div>
      <button onClick={curateContent}>Curate Content</button>
      {/* Display curated content */}
    </div>
  );
};
```

### **Crisis Response System**

Implement crisis response mode:

```javascript
// Add to your admin dashboard
const CrisisResponse = () => {
  const activateCrisisMode = async (crisisData) => {
    await api.post('/crisis/activate', crisisData);
    // Enable crisis response features
  };
  
  return (
    <div>
      <button onClick={() => activateCrisisMode({
        title: 'Emergency Response',
        crisisType: 'health',
        severity: 'high'
      })}>
        Activate Crisis Mode
      </button>
    </div>
  );
};
```

## 🔒 **Security Considerations**

1. **JWT Secret**: Use a strong, unique JWT secret
2. **Rate Limiting**: Monitor and adjust rate limits based on usage
3. **Trust Score Manipulation**: Implement audit logs for trust score changes
4. **Staff Access**: Regularly review staff permissions
5. **Data Backup**: Ensure trust events and moderation data are backed up

## 📊 **Monitoring and Analytics**

Add these endpoints to monitor system health:

```javascript
// Add to your API routes
app.get('/api/admin/system-health', authenticateStaff, async (req, res) => {
  const health = {
    totalUsers: await getTotalUsers(),
    activeModerators: await getActiveModerators(),
    queueSize: await getModerationQueueSize(),
    avgTrustScore: await getAverageTrustScore(),
    systemUptime: process.uptime()
  };
  res.json(health);
});
```

## 🎉 **Success Metrics**

Track these metrics to measure system success:

- **Trust Score Distribution**: Should show natural progression
- **Moderation Queue Size**: Should stay manageable
- **Auto-Approval Rate**: Should increase with system maturity
- **Community Engagement**: Should improve with peer review
- **Staff Efficiency**: Should improve with enhanced tools

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Permission Denied Errors**: Check user role and trust score
2. **Database Connection Issues**: Verify database schema is applied
3. **JWT Token Errors**: Check JWT_SECRET environment variable
4. **Rate Limiting**: Adjust limits if legitimate users are blocked

### **Debug Mode**

Enable debug logging:

```javascript
// Add to your server
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Enhanced User Role System Debug Mode Enabled');
  // Add more debug logging
}
```

## 📚 **Next Steps**

1. **Implement AI Content Screening**: Integrate with OpenAI or similar service
2. **Add Mobile Support**: Ensure all features work on mobile devices
3. **Create User Onboarding**: Guide new users through trust building
4. **Implement Analytics Dashboard**: Track system performance
5. **Add Multi-language Support**: Support for Swahili and other languages

---

**This enhanced user role system provides a robust foundation for scaling your civic engagement platform while maintaining security and community trust! 🚀**
