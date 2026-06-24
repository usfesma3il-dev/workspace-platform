import { UserStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: UserStatus
  className?: string
  showLabel?: boolean
}

export default function StatusBadge({ status, className, showLabel = false }: StatusBadgeProps) {
  const dotClass = cn(
    'w-2.5 h-2.5 rounded-full border-2 border-background shrink-0',
    status === 'online' && 'status-online',
    status === 'offline' && 'status-offline',
    status === 'away' && 'status-away',
    className
  )

  if (!showLabel) {
    return <span className={dotClass} />
  }

  return (
    <span className="flex items-center gap-1.5">
      <span className={dotClass} />
      <span className="text-xs capitalize text-muted-foreground">{status}</span>
    </span>
  )
}
