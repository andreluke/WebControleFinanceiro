import { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ScrollToTop from '@/components/routing/ScrollToTop'
import GlobalErrorBoundary from '@/components/routing/GlobalErrorBoundary'
import ProtectedRoute from '@/components/routing/ProtectedRoute'
import PageWrapper from '@/components/layout/PageWrapper'
import { DashboardPage, HomePage, LoginPage, RecurringPage, SignupPage, TransfersPage, BudgetsPage, GoalsPage, NotificationsPage } from '@/routing/lazyPages'
import { notifyErrorToast } from '@/utils/errorFeedback'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      notifyErrorToast(error, {
        title: 'Erro ao carregar dados',
        dedupeKey: `query:${query.queryHash}`,
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      notifyErrorToast(error, {
        title: 'Erro ao salvar dados',
        dedupeKey: `mutation:${mutation.options.mutationKey?.join(':') ?? 'unknown'}`,
      })
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalErrorBoundary>
          <ScrollToTop />
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-background text-secondary">
                Carregando...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<SignupPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <PageWrapper />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transfers" element={<TransfersPage />} />
                <Route path="/recurring" element={<RecurringPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </GlobalErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
