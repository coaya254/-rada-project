// Component Update Script for Enhanced User Role System
// This script helps you update your existing components to use the new system

// 1. Update Admin.js
const adminJsUpdate = `
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
`;

// 2. Update Editorial.js
const editorialJsUpdate = `
// Replace the old editorial check with new system
import { useEnhancedUser } from '../contexts/EnhancedUserContext';

const Editorial = () => {
  const { user, checkPermission } = useEnhancedUser();
  
  // Check if user has moderation permissions
  const isEditorial = checkPermission('approve_content') || 
                     checkPermission('manage_flags') || 
                     user?.role === 'moderator' || 
                     user?.role === 'admin';

  // ... rest of component remains the same
`;
`;

// 3. Update App.js to use EnhancedUserContext
const appJsUpdate = `
// In your App.js, replace UserContext with EnhancedUserContext
import { EnhancedUserProvider } from './contexts/EnhancedUserContext';

function App() {
  return (
    <EnhancedUserProvider>
      {/* Your existing app content */}
    </EnhancedUserProvider>
  );
}
`;

// 4. Update server.js integration
const serverJsUpdate = `
// In your server.js, add these imports and middleware
const enhancedAuthMiddleware = require('./enhanced_auth_middleware');
const enhancedApiRoutes = require('./enhanced_api_routes');

// Add rate limiting
app.use(enhancedAuthMiddleware.generalLimiter);

// Add enhanced routes
app.use('/api', enhancedApiRoutes);

// Keep your existing admin routes for backward compatibility
const adminRoutes = require('./admin_api_routes');
adminRoutes(app, db);
`;

// 5. Update admin_api_routes.js to use new permissions
const adminRoutesUpdate = `
// In admin_api_routes.js, add permission checks
const { checkPermission } = require('./enhanced_auth_middleware');

// Example: Protect module creation routes
app.post('/admin/modules', checkPermission('create_lessons'), (req, res) => {
  // Your existing module creation logic
});

app.post('/admin/lessons', checkPermission('create_lessons'), (req, res) => {
  // Your existing lesson creation logic
});

app.put('/admin/modules/:id', checkPermission('create_lessons'), (req, res) => {
  // Your existing module update logic
});
`;

// 6. Quick test script
const testScript = `
// Test your integration with this script
const testUser = {
  role: 'admin',
  permissions: ['*'],
  trust_score: 1.0
};

const testEditor = {
  role: 'educator',
  permissions: ['create_lessons', 'create_quizzes'],
  trust_score: 1.0
};

const testModerator = {
  role: 'moderator',
  permissions: ['approve_content', 'manage_flags'],
  trust_score: 1.0
};

console.log('Admin can create lessons:', hasPermission(testUser, 'create_lessons')); // true
console.log('Editor can create lessons:', hasPermission(testEditor, 'create_lessons')); // true
console.log('Moderator can approve content:', hasPermission(testModerator, 'approve_content')); // true
console.log('Editor cannot approve content:', hasPermission(testEditor, 'approve_content')); // false
`;

// Export all updates
module.exports = {
  adminJsUpdate,
  editorialJsUpdate,
  appJsUpdate,
  serverJsUpdate,
  adminRoutesUpdate,
  testScript
};

console.log('✅ Component update script ready!');
console.log('📝 Use the exported updates to modify your existing components');
console.log('🔧 Run the migration script first, then apply these updates');
