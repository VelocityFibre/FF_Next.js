/**
 * Google Sign-In Section Component
 * Google authentication with divider
 */

import { GoogleSignInButton } from '../GoogleSignInButton';
import { GoogleSignInSectionProps } from './LoginFormTypes';

export function GoogleSignInSection({ onClick, loading, rememberMe }: GoogleSignInSectionProps) {
  return (
    <>
      <GoogleSignInButton
        onClick={onClick}
        loading={loading}
        rememberMe={rememberMe}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
        </div>
      </div>
    </>
  );
}