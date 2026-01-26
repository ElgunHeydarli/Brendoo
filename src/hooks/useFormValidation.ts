import { useState, useCallback } from 'react';
import {
  sanitizeText,
  sanitizeSearchQuery,
  sanitizeNumber,
  isValidEmail,
  isValidPhone,
  sanitizeUrl,
} from '../utils/sanitize';

export type ValidationRule =
  | 'required'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'text'
  | 'search';

export interface FieldValidation {
  rules: ValidationRule[];
  customValidator?: (value: any) => string | null;
  min?: number;
  max?: number;
}

export interface FormValidationConfig {
  [key: string]: FieldValidation;
}

export interface ValidationErrors {
  [key: string]: string | null;
}

/**
 * Form validasiya və təmizləmə hook-u
 */
export const useFormValidation = (config: FormValidationConfig) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  /**
   * Müəyyən field-i validate edir
   */
  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      const fieldConfig = config[fieldName];
      if (!fieldConfig) return null;

      const { rules, customValidator, min, max } = fieldConfig;

      // Required yoxlaması
      if (rules.includes('required')) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return 'Bu sahə tələb olunur';
        }
      }

      // Əgər value boşdursa və required deyilsə, validasiya keç
      if (!value) return null;

      // Email validasiyası
      if (rules.includes('email')) {
        if (!isValidEmail(value)) {
          return 'Düzgün email ünvanı daxil edin';
        }
      }

      // Phone validasiyası
      if (rules.includes('phone')) {
        if (!isValidPhone(value)) {
          return 'Düzgün telefon nömrəsi daxil edin (+994XXXXXXXXX)';
        }
      }

      // URL validasiyası
      if (rules.includes('url')) {
        const sanitized = sanitizeUrl(value);
        if (!sanitized) {
          return 'Düzgün URL daxil edin';
        }
      }

      // Number validasiyası
      if (rules.includes('number')) {
        const num = sanitizeNumber(value, min, max);
        if (num === null) {
          if (min !== undefined && max !== undefined) {
            return `${min} ilə ${max} arasında rəqəm daxil edin`;
          } else if (min !== undefined) {
            return `Minimum ${min} olmalıdır`;
          } else if (max !== undefined) {
            return `Maksimum ${max} olmalıdır`;
          }
          return 'Düzgün rəqəm daxil edin';
        }
      }

      // Custom validator
      if (customValidator) {
        const customError = customValidator(value);
        if (customError) return customError;
      }

      return null;
    },
    [config]
  );

  /**
   * Bütün formu validate edir
   */
  const validateForm = useCallback(
    (formData: Record<string, any>): boolean => {
      const newErrors: ValidationErrors = {};
      let isValid = true;

      Object.keys(config).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [config, validateField]
  );

  /**
   * Field dəyərini təmizləyir və sanitize edir
   */
  const sanitizeField = useCallback(
    (fieldName: string, value: any): any => {
      const fieldConfig = config[fieldName];
      if (!fieldConfig) return value;

      const { rules } = fieldConfig;

      // Text sanitization
      if (rules.includes('text') && typeof value === 'string') {
        return sanitizeText(value);
      }

      // Search sanitization
      if (rules.includes('search') && typeof value === 'string') {
        return sanitizeSearchQuery(value);
      }

      // URL sanitization
      if (rules.includes('url') && typeof value === 'string') {
        return sanitizeUrl(value);
      }

      // Number sanitization
      if (rules.includes('number')) {
        return sanitizeNumber(value, fieldConfig.min, fieldConfig.max);
      }

      return value;
    },
    [config]
  );

  /**
   * Bütün form məlumatlarını təmizləyir
   */
  const sanitizeFormData = useCallback(
    (formData: Record<string, any>): Record<string, any> => {
      const sanitized: Record<string, any> = {};

      Object.keys(formData).forEach((fieldName) => {
        sanitized[fieldName] = sanitizeField(fieldName, formData[fieldName]);
      });

      return sanitized;
    },
    [sanitizeField]
  );

  /**
   * Müəyyən field-in error-unu təmizləyir
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: null }));
  }, []);

  /**
   * Bütün error-ları təmizləyir
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    sanitizeField,
    sanitizeFormData,
    clearFieldError,
    clearErrors,
  };
};
