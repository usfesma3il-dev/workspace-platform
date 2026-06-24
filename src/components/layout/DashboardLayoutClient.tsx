'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { Profile, Channel } from '@/types'
import { X } from 'lucide-react'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  profile: Profile | null
  channels: Channel[]
}

export default function DashboardLayoutClient({ children, profile, channels }: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-app overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar profile={profile} channels={channels} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setIsSidebarOpen(false)} 
          />
          
          {/* Sidebar Drawer */}
          <div className="relative z-50 w-64 h-full shadow-2xl animate-slide-right flex flex-col">
            <Sidebar profile={profile} channels={channels} />
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 -right-12 w-10 h-10 flex items-center justify-center text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header profile={profile} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-hidden h-full">
          {children}
        </main>
      </div>
    </div>
  )
}
