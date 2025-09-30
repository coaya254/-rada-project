import { Performance } from 'expo-performance';
import { Dimensions, Platform } from 'react-native';

class PerformanceService {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
    this.memoryUsage = [];
    this.frameDrops = 0;
    this.isMonitoring = false;
    this.performanceThresholds = {
      screenLoad: 1000, // 1 second
      apiCall: 2000, // 2 seconds
      imageLoad: 1000, // 1 second
      animation: 16, // 60 FPS = 16ms per frame
    };
  }

  // Start performance monitoring
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startMemoryMonitoring();
    this.startFrameRateMonitoring();
    console.log('🚀 Performance monitoring started');
  }

  // Stop performance monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ Performance monitoring stopped');
  }

  // Mark performance timing
  mark(name, value = null) {
    if (value !== null) {
      Performance.mark(name, value);
    } else {
      Performance.mark(name);
    }
  }

  // Measure performance between two marks
  measure(name, startMark, endMark) {
    try {
      Performance.measure(name, startMark, endMark);
      const entry = Performance.getEntriesByName(name, 'measure')[0];
      if (entry) {
        this.recordMetric(name, entry.duration);
        return entry.duration;
      }
    } catch (error) {
      console.warn('Performance measure failed:', error);
    }
    return null;
  }

  // Start timing
  startTiming(name) {
    this.timers.set(name, Date.now());
    this.mark(`${name}-start`);
  }

  // End timing and record metric
  endTiming(name) {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`No start time found for ${name}`);
      return null;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);
    this.mark(`${name}-end`);
    
    this.recordMetric(name, duration);
    this.checkPerformanceThreshold(name, duration);
    
    return duration;
  }

  // Record performance metric
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name);
    metrics.push({
      value,
      timestamp: Date.now(),
      platform: Platform.OS,
    });

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // Get performance metrics
  getMetrics(name = null) {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return Object.fromEntries(this.metrics);
  }

  // Get average performance
  getAverageMetric(name) {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // Check if performance meets threshold
  checkPerformanceThreshold(name, value) {
    const threshold = this.performanceThresholds[name];
    if (threshold && value > threshold) {
      console.warn(`⚠️ Performance warning: ${name} took ${value}ms (threshold: ${threshold}ms)`);
      this.recordPerformanceIssue(name, value, threshold);
    }
  }

  // Record performance issue
  recordPerformanceIssue(name, actualValue, threshold) {
    const issue = {
      name,
      actualValue,
      threshold,
      timestamp: Date.now(),
      platform: Platform.OS,
      severity: actualValue > threshold * 2 ? 'critical' : 'warning',
    };

    // Store in AsyncStorage for later analysis
    this.storePerformanceIssue(issue);
  }

  // Store performance issue
  async storePerformanceIssue(issue) {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const key = 'performance_issues';
      const existing = await AsyncStorage.getItem(key);
      const issues = existing ? JSON.parse(existing) : [];
      
      issues.push(issue);
      
      // Keep only last 50 issues
      if (issues.length > 50) {
        issues.splice(0, issues.length - 50);
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(issues));
    } catch (error) {
      console.error('Failed to store performance issue:', error);
    }
  }

  // Memory monitoring
  startMemoryMonitoring() {
    if (!this.isMonitoring) return;

    const checkMemory = () => {
      if (Platform.OS === 'ios') {
        // iOS memory monitoring
        const memoryInfo = {
          timestamp: Date.now(),
          platform: Platform.OS,
          // Note: Actual memory monitoring would require native modules
          estimated: this.estimateMemoryUsage(),
        };
        this.memoryUsage.push(memoryInfo);
      }
    };

    // Check memory every 5 seconds
    this.memoryInterval = setInterval(checkMemory, 5000);
  }

  // Estimate memory usage based on app state
  estimateMemoryUsage() {
    const baseMemory = 50; // Base app memory
    const screenMemory = 20; // Per screen
    const imageMemory = 5; // Per image
    const dataMemory = 1; // Per data item

    const screenCount = this.metrics.size;
    const imageCount = this.metrics.get('imageLoad')?.length || 0;
    const dataCount = this.metrics.get('apiCall')?.length || 0;

    return baseMemory + (screenCount * screenMemory) + (imageCount * imageMemory) + (dataCount * dataMemory);
  }

  // Frame rate monitoring
  startFrameRateMonitoring() {
    if (!this.isMonitoring) return;

    let lastTime = Date.now();
    let frameCount = 0;

    const checkFrameRate = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      
      if (deltaTime >= 1000) { // Check every second
        const fps = (frameCount * 1000) / deltaTime;
        
        if (fps < 50) { // Below 50 FPS is considered poor
          this.frameDrops++;
          this.recordPerformanceIssue('low_fps', fps, 50);
        }
        
        frameCount = 0;
        lastTime = now;
      }
      
      frameCount++;
      requestAnimationFrame(checkFrameRate);
    };

    requestAnimationFrame(checkFrameRate);
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      isMonitoring: this.isMonitoring,
      metrics: {},
      averages: {},
      issues: this.frameDrops,
      memoryUsage: this.memoryUsage.slice(-10), // Last 10 measurements
    };

    // Calculate averages for each metric
    for (const [name, metrics] of this.metrics) {
      summary.averages[name] = this.getAverageMetric(name);
      summary.metrics[name] = {
        count: metrics.length,
        latest: metrics[metrics.length - 1]?.value || 0,
        min: Math.min(...metrics.map(m => m.value)),
        max: Math.max(...metrics.map(m => m.value)),
      };
    }

    return summary;
  }

  // Clear performance data
  clearMetrics() {
    this.metrics.clear();
    this.timers.clear();
    this.memoryUsage = [];
    this.frameDrops = 0;
    console.log('🧹 Performance metrics cleared');
  }

  // Screen load performance
  measureScreenLoad(screenName, loadFunction) {
    this.startTiming(`screen-${screenName}`);
    
    return new Promise(async (resolve) => {
      try {
        const result = await loadFunction();
        this.endTiming(`screen-${screenName}`);
        resolve(result);
      } catch (error) {
        this.endTiming(`screen-${screenName}`);
        console.error(`Screen load error for ${screenName}:`, error);
        resolve(null);
      }
    });
  }

  // API call performance
  measureAPICall(apiName, apiCall) {
    this.startTiming(`api-${apiName}`);
    
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiCall();
        this.endTiming(`api-${apiName}`);
        resolve(result);
      } catch (error) {
        this.endTiming(`api-${apiName}`);
        console.error(`API call error for ${apiName}:`, error);
        reject(error);
      }
    });
  }

  // Image load performance
  measureImageLoad(imageName, imageLoad) {
    this.startTiming(`image-${imageName}`);
    
    return new Promise(async (resolve) => {
      try {
        const result = await imageLoad();
        this.endTiming(`image-${imageName}`);
        resolve(result);
      } catch (error) {
        this.endTiming(`image-${imageName}`);
        console.error(`Image load error for ${imageName}:`, error);
        resolve(null);
      }
    });
  }

  // Animation performance
  measureAnimation(animationName, animationFunction) {
    this.startTiming(`animation-${animationName}`);
    
    return new Promise(async (resolve) => {
      try {
        const result = await animationFunction();
        this.endTiming(`animation-${animationName}`);
        resolve(result);
      } catch (error) {
        this.endTiming(`animation-${animationName}`);
        console.error(`Animation error for ${animationName}:`, error);
        resolve(null);
      }
    });
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    const recommendations = [];
    const averages = this.getPerformanceSummary().averages;

    // Screen load recommendations
    if (averages['screen-LearningHub'] > 1000) {
      recommendations.push({
        type: 'screen_load',
        message: 'LearningHub screen load time is slow. Consider lazy loading components.',
        priority: 'high',
      });
    }

    // API call recommendations
    if (averages['api-getModules'] > 2000) {
      recommendations.push({
        type: 'api_performance',
        message: 'Module API calls are slow. Consider caching or pagination.',
        priority: 'medium',
      });
    }

    // Image load recommendations
    if (averages['image-load'] > 1000) {
      recommendations.push({
        type: 'image_optimization',
        message: 'Image loading is slow. Consider image optimization or lazy loading.',
        priority: 'medium',
      });
    }

    // Memory recommendations
    const currentMemory = this.estimateMemoryUsage();
    if (currentMemory > 150) {
      recommendations.push({
        type: 'memory_usage',
        message: 'Memory usage is high. Consider implementing memory cleanup.',
        priority: 'high',
      });
    }

    // Frame rate recommendations
    if (this.frameDrops > 10) {
      recommendations.push({
        type: 'frame_rate',
        message: 'Frame rate drops detected. Consider optimizing animations.',
        priority: 'high',
      });
    }

    return recommendations;
  }

  // Export performance data
  async exportPerformanceData() {
    const summary = this.getPerformanceSummary();
    const recommendations = this.getPerformanceRecommendations();
    
    return {
      summary,
      recommendations,
      timestamp: Date.now(),
      platform: Platform.OS,
      version: '1.0.0',
    };
  }
}

