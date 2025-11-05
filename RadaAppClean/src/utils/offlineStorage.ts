// utils/offlineStorage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import LearningAPIService from '../services/LearningAPIService';

interface PendingAction {
  type: 'complete_lesson' | 'submit_quiz' | 'update_progress' | 'enroll_module';
  lessonId?: number;
  quizId?: number;
  moduleId?: number;
  answers?: any[];
  timeSpent?: number;
  timestamp: string;
}

class OfflineStorage {
  private KEYS = {
    MODULES: 'offline_modules',
    LESSONS: 'offline_lessons',
    PROGRESS: 'offline_progress',
    PENDING_SYNC: 'pending_sync',
    USER_DATA: 'offline_user_data',
    QUIZ_DATA: 'offline_quiz_data',
  };

  // Save modules for offline access
  async saveModulesOffline(modules: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.MODULES, JSON.stringify(modules));
      console.log('Modules saved offline successfully');
    } catch (error) {
      console.error('Error saving modules offline:', error);
    }
  }

  // Get offline modules
  async getOfflineModules(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.MODULES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline modules:', error);
      return [];
    }
  }

  // Save lessons for offline access
  async saveLessonsOffline(moduleId: number, lessons: any[]): Promise<void> {
    try {
      const key = `${this.KEYS.LESSONS}_${moduleId}`;
      await AsyncStorage.setItem(key, JSON.stringify(lessons));
      console.log(`Lessons for module ${moduleId} saved offline`);
    } catch (error) {
      console.error('Error saving lessons offline:', error);
    }
  }

  // Get offline lessons for a module
  async getOfflineLessons(moduleId: number): Promise<any[]> {
    try {
      const key = `${this.KEYS.LESSONS}_${moduleId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline lessons:', error);
      return [];
    }
  }

  // Save user progress offline
  async saveProgressOffline(userId: number, progress: any): Promise<void> {
    try {
      const key = `${this.KEYS.PROGRESS}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress offline:', error);
    }
  }

  // Get offline progress
  async getOfflineProgress(userId: number): Promise<any> {
    try {
      const key = `${this.KEYS.PROGRESS}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline progress:', error);
      return null;
    }
  }

  // Save action for later sync
  async savePendingSync(action: Omit<PendingAction, 'timestamp'>): Promise<void> {
    try {
      const pending = await this.getPendingSync();
      pending.push({ ...action, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(this.KEYS.PENDING_SYNC, JSON.stringify(pending));
      console.log('Action saved for pending sync:', action.type);
    } catch (error) {
      console.error('Error saving pending sync:', error);
    }
  }

  // Get all pending sync actions
  async getPendingSync(): Promise<PendingAction[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.PENDING_SYNC);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending sync:', error);
      return [];
    }
  }

  // Sync all pending actions
  async syncPendingActions(): Promise<{ success: number; failed: number }> {
    let successCount = 0;
    let failedCount = 0;

    try {
      const pending = await this.getPendingSync();
      
      if (pending.length === 0) {
        console.log('No pending actions to sync');
        return { success: 0, failed: 0 };
      }

      console.log(`Syncing ${pending.length} pending actions...`);
      const failedActions: PendingAction[] = [];

      for (const action of pending) {
        try {
          await this.syncAction(action);
          successCount++;
          console.log(`✓ Synced: ${action.type}`);
        } catch (error) {
          console.error(`✗ Failed to sync: ${action.type}`, error);
          failedActions.push(action);
          failedCount++;
        }
      }

      // Keep only failed actions for retry
      await AsyncStorage.setItem(this.KEYS.PENDING_SYNC, JSON.stringify(failedActions));
      
      console.log(`Sync complete: ${successCount} success, ${failedCount} failed`);
      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('Error syncing pending actions:', error);
      return { success: successCount, failed: failedCount };
    }
  }

  // Sync individual action
  private async syncAction(action: PendingAction): Promise<void> {
    switch (action.type) {
      case 'complete_lesson':
        if (action.lessonId) {
          await LearningAPIService.completeLesson(action.lessonId);
        }
        break;
      
      case 'submit_quiz':
        if (action.quizId && action.answers && action.timeSpent !== undefined) {
          await LearningAPIService.submitQuiz(action.quizId, action.answers, action.timeSpent);
        }
        break;
      
      case 'enroll_module':
        if (action.moduleId) {
          await LearningAPIService.enrollModule(action.moduleId);
        }
        break;
      
      case 'update_progress':
        // Implement progress update API call
        console.log('Update progress sync not implemented');
        break;
      
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  // Clear all offline data
  async clearAllOfflineData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.MODULES,
        this.KEYS.LESSONS,
        this.KEYS.PROGRESS,
        this.KEYS.PENDING_SYNC,
        this.KEYS.USER_DATA,
        this.KEYS.QUIZ_DATA,
      ]);
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  // Check if there are pending syncs
  async hasPendingSync(): Promise<boolean> {
    const pending = await this.getPendingSync();
    return pending.length > 0;
  }

  // Get pending sync count
  async getPendingSyncCount(): Promise<number> {
    const pending = await this.getPendingSync();
    return pending.length;
  }

  // Save quiz data offline
  async saveQuizOffline(quizId: number, quizData: any): Promise<void> {
    try {
      const key = `${this.KEYS.QUIZ_DATA}_${quizId}`;
      await AsyncStorage.setItem(key, JSON.stringify(quizData));
    } catch (error) {
      console.error('Error saving quiz offline:', error);
    }
  }

  // Get offline quiz data
  async getOfflineQuiz(quizId: number): Promise<any> {
    try {
      const key = `${this.KEYS.QUIZ_DATA}_${quizId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline quiz:', error);
      return null;
    }
  }
}

export default new OfflineStorage();

// Install package:
// npm install @react-native-async-storage/async-storage