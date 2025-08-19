import { apiClient } from '@/utils/api'
import { User, ApiResponse, PaginatedResponse } from '@/types'
import { API_ENDPOINTS } from '@/utils/constants'

export interface CreateUserData {
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: 'admin' | 'user' | 'viewer'
}

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  role?: string
}

class UserService {
  async getUsers(params: UserListParams = {}): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.role) searchParams.append('role', params.role)

    const url = `${API_ENDPOINTS.users.list}?${searchParams.toString()}`
    const response = await apiClient.get<PaginatedResponse<User>>(url)
    return response.data
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`${API_ENDPOINTS.users.list}/${id}`)
    return response.data
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post<User>(API_ENDPOINTS.users.create, userData)
    return response.data
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put<User>(API_ENDPOINTS.users.update(id), userData)
    return response.data
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete<void>(API_ENDPOINTS.users.delete(id))
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.auth.me)
    return response.data
  }

  async updateProfile(userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put<User>(API_ENDPOINTS.users.profile, userData)
    return response.data
  }
}

export const userService = new UserService()