export default new PerformanceService();

import { Dimensions, Platform } from 'react-native';

class PerformanceService {
  constructor() {
    this.metrics = new Map();
    this.timers = new Map();
    this.memoryUsage = [];
    this.frameDrops = 0;
    this.isMonitoring = false;
    this.performanceThresholds = {
      screenLoad: 1000, // 1 second
      apiCall: 2000, // 2 seconds
      imageLoad: 1000, // 1 second
      animation: 16, // 60 FPS = 16ms per frame
    };
  }

  // Start performance monitoring
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startMemoryMonitoring();
    this.startFrameRateMonitoring();
    console.log('🚀 Performance monitoring started');
  }

  // Stop performance monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ Performance monitoring stopped');
  }

  // Mark performance timing
  mark(name, value = null) {
    if (value !== null) {
      Performance.mark(name, value);
    } else {
      Performance.mark(name);
    }
  }

  // Measure performance between two marks
  measure(name, startMark, endMark) {
    try {
      Performance.measure(name, startMark, endMark);
      const entry = Performance.getEntriesByName(name, 'measure')[0];
      if (entry) {
        this.recordMetric(name, entry.duration);
        return entry.duration;
      }
    } catch (error) {
      console.warn('Performance measure failed:', error);
    }
    return null;
  }

  // Start timing
  startTiming(name) {
    this.timers.set(name, Date.now());
    this.mark(`${name}-start`);
  }

  // End timing and record metric
  endTiming(name) {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`No start time found for ${name}`);
      return null;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);
    this.mark(`${name}-end`);
    
    this.recordMetric(name, duration);
    this.checkPerformanceThreshold(name, duration);
    
    return duration;
  }

  // Record performance metric
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name);
    metrics.push({
      value,
      timestamp: Date.now(),
      platform: Platform.OS,
    });

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  // Get performance metrics
  getMetrics(name = null) {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return Object.fromEntries(this.metrics);
  }

  // Get average performance
  getAverageMetric(name) {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // Check if performance meets threshold
  checkPerformanceThreshold(name, value) {
    const threshold = this.performanceThresholds[name];
    if (threshold && value > threshold) {
      console.warn(`⚠️ Performance warning: ${name} took ${value}ms (threshold: ${threshold}ms)`);
      this.recordPerformanceIssue(name, value, threshold);
    }
  }

  // Record performance issue
  recordPerformanceIssue(name, actualValue, threshold) {
    const issue = {
      name,
      actualValue,
      threshold,
      timestamp: Date.now(),
      platform: Platform.OS,
      severity: actualValue > threshold * 2 ? 'critical' : 'warning',
    };

    // Store in AsyncStorage for later analysis
    this.storePerformanceIssue(issue);
  }

  // Store performance issue
  async storePerformanceIssue(issue) {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const key = 'performance_issues';
      const existing = await AsyncStorage.getItem(key);
      const issues = existing ? JSON.parse(existing) : [];
      
      issues.push(issue);
      
      // Keep only last 50 issues
      if (issues.length > 50) {
        issues.splice(0, issues.length - 50);
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(issues));
    } catch (error) {
      console.error('Failed to store performance issue:', error);
    }
  }

  // Memory monitoring
  startMemoryMonitoring() {
    if (!this.isMonitoring) return;

    const checkMemory = () => {
      if (Platform.OS === 'ios') {
        // iOS memory monitoring
        const memoryInfo = {
          timestamp: Date.now(),
          platform: Platform.OS,
          // Note: Actual memory monitoring would require native modules
          estimated: this.estimateMemoryUsage(),
        };
        this.memoryUsage.push(memoryInfo);
      }
    };

    // Check memory every 5 seconds
    this.memoryInterval = setInterval(checkMemory, 5000);
  }

  // Estimate memory usage based on app state
  estimateMemoryUsage() {
    const baseMemory = 50; // Base app memory
    const screenMemory = 20; // Per screen
    const imageMemory = 5; // Per image
    const dataMemory = 1; // Per data item

    const screenCount = this.metrics.size;
    const imageCount = this.metrics.get('imageLoad')?.length || 0;
    const dataCount = this.metrics.get('apiCall')?.length || 0;

    return baseMemory + (screenCount * screenMemory) + (imageCount * imageMemory) + (dataCount * dataMemory);
  }

  // Frame rate monitoring
  startFrameRateMonitoring() {
    if (!this.isMonitoring) return;

    let lastTime = Date.now();
    let frameCount = 0;

    const checkFrameRate = () => {
      const now = Date.now();
      const deltaTime = now - lastTime;
      
      if (deltaTime >= 1000) { // Check every second
        const fps = (frameCount * 1000) / deltaTime;
        
        if (fps < 50) { // Below 50 FPS is considered poor
          this.frameDrops++;
          this.recordPerformanceIssue('low_fps', fps, 50);
        }
        
        frameCount = 0;
        lastTime = now;
      }
      
      frameCount++;
      requestAnimationFrame(checkFrameRate);
    };

    requestAnimationFrame(checkFrameRate);
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      isMonitoring: this.isMonitoring,
      metrics: {},
      averages: {},
      issues: this.frameDrops,
      memoryUsage: this.memoryUsage.slice(-10), // Last 10 measurements
    };

    // Calculate averages for each metric
    for (const [name, metrics] of this.metrics) {
      summary.averages[name] = this.getAverageMetric(name);
      summary.metrics[name] = {
        count: metrics.length,
        latest: metrics[metrics.length - 1]?.value || 0,
        min: Math.min(...metrics.map(m => m.value)),
        max: Math.max(...metrics.map(m => m.value)),
      };
    }

    return summary;
  }

  // Clear performance data
  clearMetrics() {
    this.metrics.clear();
    this.timers.clear();
    this.memoryUsage = [];
    this.frameDrops = 0;
    console.log('🧹 Performance metrics cleared');
  }

  // Screen load performance
  measureScreenLoad(screenName, loadFunction) {
    this.startTiming(`screen-${screenName}`);
    
    return new Promise(async (resolve) => {
      try {
        const result = await loadFunction();
        this.endTiming(`screen-${screenName}`);
        resolve(result);
      } catch (error) {
        this.endTiming(`screen-${screenName}`);
        console.error(`Screen load error for ${screenName}:`, error);
        resolve(null);
      }
    });
  }

  // API call performance
  measureAPICall(apiName, apiCall) {
    this.startTiming(`api-${apiName}`);
    
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiCall();
        this.endTiming(`api-${apiName}`);
        resolve(result);
      } catch (error) {
        this.endTiming(`api-${apiName}`);
        console.error(`API call error for ${apiName}:`, error);
        reject(error);
      }
    });
  }

  // Image load performance
  measureImageLoad(imageName, imageLoad) {
    this.startTiming(`image-${imageName}`);
    
    return new Promise(async (resolve) => {
      try {
        const result = await imageLoad();
        this.endTiming(`image-${imageName}`);
        resolve(result);
      } catch (error) {
        this.endTiming(`image-${imageName}`);
        console.error(`Image load error for ${imageName}:`, error);
        resolve(null);
      }
    });
  }

  // Animation performance
  measureAnimation(animationName, animationFunction) {
    this.startTiming(`animation-${animationName}`);
    
    return new Promise(async (resolve) => {
      try {
        const result = await animationFunction();
        this.endTiming(`animation-${animationName}`);
        resolve(result);
      } catch (error) {
        this.endTiming(`animation-${animationName}`);
        console.error(`Animation error for ${animationName}:`, error);
        resolve(null);
      }
    });
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    const recommendations = [];
    const averages = this.getPerformanceSummary().averages;

    // Screen load recommendations
    if (averages['screen-LearningHub'] > 1000) {
      recommendations.push({
        type: 'screen_load',
        message: 'LearningHub screen load time is slow. Consider lazy loading components.',
        priority: 'high',
      });
    }

    // API call recommendations
    if (averages['api-getModules'] > 2000) {
      recommendations.push({
        type: 'api_performance',
        message: 'Module API calls are slow. Consider caching or pagination.',
        priority: 'medium',
      });
    }

    // Image load recommendations
    if (averages['image-load'] > 1000) {
      recommendations.push({
        type: 'image_optimization',
        message: 'Image loading is slow. Consider image optimization or lazy loading.',
        priority: 'medium',
      });
    }

    // Memory recommendations
    const currentMemory = this.estimateMemoryUsage();
    if (currentMemory > 150) {
      recommendations.push({
        type: 'memory_usage',
        message: 'Memory usage is high. Consider implementing memory cleanup.',
        priority: 'high',
      });
    }

    // Frame rate recommendations
    if (this.frameDrops > 10) {
      recommendations.push({
        type: 'frame_rate',
        message: 'Frame rate drops detected. Consider optimizing animations.',
        priority: 'high',
      });
    }

    return recommendations;
  }

  // Export performance data
  async exportPerformanceData() {
    const summary = this.getPerformanceSummary();
    const recommendations = this.getPerformanceRecommendations();
    
    return {
      summary,
      recommendations,
      timestamp: Date.now(),
      platform: Platform.OS,
      version: '1.0.0',
    };
  }
}

export default new PerformanceService();
