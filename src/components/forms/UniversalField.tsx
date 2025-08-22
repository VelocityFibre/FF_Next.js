import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Calendar, MapPin, DollarSign, User, AlertCircle } from 'lucide-react';

export type FieldMode = 'create' | 'edit' | 'view';
export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'email' | 'tel' | 'currency';

interface UniversalFieldProps {
  name: string;
  label: string;
  value?: any;
  mode?: FieldMode;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  register?: UseFormRegister<any>;
  errors?: FieldErrors;
  icon?: React.ReactNode;
  hint?: string;
  rows?: number; // for textarea
  readOnly?: boolean;
  className?: string;
}

/**
 * Universal field component that maintains consistency across Create, Edit, and View modes
 * This is the SINGLE SOURCE for all field rendering in the application
 */
export function UniversalField({
  name,
  label,
  value,
  mode = 'create',
  type = 'text',
  required = false,
  placeholder,
  options,
  register,
  errors,
  icon,
  hint,
  rows = 3,
  readOnly = false,
  className = ''
}: UniversalFieldProps) {
  // View mode - read-only display
  if (mode === 'view') {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-600">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          <div className="text-gray-900 font-medium">
            {formatDisplayValue(value, type, options)}
          </div>
        </div>
      </div>
    );
  }

  // Get error for this field
  const fieldError = getNestedError(errors, name);

  // Create/Edit mode - editable fields
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            {...(register ? register(name, { required: required ? `${label} is required` : false }) : {})}
            defaultValue={mode === 'edit' ? value : undefined}
            rows={rows}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
              ${icon ? 'pl-10' : ''}
              ${fieldError ? 'border-red-300' : 'border-gray-300'}
              ${readOnly ? 'bg-gray-50' : 'bg-white'}
            `}
          />
        ) : type === 'select' ? (
          <select
            {...(register ? register(name, { required: required ? `${label} is required` : false }) : {})}
            defaultValue={mode === 'edit' ? value : ''}
            disabled={readOnly}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
              ${icon ? 'pl-10' : ''}
              ${fieldError ? 'border-red-300' : 'border-gray-300'}
              ${readOnly ? 'bg-gray-50' : 'bg-white'}
            `}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...(register ? register(name, { 
              required: required ? `${label} is required` : false,
              valueAsNumber: type === 'number' || type === 'currency'
            }) : {})}
            type={mapInputType(type)}
            defaultValue={mode === 'edit' ? value : undefined}
            placeholder={placeholder}
            readOnly={readOnly}
            step={type === 'currency' ? '0.01' : type === 'number' ? 'any' : undefined}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
              ${icon ? 'pl-10' : ''}
              ${fieldError ? 'border-red-300' : 'border-gray-300'}
              ${readOnly ? 'bg-gray-50' : 'bg-white'}
            `}
          />
        )}
      </div>
      
      {hint && !fieldError && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      
      {fieldError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {fieldError.message}
        </p>
      )}
    </div>
  );
}

// Helper function to format display values
function formatDisplayValue(value: any, type: FieldType, options?: Array<{ value: string; label: string }>) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">Not set</span>;
  }

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
      }).format(value);
    
    case 'date':
      return new Date(value).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    
    case 'select':
      const option = options?.find(opt => opt.value === value);
      return option?.label || value;
    
    default:
      return value;
  }
}

// Helper function to map field types to HTML input types
function mapInputType(type: FieldType): string {
  switch (type) {
    case 'currency':
    case 'number':
      return 'number';
    case 'email':
      return 'email';
    case 'tel':
      return 'tel';
    case 'date':
      return 'date';
    default:
      return 'text';
  }
}

// Helper function to get nested errors (for location.city, etc.)
function getNestedError(errors: any, name: string): any {
  if (!errors) return null;
  
  const keys = name.split('.');
  let current = errors;
  
  for (const key of keys) {
    if (current[key] === undefined) return null;
    current = current[key];
  }
  
  return current;
}

// Export commonly used icons for consistency
export const FieldIcons = {
  Calendar,
  MapPin,
  DollarSign,
  User,
  AlertCircle
};