/**
 * Submit Button Component
 * Handles form submission with loading states
 */

import { SubmitButtonProps } from './LoginFormTypes';

export function SubmitButton({ isSignUp, isLoading }: SubmitButtonProps) {
  return (
    <div>
      <button
        type="submit"
        disabled={isLoading}
        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {isSignUp ? 'Creating account...' : 'Signing in...'}
          </div>
        ) : (
          isSignUp ? 'Create account' : 'Sign in'
        )}
      </button>
    </div>
  );
}