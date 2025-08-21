import React from 'react';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import AdminDashboard from '../components/admin/AdminDashboard';

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

export default Admin;