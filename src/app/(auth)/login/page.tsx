'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center glow-purple">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">WorkSpace</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--fg)' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Sign in to continue to WorkSpace</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium block" style={{ color: 'var(--fg)' }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ color: '#9f67f5', fontSize: '12px' }}
                  className="hover:opacity-80 transition-opacity">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                  style={{ color: 'var(--muted)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg animate-fade-in" style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              id="login-submit"
              className="w-full py-3 rounded-lg gradient-brand text-white font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-purple"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#9f67f5' }} className="font-medium hover:opacity-80 transition-opacity">
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
