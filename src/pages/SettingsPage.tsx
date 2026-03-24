import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings as SettingsIcon, User, Lock, Bell, Mail, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUpdateName, useChangePassword } from '@/hooks/useUser'
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useNotificationSettings'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Label } from '@/components/ui/Label'

const nameSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
})

type NameFormData = z.infer<typeof nameSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual e obrigatoria'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const updateName = useUpdateName()
  const changePassword = useChangePassword()
  const { data: notificationSettings, isLoading: isLoadingSettings } = useNotificationSettings()
  const updateNotificationSettings = useUpdateNotificationSettings()

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications'>('profile')

  const nameForm = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? '' },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  })

  const onNameSubmit = (data: NameFormData) => {
    updateName.mutate(data)
  }

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        passwordForm.reset()
      },
    })
  }

  const handleEmailToggle = (enabled: boolean) => {
    updateNotificationSettings.mutate({ emailEnabled: enabled })
  }

  const handleEmailAddressChange = (email: string) => {
    updateNotificationSettings.mutate({ emailAddress: email })
  }

  const handleBudgetWarningToggle = (enabled: boolean) => {
    updateNotificationSettings.mutate({ budgetExceeded: enabled })
  }

  const handleGoalMilestonesToggle = (enabled: boolean) => {
    updateNotificationSettings.mutate({ goalMilestones: enabled })
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'password', label: 'Senha', icon: Lock },
    { id: 'notifications', label: 'Notificacoes', icon: Bell },
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto lg:mx-0 lg:max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Configuracoes</h1>
      </div>

      <div className="flex gap-4 border-b border-border mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'profile' | 'password' | 'notifications')}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-secondary hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-secondary text-sm">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...nameForm.register('name')} />
              {nameForm.formState.errors.name && (
                <p className="text-danger text-sm mt-1">{nameForm.formState.errors.name.message}</p>
              )}
            </div>

            <Button type="submit" disabled={updateName.isPending}>
              {updateName.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input id="currentPassword" type="password" {...passwordForm.register('currentPassword')} />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-danger text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-danger text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Alterar Senha
          </Button>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {isLoadingSettings ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-secondary" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Notificacoes por Email
                </h3>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Receber alertas por email</p>
                    <p className="text-secondary text-sm">
                      Receba notificacoes de orçamento e metas no seu email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings?.emailEnabled ?? false}
                    onCheckedChange={handleEmailToggle}
                  />
                </div>

                {notificationSettings?.emailEnabled && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <Label htmlFor="emailAddress">Endereco de email</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={notificationSettings?.emailAddress ?? ''}
                      onChange={(e) => handleEmailAddressChange(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Tipos de Notificacao</h3>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Orçamento excedido</p>
                    <p className="text-secondary text-sm">
                      Quando um orçamento ultrapassa 100% do limite
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings?.budgetExceeded ?? true}
                    onCheckedChange={handleBudgetWarningToggle}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Marcos de meta</p>
                    <p className="text-secondary text-sm">
                      Quando uma meta atinge 50%, 75% ou 100%
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings?.goalMilestones ?? true}
                    onCheckedChange={handleGoalMilestonesToggle}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}