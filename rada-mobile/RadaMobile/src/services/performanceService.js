class PerformanceService {
  constructor() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      networkRequests: [],
      userInteractions: []
    };
    this.isMonitoring = false;
    this.startTime = null;
  }

  // Start performance monitoring
  startMonitoring() {
    this.isMonitoring = true;
    this.startTime = Date.now();
    console.log('🚀 Performance monitoring started');
  }

  // Stop performance monitoring
  stopMonitoring() {
    this.isMonitoring = false;
    const totalTime = Date.now() - this.startTime;
    console.log(`⏱️ Performance monitoring stopped. Total time: ${totalTime}ms`);
    return this.getPerformanceReport();
  }

  // Start timing a specific operation
  startTiming(operationName) {
    if (!this.isMonitoring) return null;
    
    const timingId = `${operationName}_${Date.now()}`;
    performance.mark(`${timingId}_start`);
    return timingId;
  }

  // End timing and record the result
  endTiming(timingId) {
    if (!this.isMonitoring || !timingId) return;
    
    try {
      performance.mark(`${timingId}_end`);
      performance.measure(timingId, `${timingId}_start`, `${timingId}_end`);
      
      const measure = performance.getEntriesByName(timingId)[0];
      if (measure) {
        this.metrics.renderTimes.push({
          operation: timingId.split('_')[0],
          duration: measure.duration,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.warn('Performance timing error:', error);
    }
  }

  // Record memory usage
  recordMemoryUsage() {
    if (!this.isMonitoring) return;
    
    if (performance.memory) {
      this.metrics.memoryUsage.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });
    }
  }

  // Record network request
  recordNetworkRequest(url, method, duration, status) {
    if (!this.isMonitoring) return;
    
    this.metrics.networkRequests.push({
      url,
      method,
      duration,
      status,
      timestamp: Date.now()
    });
  }

  // Record user interaction
  recordUserInteraction(action, component, duration = 0) {
    if (!this.isMonitoring) return;
    
    this.metrics.userInteractions.push({
      action,
      component,
      duration,
      timestamp: Date.now()
    });
  }

  // Get performance report
  getPerformanceReport() {
    const avgRenderTime = this.calculateAverage(this.metrics.renderTimes, 'duration');
    const avgMemoryUsage = this.calculateAverage(this.metrics.memoryUsage, 'used');
    const totalNetworkRequests = this.metrics.networkRequests.length;
    const totalUserInteractions = this.metrics.userInteractions.length;

    return {
      summary: {
        avgRenderTime: Math.round(avgRenderTime),
        avgMemoryUsage: Math.round(avgMemoryUsage / 1024 / 1024), // MB
        totalNetworkRequests,
        totalUserInteractions,
        monitoringDuration: this.startTime ? Date.now() - this.startTime : 0
      },
      details: this.metrics,
      recommendations: this.generateRecommendations()
    };
  }

  // Calculate average for a specific property
  calculateAverage(array, property) {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, item) => acc + (item[property] || 0), 0);
    return sum / array.length;
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    const avgRenderTime = this.calculateAverage(this.metrics.renderTimes, 'duration');
    
    if (avgRenderTime > 16) {
      recommendations.push({
        type: 'warning',
        message: 'Slow render times detected. Consider optimizing components or using React.memo()'
      });
    }
    
    if (this.metrics.memoryUsage.length > 0) {
      const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      const memoryUsagePercent = (latestMemory.used / latestMemory.limit) * 100;
      
      if (memoryUsagePercent > 80) {
        recommendations.push({
          type: 'critical',
          message: 'High memory usage detected. Consider implementing memory optimization strategies'
        });
      }
    }
    
    const slowNetworkRequests = this.metrics.networkRequests.filter(req => req.duration > 3000);
    if (slowNetworkRequests.length > 0) {
      recommendations.push({
        type: 'info',
        message: `${slowNetworkRequests.length} slow network requests detected. Consider implementing caching or request optimization`
      });
    }
    
    return recommendations;
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      networkRequests: [],
      userInteractions: []
    };
  }

  // Get real-time performance data
  getRealTimeMetrics() {
    return {
      isMonitoring: this.isMonitoring,
      currentMemory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      totalMetrics: {
        renderTimes: this.metrics.renderTimes.length,
        networkRequests: this.metrics.networkRequests.length,
        userInteractions: this.metrics.userInteractions.length
      }
    };
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

export default performanceService;
