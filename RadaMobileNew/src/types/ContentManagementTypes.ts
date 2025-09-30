export interface ContentModule {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
  coverImage?: string;
  tags: string[];
  prerequisites: number[]; // module IDs
  learningObjectives: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  stats: {
    totalLessons: number;
    totalQuizzes: number;
    totalXP: number;
    completionRate: number;
    averageRating: number;
    totalEnrollments: number;
  };
}

export interface ContentLesson {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'quiz' | 'assignment';
  duration: number; // in minutes
  order: number;
  isPublished: boolean;
  isRequired: boolean;
  xp: number;
  videoUrl?: string;
  resources: ContentResource[];
  keyPoints: string[];
  prerequisites: number[]; // lesson IDs
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  stats: {
    completionRate: number;
    averageTimeSpent: number;
    totalViews: number;
    rating: number;
  };
}

export interface ContentResource {
  id: string;
  title: string;
  type: 'document' | 'link' | 'video' | 'image' | 'audio';
  url: string;
  description?: string;
  size?: number;
  thumbnail?: string;
  isRequired: boolean;
  order: number;
}

export interface ContentQuiz {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  maxAttempts: number;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  stats: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  options?: string[];
  correctAnswer: number | string | boolean;
  explanation: string;
  points: number;
  order: number;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ContentCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTag {
  id: number;
  name: string;
  description: string;
  color: string;
  category: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTemplate {
  id: number;
  name: string;
  description: string;
  type: 'module' | 'lesson' | 'quiz';
  template: any; // JSON structure
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ContentVersion {
  id: number;
  contentId: number;
  contentType: 'module' | 'lesson' | 'quiz';
  version: string;
  changes: string;
  content: any;
  isPublished: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ContentReview {
  id: number;
  contentId: number;
  contentType: 'module' | 'lesson' | 'quiz';
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  rating: number;
  comments: string;
  suggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentAnalytics {
  contentId: number;
  contentType: 'module' | 'lesson' | 'quiz';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    views: number;
    completions: number;
    averageTimeSpent: number;
    completionRate: number;
    rating: number;
    engagement: number;
    dropOffPoints: { [key: string]: number };
    popularSections: { [key: string]: number };
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ContentBulkAction {
  id: string;
  type: 'publish' | 'unpublish' | 'delete' | 'duplicate' | 'move' | 'tag' | 'categorize';
  targetIds: number[];
  parameters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: {
    successful: number;
    failed: number;
    errors: string[];
  };
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface ContentWorkflow {
  id: number;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'notification' | 'automation';
  assignee?: string;
  conditions?: any;
  actions?: any;
  order: number;
  isRequired: boolean;
}

export interface ContentImport {
  id: string;
  fileName: string;
  fileType: 'csv' | 'json' | 'xlsx' | 'zip';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: {
    totalRows: number;
    processedRows: number;
    successfulRows: number;
    failedRows: number;
    errors: ImportError[];
  };
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ContentExport {
  id: string;
  type: 'modules' | 'lessons' | 'quizzes' | 'all';
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  filters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface ContentSearch {
  query: string;
  filters: {
    contentType?: string[];
    category?: string[];
    tags?: string[];
    difficulty?: string[];
    status?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    author?: string[];
  };
  sortBy: 'relevance' | 'date' | 'title' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface ContentSearchResult {
  items: any[];
  total: number;
  page: number;
  limit: number;
  facets: {
    [key: string]: { [value: string]: number };
  };
}

  id: number;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in minutes
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
  coverImage?: string;
  tags: string[];
  prerequisites: number[]; // module IDs
  learningObjectives: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  stats: {
    totalLessons: number;
    totalQuizzes: number;
    totalXP: number;
    completionRate: number;
    averageRating: number;
    totalEnrollments: number;
  };
}

export interface ContentLesson {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'quiz' | 'assignment';
  duration: number; // in minutes
  order: number;
  isPublished: boolean;
  isRequired: boolean;
  xp: number;
  videoUrl?: string;
  resources: ContentResource[];
  keyPoints: string[];
  prerequisites: number[]; // lesson IDs
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  stats: {
    completionRate: number;
    averageTimeSpent: number;
    totalViews: number;
    rating: number;
  };
}

export interface ContentResource {
  id: string;
  title: string;
  type: 'document' | 'link' | 'video' | 'image' | 'audio';
  url: string;
  description?: string;
  size?: number;
  thumbnail?: string;
  isRequired: boolean;
  order: number;
}

export interface ContentQuiz {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  maxAttempts: number;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  stats: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  options?: string[];
  correctAnswer: number | string | boolean;
  explanation: string;
  points: number;
  order: number;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ContentCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTag {
  id: number;
  name: string;
  description: string;
  color: string;
  category: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentTemplate {
  id: number;
  name: string;
  description: string;
  type: 'module' | 'lesson' | 'quiz';
  template: any; // JSON structure
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ContentVersion {
  id: number;
  contentId: number;
  contentType: 'module' | 'lesson' | 'quiz';
  version: string;
  changes: string;
  content: any;
  isPublished: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ContentReview {
  id: number;
  contentId: number;
  contentType: 'module' | 'lesson' | 'quiz';
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  rating: number;
  comments: string;
  suggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentAnalytics {
  contentId: number;
  contentType: 'module' | 'lesson' | 'quiz';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    views: number;
    completions: number;
    averageTimeSpent: number;
    completionRate: number;
    rating: number;
    engagement: number;
    dropOffPoints: { [key: string]: number };
    popularSections: { [key: string]: number };
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ContentBulkAction {
  id: string;
  type: 'publish' | 'unpublish' | 'delete' | 'duplicate' | 'move' | 'tag' | 'categorize';
  targetIds: number[];
  parameters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: {
    successful: number;
    failed: number;
    errors: string[];
  };
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface ContentWorkflow {
  id: number;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'notification' | 'automation';
  assignee?: string;
  conditions?: any;
  actions?: any;
  order: number;
  isRequired: boolean;
}

export interface ContentImport {
  id: string;
  fileName: string;
  fileType: 'csv' | 'json' | 'xlsx' | 'zip';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: {
    totalRows: number;
    processedRows: number;
    successfulRows: number;
    failedRows: number;
    errors: ImportError[];
  };
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ContentExport {
  id: string;
  type: 'modules' | 'lessons' | 'quizzes' | 'all';
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  filters: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface ContentSearch {
  query: string;
  filters: {
    contentType?: string[];
    category?: string[];
    tags?: string[];
    difficulty?: string[];
    status?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    author?: string[];
  };
  sortBy: 'relevance' | 'date' | 'title' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface ContentSearchResult {
  items: any[];
  total: number;
  page: number;
  limit: number;
  facets: {
    [key: string]: { [value: string]: number };
  };
}
