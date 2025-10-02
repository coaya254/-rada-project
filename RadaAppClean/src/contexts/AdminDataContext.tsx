import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { adminAPI } from '../services/AdminAPIService';
import { useAdminAuth } from './AdminAuthContext';

interface AdminDataContextType {
  // Data state
  politicians: any[];
  timelineEvents: any[];
  commitments: any[];
  votingRecords: any[];
  documents: any[];
  analytics: any;

  // Loading states
  loading: {
    politicians: boolean;
    timelineEvents: boolean;
    commitments: boolean;
    votingRecords: boolean;
    documents: boolean;
    analytics: boolean;
  };

  // Error states
  errors: {
    politicians?: string;
    timelineEvents?: string;
    commitments?: string;
    votingRecords?: string;
    documents?: string;
    analytics?: string;
  };

  // CRUD operations
  createPolitician: (data: any) => Promise<boolean>;
  updatePolitician: (id: number, data: any) => Promise<boolean>;
  deletePolitician: (id: number) => Promise<boolean>;
  bulkDeletePoliticians: (ids: number[]) => Promise<boolean>;

  createTimelineEvent: (data: any) => Promise<boolean>;
  updateTimelineEvent: (id: number, data: any) => Promise<boolean>;
  deleteTimelineEvent: (id: number) => Promise<boolean>;

  createCommitment: (data: any) => Promise<boolean>;
  updateCommitment: (id: number, data: any) => Promise<boolean>;
  updateCommitmentProgress: (id: number, progress: any) => Promise<boolean>;
  deleteCommitment: (id: number) => Promise<boolean>;

  createVotingRecord: (data: any) => Promise<boolean>;
  bulkImportVotingRecords: (records: any[]) => Promise<{ success: boolean; imported: number; errors: any[] }>;
  updateVotingRecord: (id: number, data: any) => Promise<boolean>;
  deleteVotingRecord: (id: number) => Promise<boolean>;

  createDocument: (data: any) => Promise<boolean>;
  updateDocument: (id: number, data: any) => Promise<boolean>;
  deleteDocument: (id: number) => Promise<boolean>;
  uploadDocument: (formData: FormData) => Promise<any>;

  // Data fetching
  fetchPoliticians: (refresh?: boolean) => Promise<void>;
  fetchTimelineEvents: (politicianId?: number, refresh?: boolean) => Promise<void>;
  fetchCommitments: (filters?: any, refresh?: boolean) => Promise<void>;
  fetchVotingRecords: (filters?: any, refresh?: boolean) => Promise<void>;
  fetchDocuments: (filters?: any, refresh?: boolean) => Promise<void>;
  fetchAnalytics: (period?: string, refresh?: boolean) => Promise<void>;

  // Search and filter
  searchPoliticians: (query: string, filters?: any) => Promise<any[]>;

  // Utility functions
  refreshAll: () => Promise<void>;
  clearErrors: () => void;

  // Data integrity
  runIntegrityCheck: () => Promise<any>;
  getIntegrityReport: () => Promise<any>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};

interface AdminDataProviderProps {
  children: React.ReactNode;
}

