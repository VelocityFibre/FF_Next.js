import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, fullWidth = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'px-3 py-2 border rounded-lg text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';