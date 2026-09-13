'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Brain, Menu, X, LogOut, User, LayoutDashboard, History } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Interview IQ
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/interview/setup" className="btn-ghost flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Start Interview
                </Link>
                <Link href="/history" className="btn-ghost flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </Link>
                <div className="ml-2 flex items-center gap-2 pl-2 border-l border-gray-200">
                  <Link href="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="btn-ghost text-gray-500 hover:text-red-600">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Sign In</Link>
                <Link href="/register" className="btn-primary ml-2">Get Started</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  {user.name}
                </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  Dashboard
                </Link>
                <Link href="/interview/setup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  Start Interview
                </Link>
                <Link href="/history" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  History
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  Profile
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
