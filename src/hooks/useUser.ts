import { useMutation } from '@tanstack/react-query'
import { AuthService, type ChangePasswordInput, type UpdateNameInput } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

export function useUpdateName() {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (data: UpdateNameInput) => AuthService.updateName(data),
    onSuccess: (response) => {
      setUser(response.user)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => AuthService.changePassword(data),
  })
}