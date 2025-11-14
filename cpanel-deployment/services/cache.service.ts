import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600, // 10 minutes default
      checkperiod: 120
    });
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 600);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  // Cache invalidation patterns
  invalidateModuleCache(moduleId: number): void {
    this.del(`module:${moduleId}`);
    this.del(`module:${moduleId}:lessons`);
    this.del('modules:all');
    this.del('modules:published');
  }

  invalidateUserProgressCache(userId: number): void {
    this.del(`user:${userId}:progress`);
    this.del(`user:${userId}:enrollments`);
  }
}

export default new CacheService();

// Usage example in controllers:
// const cached = CacheService.get(cacheKey);
// if (cached) {
//   return res.json({ success: true, module: cached });
// }
//
// const module = await Module.findByPk(moduleId);
// CacheService.set(cacheKey, module, 300); // 5 minutes
