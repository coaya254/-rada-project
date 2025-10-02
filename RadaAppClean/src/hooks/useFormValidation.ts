import { useState, useEffect, useCallback } from 'react';
import {
  ValidationResult,
  ValidationRule,
  validateForm,
  politicianValidationRules,
  timelineEventValidationRules,
  commitmentValidationRules,
  votingRecordValidationRules,
  documentValidationRules
} from '../utils/validation';

export type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit';

export interface UseFormValidationOptions<T> {
  rules: ValidationRule<T>[];
  mode?: ValidationMode;
  validateOnMount?: boolean;
}

export interface FormValidationReturn<T> {
  errors: Record<keyof T, string>;
  warnings: Record<keyof T, string>;
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  validate: (data: T) => ValidationResult;
  validateField: (field: keyof T, value: any, data: T) => string | null;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  options: UseFormValidationOptions<T>
): FormValidationReturn<T> {
  const { rules, mode = 'onSubmit', validateOnMount = false } = options;

  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [warnings, setWarnings] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validate = useCallback((data: T): ValidationResult => {
    const result = validateForm(data, rules);

    // Convert validation results to field-specific objects
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
    const newWarnings: Record<keyof T, string> = {} as Record<keyof T, string>;

    // Map errors to fields
    result.errors.forEach(error => {
      const fieldName = extractFieldNameFromError(error);
      if (fieldName && fieldName in data) {
        newErrors[fieldName as keyof T] = error;
      }
    });

    // Map warnings to fields
    result.warnings.forEach(warning => {
      const fieldName = extractFieldNameFromError(warning);
      if (fieldName && fieldName in data) {
        newWarnings[fieldName as keyof T] = warning;
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);

    return result;
  }, [rules]);

  const validateField = useCallback((field: keyof T, value: any, data: T): string | null => {
    const fieldRule = rules.find(rule => rule.field === field);
    if (!fieldRule) return null;

    const tempData = { ...data, [field]: value };
    const result = validateForm(tempData, [fieldRule]);

    return result.errors.length > 0 ? result.errors[0] : null;
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>);
    setWarnings({} as Record<keyof T, string>);
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[field];
      return newWarnings;
    });
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Initial validation
  useEffect(() => {
    if (validateOnMount) {
      validate(initialData);
    }
  }, [validateOnMount, validate, initialData]);

  const hasErrors = Object.keys(errors).length > 0;
  const hasWarnings = Object.keys(warnings).length > 0;
  const isValid = !hasErrors;

  return {
    errors,
    warnings,
    isValid,
    hasErrors,
    hasWarnings,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError
  };
}

// Helper function to extract field name from error message
function extractFieldNameFromError(error: string): string | null {
  const matches = error.match(/^(\w+)/);
  return matches ? matches[1] : null;
}

// Predefined validation hooks for common forms
export function usePoliticianValidation(initialData: any) {
  return useFormValidation(initialData, {
    rules: politicianValidationRules,
    mode: 'onChange',
    validateOnMount: false
  });
}

export function useTimelineEventValidation(initialData: any) {
  return useFormValidation(initialData, {
    rules: timelineEventValidationRules,
    mode: 'onChange',
    validateOnMount: false
  });
}

export function useCommitmentValidation(initialData: any) {
  return useFormValidation(initialData, {
    rules: commitmentValidationRules,
    mode: 'onChange',
    validateOnMount: false
  });
}

export function useVotingRecordValidation(initialData: any) {
  return useFormValidation(initialData, {
    rules: votingRecordValidationRules,
    mode: 'onChange',
    validateOnMount: false
  });
}

export function useDocumentValidation(initialData: any) {
  return useFormValidation(initialData, {
    rules: documentValidationRules,
    mode: 'onChange',
    validateOnMount: false
  });
}

// Advanced validation hooks with custom rules
export function useAdvancedValidation<T extends Record<string, any>>(
  initialData: T,
  customRules: ValidationRule<T>[],
  options?: Partial<UseFormValidationOptions<T>>
) {
  return useFormValidation(initialData, {
    rules: customRules,
    mode: 'onChange',
    validateOnMount: false,
    ...options
  });
}

// Real-time field validation hook
export function useFieldValidation<T extends Record<string, any>>(
  field: keyof T,
  value: any,
  data: T,
  rules: ValidationRule<T>[]
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setIsValidating(true);

    const timer = setTimeout(() => {
      const fieldRule = rules.find(rule => rule.field === field);
      if (fieldRule) {
        const tempData = { ...data, [field]: value };
        const result = validateForm(tempData, [fieldRule]);
        setError(result.errors.length > 0 ? result.errors[0] : null);
      }
      setIsValidating(false);
    }, 300); // Debounce validation

    return () => clearTimeout(timer);
  }, [field, value, data, rules]);

  return { error, isValidating };
}

// Bulk validation hook for multiple items
export function useBulkValidation<T extends Record<string, any>>(
  items: T[],
  rules: ValidationRule<T>[]
) {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateAll = useCallback(async () => {
    setIsValidating(true);

    const validationResults = items.map(item => validateForm(item, rules));
    setResults(validationResults);

    setIsValidating(false);
    return validationResults;
  }, [items, rules]);

  useEffect(() => {
    validateAll();
  }, [validateAll]);

  const hasErrors = results.some(result => !result.isValid);
  const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);
  const totalWarnings = results.reduce((sum, result) => sum + result.warnings.length, 0);

  return {
    results,
    hasErrors,
    totalErrors,
    totalWarnings,
    isValidating,
    validateAll
  };
}