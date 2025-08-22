import type { User } from 'firebase/auth';

export const getUserInitials = (user: User | null): string => {
  if (user?.displayName) {
    return user.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (user?.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return 'U';
};

export const getUserName = (user: User | null): string => {
  return user?.displayName || user?.email || 'User';
};

export const getUserRole = (user: User | null): string => {
  const role = (user as any)?.role;
  return role?.replace('_', ' ').toUpperCase() || 'USER';
};