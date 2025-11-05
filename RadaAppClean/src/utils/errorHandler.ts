// utils/errorHandler.ts

import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public context?: any
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 400, true, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, true);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed') {
    super(message, 0, true);
    this.name = 'NetworkError';
  }
}

interface ErrorResponse {
  title: string;
  message: string;
  actions: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export const handleError = (error: any, navigation?: any): void => {
  console.error('[ErrorHandler] Error occurred:', error);
  
  const errorResponse = formatError(error, navigation);
  
  Alert.alert(
    errorResponse.title,
    errorResponse.message,
    errorResponse.actions
  );
};

const formatError = (error: any, navigation?: any): ErrorResponse => {
  // Network errors
  if (error.request && !error.response) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      actions: [
        { text: 'OK', style: 'cancel' },
        ...(navigation ? [{ text: 'Go Back', onPress: () => navigation.goBack() }] : []),
      ],
    };
  }

  // API errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return {
          title: 'Invalid Request',
          message: data?.message || 'The request was invalid. Please check your input and try again.',
          actions: [{ text: 'OK', style: 'cancel' }],
        };

      case 401:
        return {
          title: 'Authentication Required',
          message: 'Your session has expired. Please log in again.',
          actions: [
            { text: 'Cancel', style: 'cancel' },
            ...(navigation ? [{ 
              text: 'Log In', 
              onPress: () => navigation.navigate('Login') 
            }] : []),
          ],
        };

      case 403:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to perform this action.',
          actions: [
            { text: 'OK', style: 'cancel' },
            ...(navigation ? [{ text: 'Go Back',onPress: () => navigation.goBack() 
            }] : []),
          ],
        };

      case 404:
        return {
          title: 'Not Found',
          message: data?.message || 'The requested resource was not found.',
          actions: [
            { text: 'OK', style: 'cancel' },
            ...(navigation ? [{ text: 'Go Back', onPress: () => navigation.goBack() }] : []),
          ],
        };

      case 422:
        return {
          title: 'Validation Error',
          message: data?.message || 'Please check your input and try again.',
          actions: [{ text: 'OK', style: 'cancel' }],
        };

      case 429:
        return {
          title: 'Too Many Requests',
          message: 'You\'ve made too many requests. Please wait a moment and try again.',
          actions: [{ text: 'OK', style: 'cancel' }],
        };

      case 500:
      case 502:
      case 503:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          actions: [
            { text: 'OK', style: 'cancel' },
            { text: 'Retry', onPress: () => window.location.reload?.() },
          ],
        };

      default:
        return {
          title: 'Error',
          message: data?.message || 'An unexpected error occurred.',
          actions: [{ text: 'OK', style: 'cancel' }],
        };
    }
  }

  // Custom app errors
  if (error instanceof NotFoundError) {
    return {
      title: 'Not Found',
      message: error.message,
      actions: [
        { text: 'OK', style: 'cancel' },
        ...(navigation ? [{ text: 'Go Back', onPress: () => navigation.goBack() }] : []),
      ],
    };
  }

  if (error instanceof ValidationError) {
    return {
      title: 'Validation Error',
      message: error.message,
      actions: [{ text: 'OK', style: 'cancel' }],
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      title: 'Authentication Required',
      message: error.message,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        ...(navigation ? [{ 
          text: 'Log In', 
          onPress: () => navigation.navigate('Login') 
        }] : []),
      ],
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      title: 'Access Denied',
      message: error.message,
      actions: [
        { text: 'OK', style: 'cancel' },
        ...(navigation ? [{ text: 'Go Back', onPress: () => navigation.goBack() }] : []),
      ],
    };
  }

  if (error instanceof NetworkError) {
    return {
      title: 'Connection Error',
      message: error.message,
      actions: [
        { text: 'OK', style: 'cancel' },
        { text: 'Retry', onPress: () => window.location.reload?.() },
      ],
    };
  }

  if (error instanceof AppError) {
    return {
      title: 'Error',
      message: error.message,
      actions: [
        { text: 'OK', style: 'cancel' },
        ...(navigation ? [{ text: 'Go Back', onPress: () => navigation.goBack() }] : []),
      ],
    };
  }

  // Generic JavaScript errors
  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      actions: [
        { text: 'OK', style: 'cancel' },
        ...(navigation ? [{ text: 'Go Back', onPress: () => navigation.goBack() }] : []),
      ],
    };
  }

  // Unknown error type
  return {
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    actions: [
      { text: 'OK', style: 'cancel' },
      ...(navigation ? [{ text: 'Go Back', onPress: () => navigation.goBack() }] : []),
    ],
  };
};

// Silent error handler (logs but doesn't show alert)
export const handleErrorSilently = (error: any, context?: string): void => {
  console.error(`[ErrorHandler${context ? ` - ${context}` : ''}]:`, error);
  
  // You can send to error tracking service here
  // Example: Sentry.captureException(error);
};

// Async error wrapper
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  navigation?: any
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, navigation);
      throw error; // Re-throw to allow caller to handle if needed
    }
  }) as T;
};

// Form validation helper
export const validateField = (
  value: any,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
    message?: string;
  }
): { valid: boolean; error?: string } => {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return { valid: false, error: rules.message || 'This field is required' };
  }

  if (rules.minLength && value.length < rules.minLength) {
    return { 
      valid: false, 
      error: rules.message || `Minimum length is ${rules.minLength} characters` 
    };
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return { 
      valid: false, 
      error: rules.message || `Maximum length is ${rules.maxLength} characters` 
    };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return { 
      valid: false, 
      error: rules.message || 'Invalid format' 
    };
  }

  if (rules.custom && !rules.custom(value)) {
    return { 
      valid: false, 
      error: rules.message || 'Invalid value' 
    };
  }

  return { valid: true };
};

// Batch validation
export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, any>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let valid = true;

  Object.keys(rules).forEach(fieldName => {
    const result = validateField(values[fieldName], rules[fieldName]);
    if (!result.valid) {
      valid = false;
      errors[fieldName] = result.error || 'Invalid';
    }
  });

  return { valid, errors };
};

// Error logging utility
export const logError = (
  error: any,
  context: string,
  metadata?: Record<string, any>
): void => {
  const errorInfo = {
    message: error.message || 'Unknown error',
    stack: error.stack,
    name: error.name,
    context,
    metadata,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  console.error('[ErrorLog]:', errorInfo);

  // Send to error tracking service
  // Example: Sentry.captureException(error, { extra: errorInfo });
};

// Retry helper with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`[Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};