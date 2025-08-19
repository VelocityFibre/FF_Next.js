// Application constants

export const APP_CONFIG = {
  name: 'FibreFlow React',
  version: '1.0.0',
  description: 'FibreFlow application migrated to React',
} as const

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  users: {
    list: '/users',
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    profile: '/users/profile',
  },
  // Migration TODO: Add endpoints from Angular version
} as const

export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  user: 'user_data',
  preferences: 'user_preferences',
} as const

export const QUERY_KEYS = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  profile: ['profile'] as const,
  // Migration TODO: Add query keys for migrated features
} as const

export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  settings: '/settings',
  // Migration TODO: Add routes from Angular version
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const

export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    minLength: 8,
    message: 'Password must be at least 8 characters long',
  },
} as const