import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar, { SidebarToggle } from '@/components/layout/Sidebar'

export default function PageWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop only */}
      <div className="hidden md:block">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="min-h-screen p-4 md:ml-60 md:p-8">
        {/* Mobile header with hamburger */}
        <div className="mb-4 flex items-center gap-2 md:hidden">
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
        </div>
        <Outlet />
      </main>
    </div>
  )
}