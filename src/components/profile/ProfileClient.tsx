'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, UserStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { User, Loader2, Camera } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import StatusBadge from '@/components/shared/StatusBadge'

interface ProfileClientProps {
  profile: Profile
}

export default function ProfileClient({ profile: initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [status, setStatus] = useState<UserStatus>(profile.status)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const statusOptions: { value: UserStatus; label: string }[] = [
    { value: 'online', label: 'Online' },
    { value: 'away', label: 'Away' },
    { value: 'offline', label: 'Offline' },
  ]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        username: username.trim().toLowerCase(),
        bio: bio.trim() || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setProfile((prev) => ({ ...prev, full_name: fullName, username, bio, status }))
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="w-6 h-6 text-purple-400" />
            Profile Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account information and preferences
          </p>
        </div>

        {/* Avatar section */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar profile={profile} size="lg" />
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {profile.full_name || profile.username}
              </h2>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={profile.status} showLabel />
                <span className="text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground capitalize">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-5">Personal Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  id="profile-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    id="profile-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-7 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your team about yourself..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <div className="flex gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      status === opt.value
                        ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                        : 'border-border text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <StatusBadge status={opt.value} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                ✓ Profile updated successfully
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              id="save-profile"
              className="px-6 py-2.5 rounded-lg gradient-brand text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        {/* Account info */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Role</span>
              <span className="text-sm text-foreground capitalize font-medium">{profile.role}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Member since</span>
              <span className="text-sm text-foreground">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
