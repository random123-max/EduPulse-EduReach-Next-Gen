'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { X, CircleCheck as CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------------- Toast ---------------- */

type Toast = { id: number; msg: string }
type ToastCtx = { notify: (msg: string) => void }

const ToastContext = createContext<ToastCtx | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass animate-rise pointer-events-auto flex items-center gap-2.5 rounded-xl border-glow-green/30 px-4 py-3 text-sm shadow-lg shadow-black/40"
          >
            <CheckCircle2 className="size-4 shrink-0 text-glow-green" />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/* ---------------- Modal ---------------- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass animate-rise relative z-10 w-full max-w-lg rounded-3xl p-6 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-balance">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-muted-foreground transition-all hover:border-white/25 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  )
}

/* ---------------- Field ---------------- */

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

export const cx = cn
