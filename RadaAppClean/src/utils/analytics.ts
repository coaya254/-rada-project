// utils/analytics.ts

class AnalyticsService {
    private enabled: boolean = true;
  
    // Initialize analytics
    initialize() {
      console.log('[Analytics] Service initialized');
      // Initialize your analytics service here (Firebase, Mixpanel, etc.)
    }
  
    // Enable/disable analytics
    setEnabled(enabled: boolean) {
      this.enabled = enabled;
      console.log(`[Analytics] ${enabled ? 'Enabled' : 'Disabled'}`);
    }
  
    // Track generic event
    trackEvent(eventName: string, properties?: Record<string, any>) {
      if (!this.enabled) return;
      
      console.log(`[Analytics] Event: ${eventName}`, properties);
      
      // Send to your analytics service
      // Example for Firebase:
      // analytics().logEvent(eventName, properties);
      
      // Example for Mixpanel:
      // mixpanel.track(eventName, properties);
    }
  
    // ==========================
    // LEARNING EVENTS
    // ==========================
  
    trackModuleStarted(moduleId: number, moduleName: string) {
      this.trackEvent('module_started', { 
        moduleId, 
        moduleName,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackModuleCompleted(moduleId: number, moduleName: string, timeSpent: number, xpEarned: number) {
      this.trackEvent('module_completed', { 
        moduleId, 
        moduleName, 
        timeSpent,
        xpEarned,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackModuleEnrolled(moduleId: number, moduleName: string) {
      this.trackEvent('module_enrolled', {
        moduleId,
        moduleName,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackLessonStarted(lessonId: number, lessonName: string, moduleId: number) {
      this.trackEvent('lesson_started', { 
        lessonId, 
        lessonName, 
        moduleId,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackLessonCompleted(lessonId: number, lessonName: string, timeSpent: number, xpEarned: number) {
      this.trackEvent('lesson_completed', { 
        lessonId, 
        lessonName, 
        timeSpent,
        xpEarned,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackQuizStarted(quizId: number, quizName: string, moduleId?: number) {
      this.trackEvent('quiz_started', { 
        quizId, 
        quizName,
        moduleId,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackQuizCompleted(
      quizId: number, 
      score: number, 
      passed: boolean, 
      timeSpent: number,
      correctAnswers: number,
      totalQuestions: number
    ) {
      this.trackEvent('quiz_completed', { 
        quizId, 
        score, 
        passed, 
        timeSpent,
        correctAnswers,
        totalQuestions,
        accuracy: Math.round((correctAnswers / totalQuestions) * 100),
        timestamp: new Date().toISOString(),
      });
    }
  
    trackQuizRetried(quizId: number, previousScore: number) {
      this.trackEvent('quiz_retried', {
        quizId,
        previousScore,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackVideoWatched(lessonId: number, duration: number, completed: boolean, percentage: number) {
      this.trackEvent('video_watched', { 
        lessonId, 
        duration, 
        completed,
        percentage,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackVideoPlayed(lessonId: number, videoUrl: string) {
      this.trackEvent('video_played', {
        lessonId,
        videoUrl,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackVideoPaused(lessonId: number, position: number, duration: number) {
      this.trackEvent('video_paused', {
        lessonId,
        position,
        duration,
        percentage: Math.round((position / duration) * 100),
        timestamp: new Date().toISOString(),
      });
    }
  
    // ==========================
    // USER ENGAGEMENT
    // ==========================
  
    trackScreenView(screenName: string, previousScreen?: string) {
      this.trackEvent('screen_view', { 
        screenName,
        previousScreen,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackButtonClick(buttonName: string, screenName: string, context?: string) {
      this.trackEvent('button_click', { 
        buttonName, 
        screenName,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackSearch(query: string, resultsCount: number, screenName: string) {
      this.trackEvent('search_performed', {
        query,
        resultsCount,
        screenName,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackFilterApplied(filterType: string, filterValue: string, screenName: string) {
      this.trackEvent('filter_applied', {
        filterType,
        filterValue,
        screenName,
        timestamp: new Date().toISOString(),
      });
    }
  
    // ==========================
    // GAMIFICATION
    // ==========================
  
    trackXPEarned(amount: number, source: string, sourceId?: number) {
      this.trackEvent('xp_earned', {
        amount,
        source, // 'lesson', 'quiz', 'achievement', etc.
        sourceId,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackLevelUp(newLevel: number, totalXP: number) {
      this.trackEvent('level_up', {
        newLevel,
        totalXP,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackAchievementUnlocked(achievementId: number, achievementName: string, xpEarned: number) {
      this.trackEvent('achievement_unlocked', {
        achievementId,
        achievementName,
        xpEarned,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackStreakMilestone(streakDays: number) {
      this.trackEvent('streak_milestone', {
        streakDays,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackStreakBroken(previousStreak: number) {
      this.trackEvent('streak_broken', {
        previousStreak,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackLeaderboardViewed(timeframe: 'week' | 'month' | 'all', userRank?: number) {
      this.trackEvent('leaderboard_viewed', {
        timeframe,
        userRank,
        timestamp: new Date().toISOString(),
      });
    }
  
    // ==========================
    // SOCIAL & SHARING
    // ==========================
  
    trackAchievementShared(achievementName: string, platform: string) {
      this.trackEvent('achievement_shared', {
        achievementName,
        platform, // 'twitter', 'facebook', 'generic'
        timestamp: new Date().toISOString(),
      });
    }
  
    trackModuleShared(moduleId: number, moduleName: string, platform: string) {
      this.trackEvent('module_shared', {
        moduleId,
        moduleName,
        platform,
        timestamp: new Date().toISOString(),
      });
    }
  
    // ==========================
    // PERFORMANCE & QUALITY
    // ==========================
  
    trackLoadTime(screenName: string, loadTime: number) {
      this.trackEvent('load_time', {
        screenName,
        loadTime,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackAPICall(endpoint: string, method: string, responseTime: number, statusCode: number) {
      this.trackEvent('api_call', {
        endpoint,
        method,
        responseTime,
        statusCode,
        success: statusCode >= 200 && statusCode < 300,
        timestamp: new Date().toISOString(),
      });
    }
  
    // ==========================
    // ERRORS & ISSUES
    // ==========================
  
    trackError(errorName: string, errorMessage: string, stackTrace?: string, context?: any) {
      this.trackEvent('error_occurred', { 
        errorName, 
        errorMessage, 
        stackTrace,
        context,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackAPIError(endpoint: string, statusCode: number, errorMessage: string) {
      this.trackEvent('api_error', {
        endpoint,
        statusCode,
        errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  
    trackValidationError(fieldName: string, errorType: string, screenName: string) {
      this.trackEvent('validation_error', {
        fieldName,
        errorType,
        screenName,
        timestamp: new Date().toISOString(),
      });
    }
  
    // ==========================
    // USER PROPERTIES
    // ==========================
  
    setUserProperties(userId: number, properties: Record<string, any>) {
      if (!this.enabled) return;
      
      console.log(`[Analytics] User Properties Set:`, properties);
      
      // Set user properties in your analytics service
      // Example for Firebase:
      // analytics().setUserProperties(properties);
      
      // Example for Mixpanel:
      // mixpanel.people.set(properties);
    }
  
    identifyUser(userId: number, email?: string, name?: string) {
      if (!this.enabled) return;
      
      console.log(`[Analytics] User Identified: ${userId}`);
      
      this.setUserProperties(userId, {
        userId,
        email,
        name,
        identifiedAt: new Date().toISOString(),
      });
    }
  
    // ==========================
    // SESSION TRACKING
    // ==========================
  
    trackSessionStart() {
      this.trackEvent('session_start', {
        timestamp: new Date().toISOString(),
      });
    }
  
    trackSessionEnd(duration: number) {
      this.trackEvent('session_end', {
        duration,
        timestamp: new Date().toISOString(),
      });
    }
  
    // ==========================
    // ADMIN EVENTS
    // ==========================
  
    trackAdminAction(action: string, resourceType: string, resourceId?: number) {
      this.trackEvent('admin_action', {
        action, // 'create', 'update', 'delete', 'publish', etc.
        resourceType, // 'module', 'lesson', 'quiz', etc.
        resourceId,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  export default new AnalyticsService();