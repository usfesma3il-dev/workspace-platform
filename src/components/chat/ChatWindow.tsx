'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message, Profile } from '@/types'
import { Send, Paperclip, Smile, Hash } from 'lucide-react'
import { formatMessageTime } from '@/lib/utils'
import Avatar from '@/components/shared/Avatar'

interface ChatWindowProps {
  channelId: string
  channelName: string
  currentUser: Profile
}

export default function ChatWindow({ channelId, channelName, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<(Message & { sender: Profile })[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(*)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (data) {
        setMessages(data as (Message & { sender: Profile })[])
      }
      setLoading(false)
    }

    fetchMessages()
  }, [channelId, supabase])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch the sender profile for the new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single()

          const newMsg = {
            ...payload.new,
            sender: senderData,
          } as Message & { sender: Profile }

          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, supabase])

  // Re-fetch when tab becomes visible (fixes mobile background sleep issue)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const fetchMessages = async () => {
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles(*)')
            .eq('channel_id', channelId)
            .order('created_at', { ascending: true })
            .limit(50)

          if (data) {
            setMessages(data as (Message & { sender: Profile })[])
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
          }
        }
        fetchMessages()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [channelId, supabase])

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      channel_id: channelId,
      sender_id: currentUser.id,
      content,
      attachments: [],
    })

    if (error) {
      console.error('Error sending message:', error)
      setNewMessage(content) // Restore on error
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const groupedMessages = messages.reduce(
    (groups: { date: string; messages: typeof messages }[], msg) => {
      const date = new Date(msg.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.date === date) {
        lastGroup.messages.push(msg)
      } else {
        groups.push({ date, messages: [msg] })
      }
      return groups
    },
    []
  )

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
        <Hash className="w-5 h-5 text-muted-foreground" />
        <div>
          <h2 className="font-semibold text-foreground">{channelName}</h2>
          <p className="text-xs text-muted-foreground">
            {messages.length} messages
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 skeleton rounded w-24" />
                  <div className="h-4 skeleton rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl gradient-brand-subtle flex items-center justify-center mb-4">
              <Hash className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-semibold text-foreground">Welcome to #{channelName}!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              This is the beginning of the #{channelName} channel. Send a message to start.
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-3 py-1 rounded-full border border-border bg-background">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Messages */}
              {group.messages.map((msg, idx) => {
                const prevMsg = idx > 0 ? group.messages[idx - 1] : null
                const isSameSender = prevMsg?.sender_id === msg.sender_id &&
                  new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 5 * 60 * 1000
                const isOwn = msg.sender_id === currentUser.id

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group animate-fade-in ${
                      isSameSender ? 'mt-0.5' : 'mt-3'
                    } ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar - only show for first message in group */}
                    <div className="shrink-0 w-8">
                      {!isSameSender && (
                        <Avatar profile={msg.sender} size="sm" />
                      )}
                    </div>

                    <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                      {!isSameSender && (
                        <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-semibold text-foreground">
                            {msg.sender?.full_name || msg.sender?.username}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatMessageTime(msg.created_at)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? 'gradient-brand text-white rounded-tr-sm'
                            : 'bg-muted/50 text-foreground rounded-tl-sm border border-border/50'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {isSameSender && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatMessageTime(msg.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-6 pb-6 pt-4 shrink-0">
        <div className="flex items-end gap-2 glass rounded-2xl p-3 border border-border/80 focus-within:border-purple-500/30 transition-colors">
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={inputRef}
            id="message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelName}`}
            rows={1}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none resize-none max-h-32"
            style={{ minHeight: '24px' }}
          />

          <div className="flex items-center gap-1 shrink-0">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              id="send-message-btn"
              className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
          Press <kbd className="px-1 py-0.5 rounded border border-border text-[10px]">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 rounded border border-border text-[10px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
