import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, CreateUserData, UpdateUserData, UserListParams } from '@/services/userService'
import { User } from '@/types'
import { QUERY_KEYS } from '@/utils/constants'

/**
 * Hook for fetching paginated users list
 */
export function useUsers(params: UserListParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, params],
    queryFn: () => userService.getUsers(params),
    keepPreviousData: true,
  })
}

/**
 * Hook for fetching a single user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  })
}

/**
 * Hook for fetching current user profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => userService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for creating a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserData) => userService.createUser(userData),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
    },
  })
}

/**
 * Hook for updating a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserData }) =>
      userService.updateUser(id, userData),
    onSuccess: (updatedUser: User) => {
      // Update user in cache
      queryClient.setQueryData(QUERY_KEYS.user(updatedUser.id), updatedUser)
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
    },
  })
}

/**
 * Hook for updating current user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: UpdateUserData) => userService.updateProfile(userData),
    onSuccess: (updatedUser: User) => {
      // Update profile in cache
      queryClient.setQueryData(QUERY_KEYS.profile, updatedUser)
    },
  })
}

/**
 * Hook for deleting a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users })
    },
  })
}