import { lazy } from 'react'

const loadHomePage = () => import('@/pages/HomePage')
const loadLoginPage = () => import('@/pages/LoginPage')
const loadSignupPage = () => import('@/pages/SignupPage')
const loadDashboardPage = () => import('@/pages/DashboardPage')
const loadTransfersPage = () => import('@/pages/TransfersPage')
const loadRecurringPage = () => import('@/pages/RecurringPage')
const loadBudgetsPage = () => import('@/pages/BudgetsPage')
const loadGoalsPage = () => import('@/pages/GoalsPage')

export const HomePage = lazy(loadHomePage)
export const LoginPage = lazy(loadLoginPage)
export const SignupPage = lazy(loadSignupPage)
export const DashboardPage = lazy(loadDashboardPage)
export const TransfersPage = lazy(loadTransfersPage)
export const RecurringPage = lazy(loadRecurringPage)
export const BudgetsPage = lazy(loadBudgetsPage)
export const GoalsPage = lazy(loadGoalsPage)

export async function preloadAuthenticatedChunks() {
  await Promise.all([loadDashboardPage(), loadTransfersPage(), loadRecurringPage(), loadBudgetsPage(), loadGoalsPage()])
}

export async function preloadPublicChunks() {
  await Promise.all([loadHomePage(), loadLoginPage(), loadSignupPage()])
}
