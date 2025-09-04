// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Username validation
export const validateUsername = (username) => {
  const errors = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  if (/^[_-]/.test(username) || /[_-]$/.test(username)) {
    errors.push('Username cannot start or end with underscore or hyphen');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic form validation
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    // Required field validation
    if (fieldRules.required && (!value || value.trim() === '')) {
      errors[field] = `${fieldRules.label || field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value) return;
    
    // Email validation
    if (fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
    }
    
    // Password validation
    if (fieldRules.password) {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid) {
        errors[field] = passwordValidation.errors[0]; // Show first error
      }
    }
    
    // Username validation
    if (fieldRules.username) {
      const usernameValidation = validateUsername(value);
      if (!usernameValidation.isValid) {
        errors[field] = usernameValidation.errors[0]; // Show first error
      }
    }
    
    // Min length validation
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
    }
    
    // Max length validation
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `${fieldRules.label || field} must be no more than ${fieldRules.maxLength} characters`;
    }
    
    // Custom validation function
    if (fieldRules.validate) {
      const customError = fieldRules.validate(value, formData);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

// Real-time validation helper
export const createFieldValidator = (rules) => {
  return (fieldName, value, formData = {}) => {
    const fieldRule = rules[fieldName];
    if (!fieldRule) return null;
    
    const tempFormData = { ...formData, [fieldName]: value };
    const validation = validateForm(tempFormData, { [fieldName]: fieldRule });
    
    return validation.errors[fieldName] || null;
  };
};