export const AdminDataProvider: React.FC<AdminDataProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();

  // Data state
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [votingRecords, setVotingRecords] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Loading state
  const [loading, setLoading] = useState({
    politicians: false,
    timelineEvents: false,
    commitments: false,
    votingRecords: false,
    documents: false,
    analytics: false,
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setError = useCallback((key: string, error: string) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  // Politician operations
  const fetchPoliticians = useCallback(async (refresh = false) => {
    if (!isAuthenticated) return;

    if (refresh || politicians.length === 0) {
      setLoadingState('politicians', true);
      clearError('politicians');

      const response = await adminAPI.searchPoliticians('');

      if (response.success && response.data) {
        setPoliticians(response.data);
      } else {
        setError('politicians', response.error || 'Failed to fetch politicians');
      }

      setLoadingState('politicians', false);
    }
  }, [isAuthenticated, politicians.length, setLoadingState, clearError, setError]);

  const createPolitician = useCallback(async (data: any): Promise<boolean> => {
    const response = await adminAPI.createPolitician(data);

    if (response.success && response.data) {
      setPoliticians(prev => [response.data, ...prev]);
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to create politician');
      return false;
    }
  }, []);

  const updatePolitician = useCallback(async (id: number, data: any): Promise<boolean> => {
    const response = await adminAPI.updatePolitician(id, data);

    if (response.success && response.data) {
      setPoliticians(prev => prev.map(p => p.id === id ? response.data : p));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to update politician');
      return false;
    }
  }, []);

  const deletePolitician = useCallback(async (id: number): Promise<boolean> => {
    const response = await adminAPI.deletePolitician(id);

    if (response.success) {
      setPoliticians(prev => prev.filter(p => p.id !== id));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to delete politician');
      return false;
    }
  }, []);

  const bulkDeletePoliticians = useCallback(async (ids: number[]): Promise<boolean> => {
    const response = await adminAPI.bulkDeletePoliticians(ids);

    if (response.success) {
      setPoliticians(prev => prev.filter(p => !ids.includes(p.id)));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to delete politicians');
      return false;
    }
  }, []);

  const searchPoliticians = useCallback(async (query: string, filters?: any): Promise<any[]> => {
    const response = await adminAPI.searchPoliticians(query, filters);
    return response.success ? response.data || [] : [];
  }, []);

  // Timeline Events operations
  const fetchTimelineEvents = useCallback(async (politicianId?: number, refresh = false) => {
    if (!isAuthenticated) return;

    setLoadingState('timelineEvents', true);
    clearError('timelineEvents');

    const response = await adminAPI.getTimelineEvents(politicianId);

    if (response.success && response.data) {
      setTimelineEvents(response.data);
    } else {
      setError('timelineEvents', response.error || 'Failed to fetch timeline events');
    }

    setLoadingState('timelineEvents', false);
  }, [isAuthenticated, setLoadingState, clearError, setError]);

  const createTimelineEvent = useCallback(async (data: any): Promise<boolean> => {
    const response = await adminAPI.createTimelineEvent(data);

    if (response.success && response.data) {
      setTimelineEvents(prev => [response.data, ...prev]);
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to create timeline event');
      return false;
    }
  }, []);

  const updateTimelineEvent = useCallback(async (id: number, data: any): Promise<boolean> => {
    const response = await adminAPI.updateTimelineEvent(id, data);

    if (response.success && response.data) {
      setTimelineEvents(prev => prev.map(e => e.id === id ? response.data : e));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to update timeline event');
      return false;
    }
  }, []);

  const deleteTimelineEvent = useCallback(async (id: number): Promise<boolean> => {
    const response = await adminAPI.deleteTimelineEvent(id);

    if (response.success) {
      setTimelineEvents(prev => prev.filter(e => e.id !== id));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to delete timeline event');
      return false;
    }
  }, []);

  // Commitments operations
  const fetchCommitments = useCallback(async (filters?: any, refresh = false) => {
    if (!isAuthenticated) return;

    setLoadingState('commitments', true);
    clearError('commitments');

    const response = await adminAPI.getCommitments(filters);

    if (response.success && response.data) {
      setCommitments(response.data);
    } else {
      setError('commitments', response.error || 'Failed to fetch commitments');
    }

    setLoadingState('commitments', false);
  }, [isAuthenticated, setLoadingState, clearError, setError]);

  const createCommitment = useCallback(async (data: any): Promise<boolean> => {
    const response = await adminAPI.createCommitment(data);

    if (response.success && response.data) {
      setCommitments(prev => [response.data, ...prev]);
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to create commitment');
      return false;
    }
  }, []);

  const updateCommitment = useCallback(async (id: number, data: any): Promise<boolean> => {
    const response = await adminAPI.updateCommitment(id, data);

    if (response.success && response.data) {
      setCommitments(prev => prev.map(c => c.id === id ? response.data : c));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to update commitment');
      return false;
    }
  }, []);

  const updateCommitmentProgress = useCallback(async (id: number, progress: any): Promise<boolean> => {
    const response = await adminAPI.updateCommitmentProgress(id, progress);

    if (response.success && response.data) {
      setCommitments(prev => prev.map(c => c.id === id ? response.data : c));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to update commitment progress');
      return false;
    }
  }, []);

  const deleteCommitment = useCallback(async (id: number): Promise<boolean> => {
    const response = await adminAPI.deleteCommitment(id);

    if (response.success) {
      setCommitments(prev => prev.filter(c => c.id !== id));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to delete commitment');
      return false;
    }
  }, []);

  // Voting Records operations
  const fetchVotingRecords = useCallback(async (filters?: any, refresh = false) => {
    if (!isAuthenticated) return;

    setLoadingState('votingRecords', true);
    clearError('votingRecords');

    const response = await adminAPI.getVotingRecords(filters);

    if (response.success && response.data) {
      setVotingRecords(response.data);
    } else {
      setError('votingRecords', response.error || 'Failed to fetch voting records');
    }

    setLoadingState('votingRecords', false);
  }, [isAuthenticated, setLoadingState, clearError, setError]);

  const createVotingRecord = useCallback(async (data: any): Promise<boolean> => {
    const response = await adminAPI.createVotingRecord(data);

    if (response.success && response.data) {
      setVotingRecords(prev => [response.data, ...prev]);
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to create voting record');
      return false;
    }
  }, []);

  const bulkImportVotingRecords = useCallback(async (records: any[]) => {
    const response = await adminAPI.bulkImportVotingRecords(records);

    if (response.success && response.data) {
      // Refresh voting records after bulk import
      await fetchVotingRecords(undefined, true);
      return {
        success: true,
        imported: response.data.imported,
        errors: response.data.errors || [],
      };
    } else {
      return {
        success: false,
        imported: 0,
        errors: [response.error || 'Failed to import voting records'],
      };
    }
  }, [fetchVotingRecords]);

  const updateVotingRecord = useCallback(async (id: number, data: any): Promise<boolean> => {
    const response = await adminAPI.updateVotingRecord(id, data);

    if (response.success && response.data) {
      setVotingRecords(prev => prev.map(v => v.id === id ? response.data : v));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to update voting record');
      return false;
    }
  }, []);

  const deleteVotingRecord = useCallback(async (id: number): Promise<boolean> => {
    const response = await adminAPI.deleteVotingRecord(id);

    if (response.success) {
      setVotingRecords(prev => prev.filter(v => v.id !== id));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to delete voting record');
      return false;
    }
  }, []);

  // Documents operations
  const fetchDocuments = useCallback(async (filters?: any, refresh = false) => {
    if (!isAuthenticated) return;

    setLoadingState('documents', true);
    clearError('documents');

    const response = await adminAPI.getDocuments(filters);

    if (response.success && response.data) {
      setDocuments(response.data);
    } else {
      setError('documents', response.error || 'Failed to fetch documents');
    }

    setLoadingState('documents', false);
  }, [isAuthenticated, setLoadingState, clearError, setError]);

  const createDocument = useCallback(async (data: any): Promise<boolean> => {
    const response = await adminAPI.createDocument(data);

    if (response.success && response.data) {
      setDocuments(prev => [response.data, ...prev]);
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to create document');
      return false;
    }
  }, []);

  const uploadDocument = useCallback(async (formData: FormData) => {
    const response = await adminAPI.uploadDocument(formData);

    if (response.success && response.data) {
      setDocuments(prev => [response.data, ...prev]);
      return response.data;
    } else {
      Alert.alert('Error', response.error || 'Failed to upload document');
      return null;
    }
  }, []);

  const updateDocument = useCallback(async (id: number, data: any): Promise<boolean> => {
    const response = await adminAPI.updateDocument(id, data);

    if (response.success && response.data) {
      setDocuments(prev => prev.map(d => d.id === id ? response.data : d));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to update document');
      return false;
    }
  }, []);

  const deleteDocument = useCallback(async (id: number): Promise<boolean> => {
    const response = await adminAPI.deleteDocument(id);

    if (response.success) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      return true;
    } else {
      Alert.alert('Error', response.error || 'Failed to delete document');
      return false;
    }
  }, []);

  // Analytics operations
  const fetchAnalytics = useCallback(async (period = '30d', refresh = false) => {
    if (!isAuthenticated) return;

    setLoadingState('analytics', true);
    clearError('analytics');

    const response = await adminAPI.getAnalytics(period as any);

    if (response.success && response.data) {
      setAnalytics(response.data);
    } else {
      setError('analytics', response.error || 'Failed to fetch analytics');
    }

    setLoadingState('analytics', false);
  }, [isAuthenticated, setLoadingState, clearError, setError]);

  // Data integrity operations
  const runIntegrityCheck = useCallback(async () => {
    const response = await adminAPI.runIntegrityCheck();

    if (response.success) {
      return response.data;
    } else {
      Alert.alert('Error', response.error || 'Failed to run integrity check');
      return null;
    }
  }, []);

  const getIntegrityReport = useCallback(async () => {
    const response = await adminAPI.getIntegrityReport();

    if (response.success) {
      return response.data;
    } else {
      Alert.alert('Error', response.error || 'Failed to get integrity report');
      return null;
    }
  }, []);

  // Utility functions
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPoliticians(true),
      fetchTimelineEvents(undefined, true),
      fetchCommitments(undefined, true),
      fetchVotingRecords(undefined, true),
      fetchDocuments(undefined, true),
      fetchAnalytics('30d', true),
    ]);
  }, [fetchPoliticians, fetchTimelineEvents, fetchCommitments, fetchVotingRecords, fetchDocuments, fetchAnalytics]);

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchPoliticians();
      fetchAnalytics();
    }
  }, [isAuthenticated, fetchPoliticians, fetchAnalytics]);

  const value: AdminDataContextType = {
    // Data state
    politicians,
    timelineEvents,
    commitments,
    votingRecords,
    documents,
    analytics,

    // Loading states
    loading,

    // Error states
    errors,

    // CRUD operations
    createPolitician,
    updatePolitician,
    deletePolitician,
    bulkDeletePoliticians,

    createTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,

    createCommitment,
    updateCommitment,
    updateCommitmentProgress,
    deleteCommitment,

    createVotingRecord,
    bulkImportVotingRecords,
    updateVotingRecord,
    deleteVotingRecord,

    createDocument,
    updateDocument,
    deleteDocument,
    uploadDocument,

    // Data fetching
    fetchPoliticians,
    fetchTimelineEvents,
    fetchCommitments,
    fetchVotingRecords,
    fetchDocuments,
    fetchAnalytics,

    // Search and filter
    searchPoliticians,

    // Utility functions
    refreshAll,
    clearErrors,

    // Data integrity
    runIntegrityCheck,
    getIntegrityReport,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};