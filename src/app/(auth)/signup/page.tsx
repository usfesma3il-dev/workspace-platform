'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Zap, User } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username.toLowerCase().replace(/\s+/g, '_'),
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="glass-card p-10">
            <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center mx-auto mb-4 glow-purple">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>Check your email!</h2>
            <p style={{ color: 'var(--muted)' }}>
              We&apos;ve sent a confirmation link to <span style={{ color: '#9f67f5' }}>{email}</span>. 
              Confirm your email to start using WorkSpace.
            </p>
            <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center glow-purple">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">WorkSpace</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--fg)' }}>Create your account</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Join your team on WorkSpace today</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-sm font-medium block" style={{ color: 'var(--fg)' }}>
                Full Name
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium block" style={{ color: 'var(--fg)' }}>
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>@</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                  className="form-input pl-7"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="text-sm font-medium block" style={{ color: 'var(--fg)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="form-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
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
              id="signup-submit"
              className="w-full py-3 rounded-lg gradient-brand text-white font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-purple mt-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#9f67f5' }} className="font-medium hover:opacity-80 transition-opacity">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
