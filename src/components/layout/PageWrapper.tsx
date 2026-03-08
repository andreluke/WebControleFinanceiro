import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'

export default function PageWrapper() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 p-8">
        <Outlet />
      </main>
    </div>
  )
}
