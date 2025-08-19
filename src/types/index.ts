// Base types for the FibreFlow application

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'user' | 'viewer'

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

// Migration TODO: Add specific types from Angular version
export interface MigrationStatus {
  component: string
  status: 'pending' | 'in-progress' | 'completed' | 'testing'
  priority: 'high' | 'medium' | 'low'
  estimatedHours: number
  completedHours?: number
  notes?: string
}