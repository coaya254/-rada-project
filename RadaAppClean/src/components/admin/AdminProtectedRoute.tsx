import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminAuth, AdminPermission } from '../../contexts/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: AdminPermission['module'];
  requiredAction?: AdminPermission['actions'][0];
  fallbackComponent?: React.ComponentType;
  navigation?: any;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requiredModule,
  requiredAction = 'read',
  fallbackComponent: FallbackComponent,
  navigation
}) => {
  const { isAuthenticated, isLoading, hasPermission, adminUser } = useAdminAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Verifying permissions...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    return (
      <View style={styles.unauthorizedContainer}>
        <View style={styles.unauthorizedContent}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={styles.unauthorizedTitle}>Access Denied</Text>
          <Text style={styles.unauthorizedMessage}>
            Admin authentication required to access this section.
          </Text>
          {navigation && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('AdminLogin')}
            >
              <Ionicons name="log-in" size={20} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>Go to Admin Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Check specific permissions if required
  if (requiredModule && !hasPermission(requiredModule, requiredAction)) {
    return (
      <View style={styles.forbiddenContainer}>
        <View style={styles.forbiddenContent}>
          <Ionicons name="warning" size={64} color="#F59E0B" />
          <Text style={styles.forbiddenTitle}>Insufficient Permissions</Text>
          <Text style={styles.forbiddenMessage}>
            You don't have permission to {requiredAction} {requiredModule} data.
          </Text>
          <View style={styles.userInfo}>
            <Text style={styles.userInfoLabel}>Logged in as:</Text>
            <Text style={styles.userInfoValue}>
              {adminUser?.username} ({adminUser?.role})
            </Text>
          </View>
          {navigation && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  unauthorizedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  unauthorizedContent: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  unauthorizedMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  forbiddenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  forbiddenContent: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  forbiddenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  forbiddenMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    width: '100%',
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  userInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});