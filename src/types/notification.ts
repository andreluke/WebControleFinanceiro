export type NotificationType = 'budget_warning' | 'budget_exceeded' | 'goal_milestone'
export type NotificationEntityType = 'budget' | 'goal'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string | null
  entityType: NotificationEntityType | null
  entityId: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationSettings {
  id: string
  budgetWarningPct: number
  budgetExceeded: boolean
  goalMilestones: boolean
  emailEnabled: boolean
  emailAddress: string | null
}

export interface NotificationListResponse {
  data: Notification[]
  total: number
  limit: number
  offset: number
}

export interface ListNotificationsParams {
  isRead?: boolean
  limit?: number
  offset?: number
}

export interface UpdateNotificationSettingsInput {
  budgetWarningPct?: number
  budgetExceeded?: boolean
  goalMilestones?: boolean
  emailEnabled?: boolean
  emailAddress?: string | null
}
