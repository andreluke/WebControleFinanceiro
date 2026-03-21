import { Bell, Check, Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, CardContent, Skeleton } from '@/components/ui'
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications'
import { formatRelativeTime, formatDate } from '@/utils/date'
import type { Notification } from '@/types/notification'

function getNotificationIcon(type: string) {
  switch (type) {
    case 'budget_warning':
      return <AlertTriangle className="h-5 w-5 text-warning" />
    case 'budget_exceeded':
      return <AlertCircle className="h-5 w-5 text-danger" />
    case 'goal_milestone':
      return <CheckCircle2 className="h-5 w-5 text-success" />
    default:
      return <Bell className="h-5 w-5 text-secondary" />
  }
}

function getNotificationBgColor(type: string) {
  switch (type) {
    case 'budget_warning':
      return 'bg-warning/10'
    case 'budget_exceeded':
      return 'bg-danger/10'
    case 'goal_milestone':
      return 'bg-success/10'
    default:
      return 'bg-muted'
  }
}

function getNotificationTypeLabel(type: string) {
  switch (type) {
    case 'budget_warning':
      return 'Alerta de orcamento'
    case 'budget_exceeded':
      return 'Orcamento excedido'
    case 'goal_milestone':
      return 'Marco de meta'
    default:
      return 'Notificacao'
  }
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  return (
    <div className={`group flex items-start gap-4 rounded-lg border p-4 transition-colors ${
      notification.isRead 
        ? 'border-border bg-card' 
        : 'border-primary/30 bg-primary/5'
    }`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getNotificationBgColor(notification.type)}`}>
        {getNotificationIcon(notification.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-sm ${!notification.isRead ? 'font-medium text-foreground' : 'text-secondary'}`}>
              {notification.title}
            </p>
            {notification.body && (
              <p className="mt-1 text-sm text-secondary">
                {notification.body}
              </p>
            )}
          </div>
          
          <div className="flex shrink-0 gap-1">
            {!notification.isRead && (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-secondary hover:bg-success/20 hover:text-success"
                title="Marcar como lida"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(notification.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-secondary hover:bg-danger/20 hover:text-danger"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-secondary">
          <span className="rounded bg-muted px-2 py-0.5">
            {getNotificationTypeLabel(notification.type)}
          </span>
          <span>{formatDate(notification.createdAt)}</span>
          <span>({formatRelativeTime(notification.createdAt)})</span>
        </div>

        {notification.entityType && (
          <Link
            to={notification.entityType === 'budget' ? '/budgets' : '/goals'}
            className="mt-2 inline-block text-xs text-primary-light hover:underline"
          >
            Ver {notification.entityType === 'budget' ? 'orcamento' : 'meta'}
          </Link>
        )}
      </div>
    </div>
  )
}

function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  
  const { data: notificationsData, isLoading, isError } = useNotifications({
    limit: 50,
    isRead: filter === 'unread' ? false : filter === 'read' ? true : undefined,
  })
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = notificationsData?.data ?? []
  const total = notificationsData?.total ?? 0
  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta notificacao?')) {
      return
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificacoes</h1>
          <p className="text-sm text-secondary">
            {total} notificacao{total !== 1 ? 'oes' : ''}, {unreadCount} nao lida{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAll}>
            <Check className="h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-muted text-secondary hover:bg-muted/80'
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === 'unread' 
              ? 'bg-primary text-white' 
              : 'bg-muted text-secondary hover:bg-muted/80'
          }`}
        >
          Nao lidas
        </button>
        <button
          type="button"
          onClick={() => setFilter('read')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === 'read' 
              ? 'bg-primary text-white' 
              : 'bg-muted text-secondary hover:bg-muted/80'
          }`}
        >
          Lidas
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <NotificationItemSkeleton />
            <NotificationItemSkeleton />
            <NotificationItemSkeleton />
          </>
        ) : isError ? (
          <Card className="border-danger/40 bg-danger/5">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <p className="text-sm text-foreground">Nao foi possivel carregar as notificacoes.</p>
            </CardContent>
          </Card>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
              <Bell className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-secondary">
                {filter === 'all' 
                  ? 'Nenhuma notificacao ate o momento.' 
                  : filter === 'unread'
                  ? 'Nenhuma notificacao nao lida.'
                  : 'Nenhuma notificacao lida.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
