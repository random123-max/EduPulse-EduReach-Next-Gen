'use client'

import { useState } from 'react'
import { GraduationCap, Presentation } from 'lucide-react'
import { TeacherCockpit } from '@/components/teacher-cockpit'
import { StudentWorkspace } from '@/components/student-workspace'
import { ToastProvider } from '@/components/ui-primitives'
import { cn } from '@/lib/utils'

type Portal = 'teacher' | 'student'

export default function Page() {
  const [portal, setPortal] = useState<Portal>('teacher')

  return (
    <ToastProvider>
    <div className="relative min-h-screen">
      {/* Global portal switcher */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div className="glass pointer-events-auto flex items-center gap-1 rounded-full p-1 shadow-lg shadow-black/40">
          <SwitchButton
            active={portal === 'teacher'}
            onClick={() => setPortal('teacher')}
            icon={<Presentation className="size-4" />}
            label="Teacher Cockpit"
          />
          <SwitchButton
            active={portal === 'student'}
            onClick={() => setPortal('student')}
            icon={<GraduationCap className="size-4" />}
            label="Student Study OS"
          />
        </div>
      </div>

      <main className="pt-20">
        {portal === 'teacher' ? <TeacherCockpit /> : <StudentWorkspace />}
      </main>
    </div>
    </ToastProvider>
  )
}

function SwitchButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
        active
          ? 'bg-cyan text-primary-foreground shadow-[0_0_20px_-2px_var(--cyan)]'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
