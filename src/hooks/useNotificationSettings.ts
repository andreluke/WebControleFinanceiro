import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NotificationService } from '@/services/notification'
import type { UpdateNotificationSettingsInput } from '@/types/notification'

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => NotificationService.getSettings(),
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateNotificationSettingsInput) => NotificationService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
    },
  })
}