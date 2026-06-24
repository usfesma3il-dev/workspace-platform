import { Profile } from '@/types'
import { cn } from '@/lib/utils'

interface AvatarProps {
  profile: Profile
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
}

function getInitials(profile: Profile) {
  if (profile.full_name) {
    const parts = profile.full_name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }
  return profile.username[0].toUpperCase()
}

function getColorFromId(id: string) {
  const colors = [
    'from-purple-500 to-blue-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-pink-500 to-rose-500',
    'from-orange-500 to-amber-500',
    'from-violet-500 to-purple-500',
    'from-indigo-500 to-blue-500',
  ]
  const index = id.charCodeAt(0) % colors.length
  return colors[index]
}

export default function Avatar({ profile, size = 'md', className }: AvatarProps) {
  const sizeClass = sizeClasses[size]
  const gradient = getColorFromId(profile.id)

  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={profile.full_name || profile.username}
        className={cn(sizeClass, 'rounded-full object-cover ring-2 ring-border', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        sizeClass,
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
        `bg-gradient-to-br ${gradient}`,
        className
      )}
    >
      {getInitials(profile)}
    </div>
  )
}
