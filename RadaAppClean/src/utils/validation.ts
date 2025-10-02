// Comprehensive validation utilities for admin data integrity

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any, data: T) => string | null;
  dependencies?: (keyof T)[];
}

// Generic form validator
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: ValidationRule<T>[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];
    const fieldName = String(rule.field);

    // Required field validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`);
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) continue;

    // String length validation
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${fieldName} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${fieldName} must not exceed ${rule.maxLength} characters`);
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(`${fieldName} format is invalid`);
    }

    // Custom validation
    if (rule.customValidator) {
      const customError = rule.customValidator(value, data);
      if (customError) {
        errors.push(customError);
      }
    }

    // Dependency validation
    if (rule.dependencies) {
      for (const dep of rule.dependencies) {
        if (!data[dep]) {
          warnings.push(`${fieldName} may require ${String(dep)} to be set`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Politician validation rules
export const politicianValidationRules: ValidationRule<any>[] = [
  {
    field: 'name',
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-\.\']+$/,
    customValidator: (value) => {
      if (value && value.split(' ').length < 2) {
        return 'Full name should include first and last name';
      }
      return null;
    }
  },
  {
    field: 'title',
    required: true,
    minLength: 5,
    maxLength: 200
  },
  {
    field: 'party',
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-&]+$/
  },
  {
    field: 'constituency',
    required: true,
    minLength: 3,
    maxLength: 100
  },
  {
    field: 'education',
    maxLength: 500,
    dependencies: ['key_achievements']
  },
  {
    field: 'slug',
    required: true,
    pattern: /^[a-z0-9\-]+$/,
    customValidator: (value) => {
      if (value && (value.startsWith('-') || value.endsWith('-'))) {
        return 'Slug cannot start or end with a hyphen';
      }
      return null;
    }
  }
];

// Timeline event validation rules
export const timelineEventValidationRules: ValidationRule<any>[] = [
  {
    field: 'title',
    required: true,
    minLength: 5,
    maxLength: 200
  },
  {
    field: 'description',
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  {
    field: 'date',
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    customValidator: (value) => {
      if (value) {
        const date = new Date(value);
        const now = new Date();
        if (date > now) {
          return 'Timeline event date cannot be in the future';
        }
        if (date < new Date('1960-01-01')) {
          return 'Timeline event date seems too old, please verify';
        }
      }
      return null;
    }
  },
  {
    field: 'type',
    required: true,
    customValidator: (value) => {
      const validTypes = ['position', 'achievement', 'controversy', 'legislation', 'event'];
      if (value && !validTypes.includes(value)) {
        return `Type must be one of: ${validTypes.join(', ')}`;
      }
      return null;
    }
  },
  {
    field: 'source_links',
    customValidator: (value) => {
      if (value && Array.isArray(value)) {
        for (const link of value) {
          if (link && !isValidUrl(link)) {
            return 'All source links must be valid URLs';
          }
        }
      }
      return null;
    }
  }
];

// Commitment validation rules
export const commitmentValidationRules: ValidationRule<any>[] = [
  {
    field: 'title',
    required: true,
    minLength: 10,
    maxLength: 200
  },
  {
    field: 'description',
    required: true,
    minLength: 20,
    maxLength: 1000
  },
  {
    field: 'date_made',
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/
  },
  {
    field: 'deadline',
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    customValidator: (value, data) => {
      if (value && data.date_made) {
        const deadline = new Date(value);
        const dateMade = new Date(data.date_made);
        if (deadline <= dateMade) {
          return 'Deadline must be after the date the commitment was made';
        }
      }
      return null;
    }
  },
  {
    field: 'status',
    required: true,
    customValidator: (value) => {
      const validStatuses = ['no_evidence', 'early_progress', 'significant_progress', 'completed', 'stalled'];
      if (value && !validStatuses.includes(value)) {
        return `Status must be one of: ${validStatuses.join(', ')}`;
      }
      return null;
    }
  },
  {
    field: 'progress_percentage',
    customValidator: (value) => {
      if (value !== undefined && (value < 0 || value > 100)) {
        return 'Progress percentage must be between 0 and 100';
      }
      return null;
    }
  }
];

// Voting record validation rules
export const votingRecordValidationRules: ValidationRule<any>[] = [
  {
    field: 'bill_title',
    required: true,
    minLength: 10,
    maxLength: 300
  },
  {
    field: 'bill_number',
    required: true,
    pattern: /^[A-Z\.]+\s+\d{4}-\d+$/,
    customValidator: (value) => {
      if (value && !value.match(/^(H\.R\.|S\.|B\.)\s+\d{4}-\d+$/)) {
        return 'Bill number format should be like "H.R. 2024-15" or "S. 2024-08"';
      }
      return null;
    }
  },
  {
    field: 'vote_date',
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/
  },
  {
    field: 'vote_value',
    required: true,
    customValidator: (value) => {
      const validVotes = ['for', 'against', 'abstain', 'absent'];
      if (value && !validVotes.includes(value)) {
        return `Vote value must be one of: ${validVotes.join(', ')}`;
      }
      return null;
    }
  },
  {
    field: 'vote_count_for',
    customValidator: (value, data) => {
      if (typeof value === 'number' && value < 0) {
        return 'Vote count cannot be negative';
      }
      if (data.total_votes && value > data.total_votes) {
        return 'Vote count for cannot exceed total votes';
      }
      return null;
    }
  }
];

// Document validation rules
export const documentValidationRules: ValidationRule<any>[] = [
  {
    field: 'title',
    required: true,
    minLength: 5,
    maxLength: 300
  },
  {
    field: 'type',
    required: true,
    customValidator: (value) => {
      const validTypes = ['speech', 'policy', 'bill', 'press_release', 'interview', 'manifesto', 'report', 'letter', 'other'];
      if (value && !validTypes.includes(value)) {
        return `Document type must be one of: ${validTypes.join(', ')}`;
      }
      return null;
    }
  },
  {
    field: 'date_published',
    required: true,
    pattern: /^\d{4}-\d{2}-\d{2}$/
  },
  {
    field: 'content',
    minLength: 50,
    maxLength: 50000,
    dependencies: ['summary']
  },
  {
    field: 'source_url',
    customValidator: (value) => {
      if (value && !isValidUrl(value)) {
        return 'Source URL must be a valid URL';
      }
      return null;
    }
  }
];

// Utility functions
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const pattern = /^(\+254|0)[17]\d{8}$/; // Kenyan phone number format
  return pattern.test(phone.replace(/\s/g, ''));
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .trim();
}

// Data integrity checks
export interface IntegrityCheck {
  name: string;
  description: string;
  check: (data: any[]) => IntegrityCheckResult;
}

export interface IntegrityCheckResult {
  passed: boolean;
  issues: string[];
  suggestions: string[];
}

export const dataIntegrityChecks: IntegrityCheck[] = [
  {
    name: 'Duplicate Politicians',
    description: 'Check for politicians with identical names or slugs',
    check: (politicians) => {
      const issues: string[] = [];
      const suggestions: string[] = [];
      const nameMap = new Map<string, number>();
      const slugMap = new Map<string, number>();

      politicians.forEach((politician, index) => {
        const name = politician.name?.toLowerCase();
        const slug = politician.slug?.toLowerCase();

        if (name) {
          if (nameMap.has(name)) {
            issues.push(`Duplicate politician name found: "${politician.name}" (index ${index})`);
          }
          nameMap.set(name, index);
        }

        if (slug) {
          if (slugMap.has(slug)) {
            issues.push(`Duplicate politician slug found: "${politician.slug}" (index ${index})`);
          }
          slugMap.set(slug, index);
        }
      });

      if (issues.length > 0) {
        suggestions.push('Review and merge duplicate entries or modify names/slugs to be unique');
      }

      return { passed: issues.length === 0, issues, suggestions };
    }
  },
  {
    name: 'Missing Critical Data',
    description: 'Check for politicians missing essential information',
    check: (politicians) => {
      const issues: string[] = [];
      const suggestions: string[] = [];

      politicians.forEach((politician, index) => {
        const missing: string[] = [];

        if (!politician.name) missing.push('name');
        if (!politician.title) missing.push('title');
        if (!politician.party) missing.push('party');
        if (!politician.constituency) missing.push('constituency');

        if (missing.length > 0) {
          issues.push(`Politician at index ${index} missing: ${missing.join(', ')}`);
        }

        if (!politician.image_url) {
          suggestions.push(`Consider adding profile image for "${politician.name}"`);
        }
      });

      return { passed: issues.length === 0, issues, suggestions };
    }
  },
  {
    name: 'Timeline Date Consistency',
    description: 'Check for timeline events with inconsistent dates',
    check: (timelineEvents) => {
      const issues: string[] = [];
      const suggestions: string[] = [];

      timelineEvents.forEach((event, index) => {
        if (event.date) {
          const eventDate = new Date(event.date);
          const now = new Date();

          if (eventDate > now) {
            issues.push(`Timeline event "${event.title}" has future date (index ${index})`);
          }

          if (eventDate < new Date('1960-01-01')) {
            suggestions.push(`Timeline event "${event.title}" has very old date, please verify (index ${index})`);
          }
        }
      });

      return { passed: issues.length === 0, issues, suggestions };
    }
  },
  {
    name: 'Source Links Validation',
    description: 'Check for broken or invalid source links',
    check: (items) => {
      const issues: string[] = [];
      const suggestions: string[] = [];

      items.forEach((item, index) => {
        if (item.source_links && Array.isArray(item.source_links)) {
          item.source_links.forEach((link: string, linkIndex: number) => {
            if (link && !isValidUrl(link)) {
              issues.push(`Invalid URL in ${item.title || `item ${index}`} at link ${linkIndex}: ${link}`);
            }
          });
        } else if (item.source_url && !isValidUrl(item.source_url)) {
          issues.push(`Invalid source URL in ${item.title || `item ${index}`}: ${item.source_url}`);
        }

        if (!item.source_links?.length && !item.source_url) {
          suggestions.push(`Consider adding source links for "${item.title || `item ${index}`}" to improve transparency`);
        }
      });

      return { passed: issues.length === 0, issues, suggestions };
    }
  }
];

// Run all integrity checks
export function runIntegrityChecks(data: {
  politicians: any[];
  timelineEvents: any[];
  commitments: any[];
  documents: any[];
  votingRecords: any[];
}): IntegrityCheckResult {
  const allIssues: string[] = [];
  const allSuggestions: string[] = [];

  // Check politicians
  const politicianResult = dataIntegrityChecks[0].check(data.politicians);
  allIssues.push(...politicianResult.issues);
  allSuggestions.push(...politicianResult.suggestions);

  const missingDataResult = dataIntegrityChecks[1].check(data.politicians);
  allIssues.push(...missingDataResult.issues);
  allSuggestions.push(...missingDataResult.suggestions);

  // Check timeline events
  const timelineResult = dataIntegrityChecks[2].check(data.timelineEvents);
  allIssues.push(...timelineResult.issues);
  allSuggestions.push(...timelineResult.suggestions);

  // Check source links across all items
  const allItems = [
    ...data.timelineEvents,
    ...data.commitments,
    ...data.documents,
    ...data.votingRecords
  ];
  const sourceLinksResult = dataIntegrityChecks[3].check(allItems);
  allIssues.push(...sourceLinksResult.issues);
  allSuggestions.push(...sourceLinksResult.suggestions);

  return {
    passed: allIssues.length === 0,
    issues: allIssues,
    suggestions: allSuggestions
  };
}