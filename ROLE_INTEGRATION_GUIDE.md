# 🔄 Role Integration Guide: Mapping Old Admin/Editor to New Enhanced System

## 📋 **Overview**

This guide helps you integrate your existing "admin access" and "editor" roles into the new comprehensive user role system. The new system provides more granular permissions and better security while maintaining all your existing functionality.

## 🔍 **Current Role Analysis**

### **Existing Admin Role** (`admin_users` table)
- **Role Types**: `admin`, `editor`, `reviewer`, `creator`
- **Permissions**: JSON-based permissions system
- **Access**: Full admin dashboard, module creation, lesson management
- **Authentication**: UUID-based with email/password

### **Existing Editorial Role** (`Editorial.js`)
- **Access Method**: Badge-based (`editorial` badge) or UUID check
- **Functionality**: Memory archive management, submission approvals
- **Permissions**: Content review and approval

## 🗺️ **Role Mapping Strategy**

### **Old Admin → New Admin**
```
Old: admin_users (role: 'admin')
New: staff_users (role: 'admin')
Permissions: All permissions ('*': true)
```

### **Old Editor → New Educator**
```
Old: admin_users (role: 'editor')
New: staff_users (role: 'educator')
Permissions: create_lessons, create_quizzes, moderate_learning, view_learning_analytics
```

### **Old Reviewer → New Moderator**
```
Old: admin_users (role: 'reviewer')
New: staff_users (role: 'moderator')
Permissions: approve_content, manage_flags, verify_evidence, manage_civic_memory
```

### **Old Creator → New Educator**
```
Old: admin_users (role: 'creator')
New: staff_users (role: 'educator')
Permissions: create_lessons, create_quizzes, moderate_learning
```

### **Old Editorial Badge → New Moderator**
```
Old: user.badges.includes('editorial')
New: staff_users (role: 'moderator')
Permissions: approve_content, manage_flags, verify_evidence, manage_civic_memory
```

## 🚀 **Migration Steps**

### **Step 1: Database Migration**

Run this SQL script to migrate existing users:

```sql
-- Migration script for existing admin users
INSERT INTO staff_users (email, password, role, permissions, is_active, created_at)
SELECT 
    au.email,
    au.password, -- Assuming passwords are already hashed
    CASE 
        WHEN au.role = 'admin' THEN 'admin'
        WHEN au.role = 'editor' THEN 'educator'
        WHEN au.role = 'reviewer' THEN 'moderator'
        WHEN au.role = 'creator' THEN 'educator'
        ELSE 'educator'
    END as new_role,
    CASE 
        WHEN au.role = 'admin' THEN '["*"]'
        WHEN au.role = 'editor' THEN '["create_lessons", "create_quizzes", "moderate_learning", "view_learning_analytics", "mentor_users", "create_certifications"]'
        WHEN au.role = 'reviewer' THEN '["approve_content", "manage_flags", "verify_evidence", "manage_civic_memory", "escalate_to_admin", "fast_track_trusted", "issue_warnings"]'
        WHEN au.role = 'creator' THEN '["create_lessons", "create_quizzes", "moderate_learning"]'
        ELSE '["create_lessons", "create_quizzes", "moderate_learning"]'
    END as new_permissions,
    au.is_active,
    au.created_at
FROM admin_users au
WHERE NOT EXISTS (
    SELECT 1 FROM staff_users su WHERE su.email = au.email
);

-- Update existing users table to mark editorial badge users as staff
UPDATE users 
SET role = 'moderator',
    permissions = '["approve_content", "manage_flags", "verify_evidence", "manage_civic_memory"]'
WHERE badges LIKE '%editorial%' OR uuid IN ('editorial', 'test');
```

### **Step 2: Update Frontend Components**

#### **Update Admin.js**
```javascript
// Replace the old admin check with new system
import { useEnhancedUser } from '../contexts/EnhancedUserContext';

const Admin = () => {
  const { user, checkPermission } = useEnhancedUser();
  
  // Check if user has admin permissions
  const isAdmin = checkPermission('*') || user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div style={{ 
        flex: 1, 
        padding: '60px 20px', 
        textAlign: 'center', 
        color: 'var(--text-secondary)',
        background: 'var(--light-bg)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>🔒</div>
        <h3>Access Restricted</h3>
        <p>Admin privileges required to view this page</p>
      </div>
    );
  }

  return <AdminDashboard />;
};
```

#### **Update Editorial.js**
```javascript
// Replace the old editorial check with new system
import { useEnhancedUser } from '../contexts/EnhancedUserContext';

const Editorial = () => {
  const { user, checkPermission } = useEnhancedUser();
  
  // Check if user has moderation permissions
  const isEditorial = checkPermission('approve_content') || 
                     checkPermission('manage_flags') || 
                     user?.role === 'moderator' || 
                     user?.role === 'admin';

  // ... rest of component
};
```

### **Step 3: Update Navigation**

The new `EnhancedNavigation.js` already handles role-based navigation, but you can customize it:

```javascript
// In EnhancedNavigation.js, add specific routes for your existing functionality
const navItems = [
  // ... existing items
  
  // Admin Dashboard (for old admin users)
  { 
    path: '/admin/dashboard',
    label: 'Admin Dashboard', 
    icon: '👑', 
    show: user.role === 'admin',
    badge: '⚡'
  },
  
  // Module Builder (for old editor/creator users)
  { 
    path: '/admin/lessons', 
    label: 'Manage Lessons', 
    icon: '📝', 
    show: user.role === 'educator' || user.role === 'admin',
    badge: '👨‍🏫'
  },
  
  // Editorial Panel (for old editorial badge users)
  { 
    path: '/editorial', 
    label: 'Editorial Panel', 
    icon: '📝', 
    show: user.role === 'moderator' || user.role === 'admin',
    badge: '✏️'
  },
  
  // Moderation Queue (for old reviewer users)
  { 
    path: '/admin/moderate', 
    label: 'Moderation Queue', 
    icon: '🛡️', 
    show: user.role === 'moderator' || user.role === 'admin',
    badge: '⚡'
  }
];
```

### **Step 4: Update API Routes**

#### **Admin API Routes Integration**
```javascript
// In your server.js, integrate both old and new admin routes
const adminRoutes = require('./admin_api_routes');
const enhancedApiRoutes = require('./enhanced_api_routes');

// Old admin routes (for backward compatibility)
adminRoutes(app, db);

// New enhanced routes
app.use('/api', enhancedApiRoutes);
```

#### **Add Role-Based Middleware to Admin Routes**
```javascript
// In admin_api_routes.js, add permission checks
const { checkPermission } = require('./enhanced_auth_middleware');

// Example: Protect module creation routes
app.post('/admin/modules', checkPermission('create_lessons'), (req, res) => {
  // Your existing module creation logic
});

app.post('/admin/lessons', checkPermission('create_lessons'), (req, res) => {
  // Your existing lesson creation logic
});
```

## 🔧 **Configuration Options**

### **Custom Permission Sets**

You can create custom permission sets for specific roles:

```javascript
// In enhanced_auth_middleware.js, add custom permissions
const CUSTOM_PERMISSIONS = {
  legacy_admin: {
    create_lessons: true,
    create_quizzes: true,
    moderate_learning: true,
    view_learning_analytics: true,
    mentor_users: true,
    create_certifications: true,
    approve_content: true,
    manage_flags: true,
    verify_evidence: true,
    manage_civic_memory: true,
    escalate_to_admin: true,
    fast_track_trusted: true,
    issue_warnings: true
  },
  
  legacy_editor: {
    create_lessons: true,
    create_quizzes: true,
    moderate_learning: true,
    view_learning_analytics: true,
    mentor_users: true,
    create_certifications: true
  },
  
  legacy_reviewer: {
    approve_content: true,
    manage_flags: true,
    verify_evidence: true,
    manage_civic_memory: true,
    escalate_to_admin: true,
    fast_track_trusted: true,
    issue_warnings: true
  }
};
```

### **Backward Compatibility Mode**

Enable backward compatibility for existing users:

```javascript
// In enhanced_auth_middleware.js
const checkPermission = (permission, options = {}) => {
  return (req, res, next) => {
    // Check new system first
    if (hasPermission(req.user, permission)) {
      return next();
    }
    
    // Fallback to old system for backward compatibility
    if (options.allowLegacy) {
      const oldPermissions = req.user?.permissions;
      if (oldPermissions && oldPermissions.includes(permission)) {
        return next();
      }
    }
    
    return res.status(403).json({ error: 'Insufficient permissions' });
  };
};
```

## 🧪 **Testing Your Integration**

### **Test Cases**

1. **Admin Access Test**
   ```javascript
   // Test admin dashboard access
   const adminUser = { role: 'admin', permissions: ['*'] };
   console.log(checkPermission('*')(adminUser)); // Should return true
   ```

2. **Editor Access Test**
   ```javascript
   // Test lesson creation access
   const editorUser = { role: 'educator', permissions: ['create_lessons'] };
   console.log(checkPermission('create_lessons')(editorUser)); // Should return true
   ```

3. **Editorial Access Test**
   ```javascript
   // Test content approval access
   const editorialUser = { role: 'moderator', permissions: ['approve_content'] };
   console.log(checkPermission('approve_content')(editorialUser)); // Should return true
   ```

### **Migration Verification**

Run this script to verify your migration:

```sql
-- Check migration results
SELECT 
    'staff_users' as table_name,
    role,
    COUNT(*) as count
FROM staff_users 
GROUP BY role

UNION ALL

SELECT 
    'users with editorial badges' as table_name,
    'moderator' as role,
    COUNT(*) as count
FROM users 
WHERE badges LIKE '%editorial%' OR uuid IN ('editorial', 'test');
```

## 🔒 **Security Considerations**

### **Password Migration**
- Ensure existing passwords are properly hashed with bcrypt
- Consider forcing password reset for migrated users
- Implement proper session management

### **Permission Auditing**
- Log all permission checks for audit trails
- Monitor access patterns for security analysis
- Implement role change notifications

### **Data Integrity**
- Backup existing admin data before migration
- Validate migrated permissions work correctly
- Test all admin functions after migration

## 🚀 **Next Steps**

1. **Run the migration script** to move existing users
2. **Update your frontend components** to use the new system
3. **Test all admin functionality** to ensure it works
4. **Monitor the system** for any issues
5. **Gradually phase out** old permission checks

## 📞 **Support**

If you encounter issues during migration:

1. Check the database migration logs
2. Verify user permissions are correctly set
3. Test individual components
4. Review the enhanced system documentation

The new system provides better security, more granular permissions, and improved user experience while maintaining all your existing functionality.
