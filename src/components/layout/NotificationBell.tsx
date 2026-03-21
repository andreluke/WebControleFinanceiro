import { Bell, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications'
import { formatRelativeTime } from '@/utils/date'
import { Skeleton } from '@/components/ui'

function getNotificationIcon(type: string) {
  switch (type) {
    case 'budget_warning':
      return '⚠️'
    case 'budget_exceeded':
      return '🚨'
    case 'goal_milestone':
      return '🎯'
    default:
      return '🔔'
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'budget_warning':
      return 'bg-warning/10 text-warning'
    case 'budget_exceeded':
      return 'bg-danger/10 text-danger'
    case 'goal_milestone':
      return 'bg-success/10 text-success'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: unreadData, isLoading: isLoadingUnread } = useUnreadCount()
  const { data: notifications, isLoading: isLoadingNotifications } = useNotifications({ limit: 10 })
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const unreadCount = unreadData?.count ?? 0

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await markAsRead.mutateAsync(id)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await deleteNotification.mutateAsync(id)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllAsRead.mutateAsync()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex justify-center items-center hover:bg-muted rounded-lg w-10 h-10 transition-colors"
      >
        <Bell className="w-5 h-5 text-secondary" />
        {unreadCount > 0 && (
          <span className="-top-1 -right-1 absolute flex justify-center items-center bg-danger rounded-full w-5 h-5 font-medium text-white text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="top-0 left-full z-50 absolute bg-card shadow-lg ml-2 border border-border rounded-lg w-80">
          <div className="flex justify-between items-center p-3 border-border border-b">
            <h3 className="font-semibold text-foreground">Notificacoes</h3>
            {notifications && notifications.total > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-primary-light text-xs hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoadingNotifications || isLoadingUnread ? (
              <div className="space-y-3 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="rounded-full w-10 h-10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-3/4 h-4" />
                      <Skeleton className="w-1/2 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications && notifications.data.length > 0 ? (
              notifications.data.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative border-b border-border/50 p-3 last:border-b-0 ${
                    !notification.isRead ? 'bg-muted/50' : ''
                  }`}
                >
                  <Link
                    to={notification.entityType === 'budget' ? '/budgets' : notification.entityType === 'goal' ? '/goals' : '/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getNotificationColor(notification.type)}`}>
                        <span className="text-base">{getNotificationIcon(notification.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? 'font-medium text-foreground' : 'text-secondary'}`}>
                          {notification.title}
                        </p>
                        {notification.body && (
                          <p className="mt-1 text-secondary text-xs">
                            {notification.body}
                          </p>
                        )}
                        <p className="mt-1 text-secondary text-xs">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="top-2 right-2 absolute flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        className="flex justify-center items-center bg-muted hover:bg-success/20 rounded-md w-6 h-6"
                        title="Marcar como lida"
                      >
                        <Check className="w-3 h-3 text-success" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="flex justify-center items-center bg-muted hover:bg-danger/20 rounded-md w-6 h-6"
                      title="Excluir"
                    >
                      <X className="w-3 h-3 text-danger" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-secondary text-sm text-center">
                Nenhuma notificacao
              </div>
            )}
          </div>

          {notifications && notifications.total > 0 && (
            <div className="p-2 border-border border-t">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="block hover:bg-muted px-3 py-2 rounded-md w-full text-primary-light text-sm text-center"
              >
                Ver todas as notificacoes
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
