// services/cache.service.ts

import NodeCache from 'node-cache';

interface CacheStats {
  keys: number;
  hits: number;
  misses: number;
  ksize: number;
  vsize: number;
}

class CacheService {
  private cache: NodeCache;
  
  constructor() {
    this.cache = new NodeCache({ 
      stdTTL: 600, // 10 minutes default
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false, // Better performance
      deleteOnExpire: true,
    });
    
    // Setup event listeners
    this.cache.on('expired', (key, value) => {
      console.log(`[Cache] Key expired: ${key}`);
    });
    
    this.cache.on('del', (key, value) => {
      console.log(`[Cache] Key deleted: ${key}`);
    });
  }
  
  // Get value from cache
  get<T>(key: string): T | undefined {
    try {
      const value = this.cache.get<T>(key);
      if (value !== undefined) {
        console.log(`[Cache] HIT: ${key}`);
      } else {
        console.log(`[Cache] MISS: ${key}`);
      }
      return value;
    } catch (error) {
      console.error(`[Cache] Error getting key ${key}:`, error);
      return undefined;
    }
  }
  
  // Set value in cache
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const success = this.cache.set(key, value, ttl || 600);
      if (success) {
        console.log(`[Cache] SET: ${key} (TTL: ${ttl || 600}s)`);
      }
      return success;
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error);
      return false;
    }
  }
  
  // Delete key from cache
  del(key: string): number {
    try {
      const deletedCount = this.cache.del(key);
      console.log(`[Cache] DELETE: ${key} (${deletedCount} keys deleted)`);
      return deletedCount;
    } catch (error) {
      console.error(`[Cache] Error deleting key ${key}:`, error);
      return 0;
    }
  }
  
  // Delete multiple keys
  delMany(keys: string[]): number {
    try {
      const deletedCount = this.cache.del(keys);
      console.log(`[Cache] DELETE MANY: ${deletedCount} keys deleted`);
      return deletedCount;
    } catch (error) {
      console.error('[Cache] Error deleting multiple keys:', error);
      return 0;
    }
  }
  
  // Clear all cache
  flush(): void {
    try {
      this.cache.flushAll();
      console.log('[Cache] FLUSHED: All cache cleared');
    } catch (error) {
      console.error('[Cache] Error flushing cache:', error);
    }
  }
  
  // Get cache statistics
  getStats(): CacheStats {
    return this.cache.getStats();
  }
  
  // Get all keys
  keys(): string[] {
    return this.cache.keys();
  }
  
  // Check if key exists
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  // Get TTL for a key
  getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }
  
  // ==========================
  // DOMAIN-SPECIFIC METHODS
  // ==========================
  
  // Module cache methods
  getCachedModule(moduleId: number) {
    return this.get(`module:${moduleId}`);
  }
  
  setCachedModule(moduleId: number, data: any, ttl = 300) {
    return this.set(`module:${moduleId}`, data, ttl);
  }
  
  invalidateModuleCache(moduleId: number): void {
    this.delMany([
      `module:${moduleId}`,
      `module:${moduleId}:lessons`,
      `module:${moduleId}:quiz`,
      'modules:all',
      'modules:published',
      'modules:featured',
    ]);
  }
  
  // Lesson cache methods
  getCachedLesson(lessonId: number) {
    return this.get(`lesson:${lessonId}`);
  }
  
  setCachedLesson(lessonId: number, data: any, ttl = 300) {
    return this.set(`lesson:${lessonId}`, data, ttl);
  }
  
  invalidateLessonCache(lessonId: number, moduleId?: number): void {
    const keysToDelete = [`lesson:${lessonId}`];
    
    if (moduleId) {
      keysToDelete.push(`module:${moduleId}:lessons`);
    }
    
    this.delMany(keysToDelete);
  }
  
  // User progress cache methods
  getCachedUserProgress(userId: number) {
    return this.get(`user:${userId}:progress`);
  }
  
  setCachedUserProgress(userId: number, data: any, ttl = 60) {
    return this.set(`user:${userId}:progress`, data, ttl);
  }
  
  invalidateUserProgressCache(userId: number): void {
    this.delMany([
      `user:${userId}:progress`,
      `user:${userId}:enrollments`,
      `user:${userId}:stats`,
      `user:${userId}:achievements`,
    ]);
  }
  
  // Quiz cache methods
  getCachedQuiz(quizId: number) {
    return this.get(`quiz:${quizId}`);
  }
  
  setCachedQuiz(quizId: number, data: any, ttl = 300) {
    return this.set(`quiz:${quizId}`, data, ttl);
  }
  
  invalidateQuizCache(quizId: number, moduleId?: number): void {
    const keysToDelete = [`quiz:${quizId}`];
    
    if (moduleId) {
      keysToDelete.push(`module:${moduleId}:quiz`);
    }
    
    this.delMany(keysToDelete);
  }
  
  // Dashboard cache methods
  getCachedDashboardStats() {
    return this.get('dashboard:stats');
  }
  
  setCachedDashboardStats(data: any, ttl = 300) {
    return this.set('dashboard:stats', data, ttl);
  }
  
  invalidateDashboardCache(): void {
    this.delMany([
      'dashboard:stats',
      'dashboard:activity',
      'dashboard:analytics',
    ]);
  }
  
  // Leaderboard cache methods
  getCachedLeaderboard(timeframe: 'week' | 'month' | 'all') {
    return this.get(`leaderboard:${timeframe}`);
  }
  
  setCachedLeaderboard(timeframe: 'week' | 'month' | 'all', data: any, ttl = 300) {
    return this.set(`leaderboard:${timeframe}`, data, ttl);
  }
  
  invalidateLeaderboardCache(): void {
    this.delMany([
      'leaderboard:week',
      'leaderboard:month',
      'leaderboard:all',
    ]);
  }
  
  // Global invalidation (when major changes occur)
  invalidateAllLearningCache(): void {
    const keys = this.keys();
    const learningKeys = keys.filter(key => 
      key.startsWith('module:') ||
      key.startsWith('lesson:') ||
      key.startsWith('quiz:') ||
      key.startsWith('user:') ||
      key.startsWith('dashboard:') ||
      key.startsWith('leaderboard:')
    );
    
    if (learningKeys.length > 0) {
      this.delMany(learningKeys);
      console.log(`[Cache] Invalidated ${learningKeys.length} learning-related keys`);
    }
  }
}

export default new CacheService();

// Install package:
// npm install node-cache
// npm install --save-dev @types/node-cache