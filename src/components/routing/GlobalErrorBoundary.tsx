import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { notifyErrorToast } from '@/utils/errorFeedback'

interface GlobalErrorBoundaryProps {
  children: ReactNode
}

interface GlobalErrorBoundaryState {
  hasError: boolean
}

export default class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  state: GlobalErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    notifyErrorToast(error, {
      title: 'Erro inesperado',
      fallbackMessage: 'Aconteceu um erro inesperado na aplicacao.',
      dedupeKey: `render:${error.message}`,
    })

    console.error('[RENDER_ERROR]', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  handleTryAgain = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-card">
            <h1 className="mb-2 text-xl font-semibold text-foreground">Algo deu errado</h1>
            <p className="mb-5 text-sm text-secondary">A aplicacao encontrou um erro inesperado.</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={this.handleTryAgain}>Tentar novamente</Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Voltar ao dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
