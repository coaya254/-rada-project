import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'content_admin' | 'moderator';
  permissions: AdminPermission[];
  created_at: string;
  last_login: string;
  is_active: boolean;
}

export interface AdminPermission {
  module: 'politicians' | 'content' | 'voting_records' | 'timeline' | 'commitments' | 'documents' | 'users' | 'system';
  actions: ('create' | 'read' | 'update' | 'delete' | 'publish' | 'moderate')[];
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (module: AdminPermission['module'], action: AdminPermission['actions'][0]) => boolean;
  checkAdminAccess: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = '@rada_admin_auth';
const ADMIN_SESSION_KEY = '@rada_admin_session';

// Mock admin users for development
const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin_1',
    username: 'superadmin',
    email: 'admin@rada.go.ke',
    role: 'super_admin',
    permissions: [
      {
        module: 'politicians',
        actions: ['create', 'read', 'update', 'delete', 'publish']
      },
      {
        module: 'content',
        actions: ['create', 'read', 'update', 'delete', 'publish', 'moderate']
      },
      {
        module: 'voting_records',
        actions: ['create', 'read', 'update', 'delete', 'publish']
      },
      {
        module: 'timeline',
        actions: ['create', 'read', 'update', 'delete', 'publish']
      },
      {
        module: 'commitments',
        actions: ['create', 'read', 'update', 'delete', 'publish']
      },
      {
        module: 'documents',
        actions: ['create', 'read', 'update', 'delete', 'publish']
      },
      {
        module: 'users',
        actions: ['create', 'read', 'update', 'delete']
      },
      {
        module: 'system',
        actions: ['read', 'update']
      }
    ],
    created_at: '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'admin_2',
    username: 'contentadmin',
    email: 'content@rada.go.ke',
    role: 'content_admin',
    permissions: [
      {
        module: 'politicians',
        actions: ['create', 'read', 'update', 'publish']
      },
      {
        module: 'content',
        actions: ['create', 'read', 'update', 'publish', 'moderate']
      },
      {
        module: 'voting_records',
        actions: ['create', 'read', 'update', 'publish']
      },
      {
        module: 'timeline',
        actions: ['create', 'read', 'update', 'publish']
      },
      {
        module: 'commitments',
        actions: ['create', 'read', 'update', 'publish']
      },
      {
        module: 'documents',
        actions: ['create', 'read', 'update', 'publish']
      }
    ],
    created_at: '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'admin_3',
    username: 'moderator',
    email: 'moderator@rada.go.ke',
    role: 'moderator',
    permissions: [
      {
        module: 'politicians',
        actions: ['read', 'update']
      },
      {
        module: 'content',
        actions: ['read', 'moderate']
      },
      {
        module: 'voting_records',
        actions: ['read']
      },
      {
        module: 'timeline',
        actions: ['read', 'update']
      },
      {
        module: 'commitments',
        actions: ['read', 'update']
      },
      {
        module: 'documents',
        actions: ['read', 'moderate']
      }
    ],
    created_at: '2024-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
    is_active: true
  }
];

// Mock passwords for development - in production, this would be handled by backend
const MOCK_PASSWORDS: Record<string, string> = {
  'superadmin': 'Admin@2024!',
  'contentadmin': 'Content@2024!',
  'moderator': 'Mod@2024!'
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip login for development - auto-login as super admin
    autoLoginForDevelopment();
  }, []);

  const autoLoginForDevelopment = async () => {
    try {
      // Auto-login as super admin for development
      const superAdmin = MOCK_ADMIN_USERS[0]; // First user is super admin
      setAdminUser(superAdmin);
      setIsLoading(false);
      console.log('Development: Auto-logged in as super admin');
    } catch (error) {
      console.error('Auto-login error:', error);
      setIsLoading(false);
    }
  };

  const checkStoredAuth = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(ADMIN_STORAGE_KEY);
      const sessionData = await AsyncStorage.getItem(ADMIN_SESSION_KEY);

      if (storedAuth && sessionData) {
        const { adminId, timestamp } = JSON.parse(sessionData);
        const sessionAge = Date.now() - timestamp;
        const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

        if (sessionAge < SESSION_DURATION) {
          const user = MOCK_ADMIN_USERS.find(u => u.id === adminId);
          if (user && user.is_active) {
            setAdminUser(user);
          } else {
            await clearStoredAuth();
          }
        } else {
          await clearStoredAuth();
        }
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      await clearStoredAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const clearStoredAuth = async () => {
    try {
      await AsyncStorage.multiRemove([ADMIN_STORAGE_KEY, ADMIN_SESSION_KEY]);
    } catch (error) {
      console.error('Error clearing stored auth:', error);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validate credentials
      const user = MOCK_ADMIN_USERS.find(u => u.username === username && u.is_active);
      const expectedPassword = MOCK_PASSWORDS[username];

      if (!user) {
        return { success: false, error: 'Invalid username or password' };
      }

      if (password !== expectedPassword) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Update last login
      const updatedUser = {
        ...user,
        last_login: new Date().toISOString()
      };

      // Store authentication data
      await AsyncStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        adminId: user.id,
        timestamp: Date.now()
      }));

      setAdminUser(updatedUser);
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await clearStoredAuth();
      setAdminUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (module: AdminPermission['module'], action: AdminPermission['actions'][0]): boolean => {
    if (!adminUser) return false;

    const modulePermission = adminUser.permissions.find(p => p.module === module);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  };

  const checkAdminAccess = async (): Promise<boolean> => {
    if (!adminUser) return false;

    // Additional checks can be added here (e.g., session validation, server-side verification)
    return adminUser.is_active;
  };

  const value: AdminAuthContextType = {
    adminUser,
    isAuthenticated: !!adminUser,
    isLoading,
    login,
    logout,
    hasPermission,
    checkAdminAccess
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Higher-order component for protecting admin routes
export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAdminAuth();

    if (isLoading) {
      return null; // You can return a loading component here
    }

    if (!isAuthenticated) {
      return null; // This will be handled by navigation logic
    }

    return <Component {...props} />;
  };
};

// Permission checker hook
export const useAdminPermission = (module: AdminPermission['module'], action: AdminPermission['actions'][0]) => {
  const { hasPermission } = useAdminAuth();
  return hasPermission(module, action);
};