export interface Course {
  id: number;
  title: string;
  icon: string;
  lessons: number;
  color: string;
  category: string;
  xp: number;
  duration: string;
  difficulty: string;
  progress: number;
}

export interface Category {
  name: string;
  key: string;
  icon: string;
  color: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  current?: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: number;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number;
  xp: number;
}

export interface UserProgress {
  courseId: number;
  completedLessons: number[];
  currentLesson: number;
  progress: number;
}

export interface LearningScreenProps {
  navigation: any;
  route?: any;
}

export interface CourseDetailProps extends LearningScreenProps {
  route: {
    params: {
      courseId: number;
      title: string;
      description: string;
      lessons: number;
      duration: string;
      xp: number;
      progress: number;
    };
  };
}

export interface LessonProps extends LearningScreenProps {
  route: {
    params: {
      lessonId: number;
      lessonTitle: string;
      courseTitle: string;
    };
  };
}

export interface QuizProps extends LearningScreenProps {
  route: {
    params: {
      quizId: number;
      courseTitle: string;
      xp: number;
    };
  };
}

export interface CompletionProps extends LearningScreenProps {
  route: {
    params: {
      courseTitle: string;
      xpEarned: number;
      totalXP: number;
      lessonsCompleted: number;
    };
  };
}
