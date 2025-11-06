'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, User, Menu, X } from 'lucide-react'
import { MobileSidebar } from './mobile-sidebar'

export function Header() {
  const { data: session } = useSession()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  if (!session) {
    return null
  }

  return (
    <>
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Flash Cards
          </Link>

          {/* Desktop version */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">{session.user?.email}</span>
              {session.user?.role === 'ADMIN' && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  Admin
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        session={session}
      />
    </>
  )
}

