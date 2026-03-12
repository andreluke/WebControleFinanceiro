import { lazy } from 'react'

const loadHomePage = () => import('@/pages/HomePage')
const loadLoginPage = () => import('@/pages/LoginPage')
const loadSignupPage = () => import('@/pages/SignupPage')
const loadDashboardPage = () => import('@/pages/DashboardPage')
const loadTransfersPage = () => import('@/pages/TransfersPage')

export const HomePage = lazy(loadHomePage)
export const LoginPage = lazy(loadLoginPage)
export const SignupPage = lazy(loadSignupPage)
export const DashboardPage = lazy(loadDashboardPage)
export const TransfersPage = lazy(loadTransfersPage)

export async function preloadAuthenticatedChunks() {
  await Promise.all([loadDashboardPage(), loadTransfersPage()])
}

export async function preloadPublicChunks() {
  await Promise.all([loadHomePage(), loadLoginPage(), loadSignupPage()])
}
