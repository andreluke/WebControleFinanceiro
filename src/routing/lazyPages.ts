import { lazy } from 'react'

const loadHomePage = () => import('@/pages/HomePage')
const loadLoginPage = () => import('@/pages/LoginPage')
const loadSignupPage = () => import('@/pages/SignupPage')
const loadDashboardPage = () => import('@/pages/DashboardPage')
const loadTransfersPage = () => import('@/pages/TransfersPage')
const loadRecurringPage = () => import('@/pages/RecurringPage')
const loadBudgetsPage = () => import('@/pages/BudgetsPage')
const loadGoalsPage = () => import('@/pages/GoalsPage')
const loadNotificationsPage = () => import('@/pages/NotificationsPage')
const loadSettingsPage = () => import('@/pages/SettingsPage')

export const HomePage = lazy(loadHomePage)
export const LoginPage = lazy(loadLoginPage)
export const SignupPage = lazy(loadSignupPage)
export const DashboardPage = lazy(loadDashboardPage)
export const TransfersPage = lazy(loadTransfersPage)
export const RecurringPage = lazy(loadRecurringPage)
export const BudgetsPage = lazy(loadBudgetsPage)
export const GoalsPage = lazy(loadGoalsPage)
export const NotificationsPage = lazy(loadNotificationsPage)
export const SettingsPage = lazy(loadSettingsPage)

export async function preloadAuthenticatedChunks() {
  await Promise.all([loadDashboardPage(), loadTransfersPage(), loadRecurringPage(), loadBudgetsPage(), loadGoalsPage(), loadNotificationsPage(), loadSettingsPage()])
}

export async function preloadPublicChunks() {
  await Promise.all([loadHomePage(), loadLoginPage(), loadSignupPage()])
}
