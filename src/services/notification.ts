import { api } from '@/services/api'
import type {
  Notification,
  NotificationListResponse,
  NotificationSettings,
  UpdateNotificationSettingsInput,
} from '@/types/notification'

interface ListNotificationsParams {
  isRead?: boolean
  limit?: number
  offset?: number
}

export const NotificationService = {
  list: async (params?: ListNotificationsParams) => {
    const searchParams = new URLSearchParams()
    if (params?.isRead !== undefined) {
      searchParams.set('isRead', String(params.isRead))
    }
    if (params?.limit !== undefined) {
      searchParams.set('limit', String(params.limit))
    }
    if (params?.offset !== undefined) {
      searchParams.set('offset', String(params.offset))
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    const response = await api.get<NotificationListResponse>(`/notifications${query}`)
    return response.data
  },

  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>('/notifications/unread-count')
    return response.data
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<Notification>(`/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all')
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete<Notification>(`/notifications/${id}`)
    return response.data
  },

  getSettings: async () => {
    const response = await api.get<NotificationSettings>('/notifications/settings')
    return response.data
  },

  updateSettings: async (data: UpdateNotificationSettingsInput) => {
    const response = await api.put<NotificationSettings>('/notifications/settings', data)
    return response.data
  },
}
