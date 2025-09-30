import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface DashboardStats {
  politicians: number;
  news: number;
  documents: number;
  commitments: number;
  timeline: number;
  commitmentStatus: {
    completed: number;
    in_progress: number;
    pending: number;
    broken: number;
  };
}

interface RecentActivity {
  type: string;
  title: string;
  created_at: string;
  politician_id: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('http://localhost:5001/api/admin/dashboard/stats', {
          headers: {
            'Authorization': 'admin-token-123',
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5001/api/admin/dashboard/recent', {
          headers: {
            'Authorization': 'admin-token-123',
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, gradient }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    gradient: string[];
  }) => (
    <LinearGradient
      colors={gradient}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statCardContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value.toLocaleString()}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const ActivityItem = ({ item }: { item: RecentActivity }) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'news': return 'newspaper';
        case 'document': return 'document-text';
        case 'commitment': return 'flag';
        default: return 'time';
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'news': return '#3B82F6';
        case 'document': return '#8B5CF6';
        case 'commitment': return '#10B981';
        default: return '#6B7280';
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <Ionicons name={getTypeIcon(item.type) as any} size={20} color={getTypeColor(item.type)} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.activityType}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={styles.activityDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Content Management System</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Politicians"
              value={stats?.politicians || 0}
              icon="people"
              color="#3B82F6"
              gradient={['#3B82F6', '#1D4ED8']}
            />
            <StatCard
              title="News Articles"
              value={stats?.news || 0}
              icon="newspaper"
              color="#10B981"
              gradient={['#10B981', '#059669']}
            />
            <StatCard
              title="Documents"
              value={stats?.documents || 0}
              icon="document-text"
              color="#8B5CF6"
              gradient={['#8B5CF6', '#7C3AED']}
            />
            <StatCard
              title="Commitments"
              value={stats?.commitments || 0}
              icon="flag"
              color="#F59E0B"
              gradient={['#F59E0B', '#D97706']}
            />
          </View>
        </View>

        {/* Commitment Status Breakdown */}
        {stats?.commitmentStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commitment Status</Text>
            <View style={styles.commitmentStatusGrid}>
              <View style={styles.statusCard}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.statusLabel}>Completed</Text>
                <Text style={styles.statusValue}>{stats.commitmentStatus.completed}</Text>
              </View>
              <View style={styles.statusCard}>
                <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.statusLabel}>In Progress</Text>
                <Text style={styles.statusValue}>{stats.commitmentStatus.in_progress}</Text>
              </View>
              <View style={styles.statusCard}>
                <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.statusLabel}>Pending</Text>
                <Text style={styles.statusValue}>{stats.commitmentStatus.pending}</Text>
              </View>
              <View style={styles.statusCard}>
                <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.statusLabel}>Broken</Text>
                <Text style={styles.statusValue}>{stats.commitmentStatus.broken}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <ActivityItem key={index} item={item} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>No recent activity</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="person-add" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add Politician</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="newspaper" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add News</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="document-text" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add Document</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="flag" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Add Commitment</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  commitmentStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  activityType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: (width - 52) / 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AdminDashboard;