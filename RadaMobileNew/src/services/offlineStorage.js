import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineStorageService {
  constructor() {
    this.lessonsKey = 'offline_lessons';
    this.progressKey = 'offline_progress';
    this.notesKey = 'offline_notes';
    this.quizResultsKey = 'offline_quiz_results';
    this.syncQueueKey = 'offline_sync_queue';
    this.userDataKey = 'offline_user_data';
    
    this.isOnline = true;
    this.syncInProgress = false;
    this.setupNetworkListener();
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline && !this.syncInProgress) {
        this.syncOfflineData();
      }
    });
  }

  // Save lesson content for offline access
  async saveLessonOffline(lessonId, lessonData) {
    try {
      const existingData = await this.getOfflineLessons();
      existingData[lessonId] = {
        ...lessonData,
        savedAt: new Date().toISOString(),
        isOffline: true,
        synced: false
      };
      
      await AsyncStorage.setItem(this.lessonsKey, JSON.stringify(existingData));
      console.log(`📱 Lesson ${lessonId} saved for offline access`);
      return true;
    } catch (error) {
      console.error('❌ Error saving lesson offline:', error);
      return false;
    }
  }

  // Get all offline lessons
  async getOfflineLessons() {
    try {
      const data = await AsyncStorage.getItem(this.lessonsKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting offline lessons:', error);
      return {};
    }
  }

  // Get specific offline lesson
  async getOfflineLesson(lessonId) {
    try {
      const lessons = await this.getOfflineLessons();
      return lessons[lessonId] || null;
    } catch (error) {
      console.error('Error getting offline lesson:', error);
      return null;
    }
  }

  // Save user progress offline
  async saveProgressOffline(lessonId, progressData) {
    try {
      const existingProgress = await this.getOfflineProgress();
      const progressId = `${lessonId}_${Date.now()}`;
      existingProgress[progressId] = {
        ...progressData,
        lessonId,
        savedAt: new Date().toISOString(),
        synced: false
      };
      
      await AsyncStorage.setItem(this.progressKey, JSON.stringify(existingProgress));
      console.log(`📊 Progress for lesson ${lessonId} saved offline`);
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        await this.addToSyncQueue('progress', existingProgress[progressId]);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error saving progress offline:', error);
      return false;
    }
  }

  // Get offline progress
  async getOfflineProgress() {
    try {
      const data = await AsyncStorage.getItem(this.progressKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting offline progress:', error);
      return {};
    }
  }

  // Save notes offline
  async saveNotesOffline(lessonId, notes) {
    try {
      const existingNotes = await this.getOfflineNotes();
      existingNotes[lessonId] = {
        notes,
        lessonId,
        savedAt: new Date().toISOString(),
        synced: false
      };
      
      await AsyncStorage.setItem(this.notesKey, JSON.stringify(existingNotes));
      console.log(`📝 Notes for lesson ${lessonId} saved offline`);
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        await this.addToSyncQueue('notes', existingNotes[lessonId]);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error saving notes offline:', error);
      return false;
    }
  }

  // Get offline notes
  async getOfflineNotes() {
    try {
      const data = await AsyncStorage.getItem(this.notesKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting offline notes:', error);
      return {};
    }
  }

  // Check if lesson is available offline
  async isLessonOffline(lessonId) {
    try {
      const lesson = await this.getOfflineLesson(lessonId);
      return lesson !== null;
    } catch (error) {
      console.error('Error checking offline lesson:', error);
      return false;
    }
  }

  // Save quiz results offline
  async saveQuizResultsOffline(quizData) {
    try {
      const existingResults = await this.getOfflineQuizResults();
      const resultId = `${quizData.quizId}_${Date.now()}`;
      existingResults[resultId] = {
        ...quizData,
        savedAt: new Date().toISOString(),
        synced: false
      };
      
      await AsyncStorage.setItem(this.quizResultsKey, JSON.stringify(existingResults));
      console.log(`🎯 Quiz results for ${quizData.quizId} saved offline`);
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        await this.addToSyncQueue('quiz', existingResults[resultId]);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error saving quiz results offline:', error);
      return false;
    }
  }

  // Get offline quiz results
  async getOfflineQuizResults() {
    try {
      const data = await AsyncStorage.getItem(this.quizResultsKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Error getting offline quiz results:', error);
      return {};
    }
  }

  // Add item to sync queue
  async addToSyncQueue(type, data) {
    try {
      const existingQueue = await this.getSyncQueue();
      const queueItem = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      
      existingQueue.push(queueItem);
      await AsyncStorage.setItem(this.syncQueueKey, JSON.stringify(existingQueue));
      console.log(`🔄 Added ${type} to sync queue`);
      return true;
    } catch (error) {
      console.error('❌ Error adding to sync queue:', error);
      return false;
    }
  }

  // Get sync queue
  async getSyncQueue() {
    try {
      const data = await AsyncStorage.getItem(this.syncQueueKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error getting sync queue:', error);
      return [];
    }
  }

  // Clear sync queue
  async clearSyncQueue() {
    try {
      await AsyncStorage.removeItem(this.syncQueueKey);
      console.log('🔄 Sync queue cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing sync queue:', error);
      return false;
    }
  }

  // Enhanced sync offline data when online
  async syncOfflineData() {
    if (this.syncInProgress || !this.isOnline) {
      return false;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting offline data sync...');

    try {
      // Get all offline data
      const [progress, notes, quizResults, syncQueue] = await Promise.all([
        this.getOfflineProgress(),
        this.getOfflineNotes(),
        this.getOfflineQuizResults(),
        this.getSyncQueue()
      ]);

      let syncCount = 0;
      let errorCount = 0;

      // Sync progress data
      for (const [progressId, progressData] of Object.entries(progress)) {
        if (!progressData.synced) {
          try {
            await this.syncProgressData(progressData);
            progress[progressId].synced = true;
            syncCount++;
          } catch (error) {
            console.error('❌ Error syncing progress:', error);
            errorCount++;
          }
        }
      }

      // Sync notes data
      for (const [lessonId, noteData] of Object.entries(notes)) {
        if (!noteData.synced) {
          try {
            await this.syncNotesData(noteData);
            notes[lessonId].synced = true;
            syncCount++;
          } catch (error) {
            console.error('❌ Error syncing notes:', error);
            errorCount++;
          }
        }
      }

      // Sync quiz results
      for (const [resultId, quizData] of Object.entries(quizResults)) {
        if (!quizData.synced) {
          try {
            await this.syncQuizData(quizData);
            quizResults[resultId].synced = true;
            syncCount++;
          } catch (error) {
            console.error('❌ Error syncing quiz results:', error);
            errorCount++;
          }
        }
      }

      // Process sync queue
      for (const queueItem of syncQueue) {
        try {
          await this.processSyncQueueItem(queueItem);
          syncCount++;
        } catch (error) {
          console.error('❌ Error processing sync queue item:', error);
          queueItem.retryCount++;
          errorCount++;
        }
      }

      // Save updated data back to storage
      await Promise.all([
        AsyncStorage.setItem(this.progressKey, JSON.stringify(progress)),
        AsyncStorage.setItem(this.notesKey, JSON.stringify(notes)),
        AsyncStorage.setItem(this.quizResultsKey, JSON.stringify(quizResults))
      ]);

      // Clear successfully synced items from queue
      const remainingQueue = syncQueue.filter(item => item.retryCount < 3);
      await AsyncStorage.setItem(this.syncQueueKey, JSON.stringify(remainingQueue));

      console.log(`✅ Sync completed: ${syncCount} items synced, ${errorCount} errors`);
      return true;
      
    } catch (error) {
      console.error('❌ Error during sync:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync progress data to backend
  async syncProgressData(progressData) {
    console.log('🔄 Syncing progress data:', progressData);
    // This would call your API service
    // await apiService.updateLessonProgress(progressData);
  }

  // Sync notes data to backend
  async syncNotesData(noteData) {
    console.log('🔄 Syncing notes data:', noteData);
    // This would call your API service
    // await apiService.updateLessonNotes(noteData.lessonId, noteData.notes);
  }

  // Sync quiz data to backend
  async syncQuizData(quizData) {
    console.log('🔄 Syncing quiz data:', quizData);
    // This would call your API service
    // await apiService.submitQuizResults(quizData);
  }

  // Process sync queue item
  async processSyncQueueItem(queueItem) {
    console.log('🔄 Processing sync queue item:', queueItem);
    switch (queueItem.type) {
      case 'progress':
        await this.syncProgressData(queueItem.data);
        break;
      case 'notes':
        await this.syncNotesData(queueItem.data);
        break;
      case 'quiz':
        await this.syncQuizData(queueItem.data);
        break;
      default:
        console.warn('⚠️ Unknown sync queue item type:', queueItem.type);
    }
  }

  // Get sync status
  async getSyncStatus() {
    try {
      const [progress, notes, quizResults, syncQueue] = await Promise.all([
        this.getOfflineProgress(),
        this.getOfflineNotes(),
        this.getOfflineQuizResults(),
        this.getSyncQueue()
      ]);

      const unsyncedProgress = Object.values(progress).filter(p => !p.synced).length;
      const unsyncedNotes = Object.values(notes).filter(n => !n.synced).length;
      const unsyncedQuiz = Object.values(quizResults).filter(q => !q.synced).length;
      const pendingQueue = syncQueue.length;

      return {
        isOnline: this.isOnline,
        syncInProgress: this.syncInProgress,
        unsyncedItems: unsyncedProgress + unsyncedNotes + unsyncedQuiz + pendingQueue,
        breakdown: {
          progress: unsyncedProgress,
          notes: unsyncedNotes,
          quiz: unsyncedQuiz,
          queue: pendingQueue
        }
      };
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return {
        isOnline: this.isOnline,
        syncInProgress: false,
        unsyncedItems: 0,
        breakdown: { progress: 0, notes: 0, quiz: 0, queue: 0 }
      };
    }
  }

  // Force sync (manual trigger)
  async forceSync() {
    if (this.isOnline) {
      return await this.syncOfflineData();
    } else {
      console.log('⚠️ Cannot sync: device is offline');
      return false;
    }
  }

  // Get offline storage stats
  async getStorageStats() {
    try {
      const lessons = await this.getOfflineLessons();
      const progress = await this.getOfflineProgress();
      const notes = await this.getOfflineNotes();
      
      return {
        lessonsCount: Object.keys(lessons).length,
        progressCount: Object.keys(progress).length,
        notesCount: Object.keys(notes).length,
        totalSize: JSON.stringify({ lessons, progress, notes }).length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { lessonsCount: 0, progressCount: 0, notesCount: 0, totalSize: 0 };
    }
  }

  // Clear all offline data
  async clearAllOfflineData() {
    try {
      await AsyncStorage.multiRemove([
        this.lessonsKey, 
        this.progressKey, 
        this.notesKey, 
        this.quizResultsKey, 
        this.syncQueueKey, 
        this.userDataKey
      ]);
      console.log('🗑️ All offline data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing offline data:', error);
      return false;
    }
  }
}

export default new OfflineStorageService();


    } catch (error) {
      console.error('❌ Error saving quiz results offline:', error);
      return false;
    }
  }

  // Get offline quiz results
  async getOfflineQuizResults() {
    try {
      const data = await AsyncStorage.getItem(this.quizResultsKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Error getting offline quiz results:', error);
      return {};
    }
  }

  // Add item to sync queue
  async addToSyncQueue(type, data) {
    try {
      const existingQueue = await this.getSyncQueue();
      const queueItem = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      
      existingQueue.push(queueItem);
      await AsyncStorage.setItem(this.syncQueueKey, JSON.stringify(existingQueue));
      console.log(`🔄 Added ${type} to sync queue`);
      return true;
    } catch (error) {
      console.error('❌ Error adding to sync queue:', error);
      return false;
    }
  }

  // Get sync queue
  async getSyncQueue() {
    try {
      const data = await AsyncStorage.getItem(this.syncQueueKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error getting sync queue:', error);
      return [];
    }
  }

  // Clear sync queue
  async clearSyncQueue() {
    try {
      await AsyncStorage.removeItem(this.syncQueueKey);
      console.log('🔄 Sync queue cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing sync queue:', error);
      return false;
    }
  }

  // Enhanced sync offline data when online
  async syncOfflineData() {
    if (this.syncInProgress || !this.isOnline) {
      return false;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting offline data sync...');

    try {
      // Get all offline data
      const [progress, notes, quizResults, syncQueue] = await Promise.all([
        this.getOfflineProgress(),
        this.getOfflineNotes(),
        this.getOfflineQuizResults(),
        this.getSyncQueue()
      ]);

      let syncCount = 0;
      let errorCount = 0;

      // Sync progress data
      for (const [progressId, progressData] of Object.entries(progress)) {
        if (!progressData.synced) {
          try {
            await this.syncProgressData(progressData);
            progress[progressId].synced = true;
            syncCount++;
          } catch (error) {
            console.error('❌ Error syncing progress:', error);
            errorCount++;
          }
        }
      }

      // Sync notes data
      for (const [lessonId, noteData] of Object.entries(notes)) {
        if (!noteData.synced) {
          try {
            await this.syncNotesData(noteData);
            notes[lessonId].synced = true;
            syncCount++;
          } catch (error) {
            console.error('❌ Error syncing notes:', error);
            errorCount++;
          }
        }
      }

      // Sync quiz results
      for (const [resultId, quizData] of Object.entries(quizResults)) {
        if (!quizData.synced) {
          try {
            await this.syncQuizData(quizData);
            quizResults[resultId].synced = true;
            syncCount++;
          } catch (error) {
            console.error('❌ Error syncing quiz results:', error);
            errorCount++;
          }
        }
      }

      // Process sync queue
      for (const queueItem of syncQueue) {
        try {
          await this.processSyncQueueItem(queueItem);
          syncCount++;
        } catch (error) {
          console.error('❌ Error processing sync queue item:', error);
          queueItem.retryCount++;
          errorCount++;
        }
      }

      // Save updated data back to storage
      await Promise.all([
        AsyncStorage.setItem(this.progressKey, JSON.stringify(progress)),
        AsyncStorage.setItem(this.notesKey, JSON.stringify(notes)),
        AsyncStorage.setItem(this.quizResultsKey, JSON.stringify(quizResults))
      ]);

      // Clear successfully synced items from queue
      const remainingQueue = syncQueue.filter(item => item.retryCount < 3);
      await AsyncStorage.setItem(this.syncQueueKey, JSON.stringify(remainingQueue));

      console.log(`✅ Sync completed: ${syncCount} items synced, ${errorCount} errors`);
      return true;
      
    } catch (error) {
      console.error('❌ Error during sync:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync progress data to backend
  async syncProgressData(progressData) {
    console.log('🔄 Syncing progress data:', progressData);
    // This would call your API service
    // await apiService.updateLessonProgress(progressData);
  }

  // Sync notes data to backend
  async syncNotesData(noteData) {
    console.log('🔄 Syncing notes data:', noteData);
    // This would call your API service
    // await apiService.updateLessonNotes(noteData.lessonId, noteData.notes);
  }

  // Sync quiz data to backend
  async syncQuizData(quizData) {
    console.log('🔄 Syncing quiz data:', quizData);
    // This would call your API service
    // await apiService.submitQuizResults(quizData);
  }

  // Process sync queue item
  async processSyncQueueItem(queueItem) {
    console.log('🔄 Processing sync queue item:', queueItem);
    switch (queueItem.type) {
      case 'progress':
        await this.syncProgressData(queueItem.data);
        break;
      case 'notes':
        await this.syncNotesData(queueItem.data);
        break;
      case 'quiz':
        await this.syncQuizData(queueItem.data);
        break;
      default:
        console.warn('⚠️ Unknown sync queue item type:', queueItem.type);
    }
  }

  // Get sync status
  async getSyncStatus() {
    try {
      const [progress, notes, quizResults, syncQueue] = await Promise.all([
        this.getOfflineProgress(),
        this.getOfflineNotes(),
        this.getOfflineQuizResults(),
        this.getSyncQueue()
      ]);

      const unsyncedProgress = Object.values(progress).filter(p => !p.synced).length;
      const unsyncedNotes = Object.values(notes).filter(n => !n.synced).length;
      const unsyncedQuiz = Object.values(quizResults).filter(q => !q.synced).length;
      const pendingQueue = syncQueue.length;

      return {
        isOnline: this.isOnline,
        syncInProgress: this.syncInProgress,
        unsyncedItems: unsyncedProgress + unsyncedNotes + unsyncedQuiz + pendingQueue,
        breakdown: {
          progress: unsyncedProgress,
          notes: unsyncedNotes,
          quiz: unsyncedQuiz,
          queue: pendingQueue
        }
      };
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return {
        isOnline: this.isOnline,
        syncInProgress: false,
        unsyncedItems: 0,
        breakdown: { progress: 0, notes: 0, quiz: 0, queue: 0 }
      };
    }
  }

  // Force sync (manual trigger)
  async forceSync() {
    if (this.isOnline) {
      return await this.syncOfflineData();
    } else {
      console.log('⚠️ Cannot sync: device is offline');
      return false;
    }
  }

  // Get offline storage stats
  async getStorageStats() {
    try {
      const lessons = await this.getOfflineLessons();
      const progress = await this.getOfflineProgress();
      const notes = await this.getOfflineNotes();
      
      return {
        lessonsCount: Object.keys(lessons).length,
        progressCount: Object.keys(progress).length,
        notesCount: Object.keys(notes).length,
        totalSize: JSON.stringify({ lessons, progress, notes }).length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { lessonsCount: 0, progressCount: 0, notesCount: 0, totalSize: 0 };
    }
  }

  // Clear all offline data
  async clearAllOfflineData() {
    try {
      await AsyncStorage.multiRemove([
        this.lessonsKey, 
        this.progressKey, 
        this.notesKey, 
        this.quizResultsKey, 
        this.syncQueueKey, 
        this.userDataKey
      ]);
      console.log('🗑️ All offline data cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing offline data:', error);
      return false;
    }
  }
}

export default new OfflineStorageService();

