import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineStorageService {
  constructor() {
    this.lessonsKey = 'offline_lessons';
    this.progressKey = 'offline_progress';
    this.notesKey = 'offline_notes';
  }

  // Save lesson content for offline access
  async saveLessonOffline(lessonId, lessonData) {
    try {
      const existingData = await this.getOfflineLessons();
      existingData[lessonId] = {
        ...lessonData,
        savedAt: new Date().toISOString(),
        isOffline: true
      };
      
      await AsyncStorage.setItem(this.lessonsKey, JSON.stringify(existingData));
      console.log(`Lesson ${lessonId} saved for offline access`);
      return true;
    } catch (error) {
      console.error('Error saving lesson offline:', error);
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
      existingProgress[lessonId] = {
        ...progressData,
        savedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(this.progressKey, JSON.stringify(existingProgress));
      console.log(`Progress for lesson ${lessonId} saved offline`);
      return true;
    } catch (error) {
      console.error('Error saving progress offline:', error);
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
        savedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(this.notesKey, JSON.stringify(existingNotes));
      console.log(`Notes for lesson ${lessonId} saved offline`);
      return true;
    } catch (error) {
      console.error('Error saving notes offline:', error);
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

  // Sync offline data when online
  async syncOfflineData() {
    try {
      const progress = await this.getOfflineProgress();
      const notes = await this.getOfflineNotes();
      
      // Here you would typically send this data to your backend
      console.log('Syncing offline data:', { progress, notes });
      
      // Clear offline data after successful sync
      await AsyncStorage.multiRemove([this.progressKey, this.notesKey]);
      console.log('Offline data synced and cleared');
      
      return true;
    } catch (error) {
      console.error('Error syncing offline data:', error);
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
      await AsyncStorage.multiRemove([this.lessonsKey, this.progressKey, this.notesKey]);
      console.log('All offline data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  }
}

export default new OfflineStorageService();

