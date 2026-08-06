'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  Calendar,
  BookMarked,
  StickyNote,
  Sparkles,
  BarChart3,
  Timer,
  Settings,
  Search,
  Bell,
  Play,
  Pause,
  RotateCcw,
  Flag,
  BookOpen,
  Repeat,
  Target,
  Trophy,
  Check,
  Zap,
  ArrowRight,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui-primitives'

type Task = { id: number; label: string; prio: 'High' | 'Med' | 'Low'; done: boolean }
type NavKey = string

export function StudentWorkspace() {
  const { notify } = useToast()
  const [active, setActive] = useState<NavKey>('Planner')
  const [query, setQuery] = useState('')

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, label: 'Finish algebra worksheet', prio: 'High', done: false },
    { id: 2, label: 'Read biology chapter 4', prio: 'Med', done: false },
    { id: 3, label: 'Draft English essay intro', prio: 'Low', done: true },
  ])

  const roadmapRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<HTMLDivElement>(null)

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }
  function addTask(label: string, prio: Task['prio']) {
    setTasks((prev) => [...prev, { id: Date.now(), label, prio, done: false }])
    notify('Task added to your plan')
  }
  function removeTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="mx-auto flex max-w-[1400px] gap-6 px-4 pb-16 sm:px-6 lg:px-8">
      <StudentSidebar active={active} onSelect={setActive} onLevelUp={() => notify('Keep going — consistency is key!')} />
      <div className="min-w-0 flex-1 space-y-6">
        <StudentHero query={query} onQuery={setQuery} onNotify={() => notify('You have 2 new reminders')} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <NextBestAction
            onStartPlanning={() => {
              timerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              notify('Let’s plan your focus sessions')
            }}
            onViewRoadmap={() => roadmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          />
          <div className="xl:col-span-2">
            <WeekAtAGlance tasks={tasks} onView={() => setActive('Calendar')} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <TaskManager tasks={tasks} onToggle={toggleTask} onAdd={addTask} onRemove={removeTask} query={query} />
          <div ref={timerRef}>
            <FocusTimer onComplete={() => notify('Focus session complete! Take a break.')} />
          </div>
          <div ref={roadmapRef}>
            <StudyRoadmap onNotify={notify} />
          </div>
        </div>
        <SubjectMastery />
        <AiPlanningCoach onNotify={notify} />
      </div>
    </div>
  )
}

function StudentSidebar({
  active,
  onSelect,
  onLevelUp,
}: {
  active: NavKey
  onSelect: (k: NavKey) => void
  onLevelUp: () => void
}) {
  const nav = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Planner', icon: CalendarDays },
    { label: 'Tasks', icon: ListChecks },
    { label: 'Calendar', icon: Calendar },
    { label: 'Subjects', icon: BookMarked },
    { label: 'Notes', icon: StickyNote },
    { label: 'AI Coach', icon: Sparkles, beta: true },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Focus Timer', icon: Timer },
    { label: 'Settings', icon: Settings },
  ]
  return (
    <aside className="glass sticky top-24 hidden h-fit w-56 shrink-0 rounded-3xl p-4 lg:block">
      <div className="mb-5 flex items-center gap-2 px-2">
        <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cyan to-purple text-primary-foreground">
          <BookOpen className="size-4" />
        </div>
        <span className="font-semibold tracking-tight">
          Edu<span className="text-cyan">Reach</span>
        </span>
      </div>
      <nav className="space-y-1">
        {nav.map((n) => (
          <button
            key={n.label}
            onClick={() => onSelect(n.label)}
            aria-current={active === n.label ? 'page' : undefined}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all',
              active === n.label
                ? 'bg-cyan/10 font-medium text-cyan shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--cyan)_30%,transparent)]'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <n.icon className="size-4" />
            {n.label}
            {n.beta && (
              <span className="ml-auto rounded-full bg-purple/20 px-1.5 py-0.5 text-[9px] font-bold text-purple">
                BETA
              </span>
            )}
          </button>
        ))}
      </nav>
      <button
        onClick={onLevelUp}
        className="mt-5 block w-full rounded-2xl border border-white/10 bg-gradient-to-br from-purple/15 to-transparent p-4 text-left transition-all hover:border-white/25"
      >
        <Zap className="size-4 text-amber" />
        <p className="mt-2 text-sm font-medium">Level up your focus</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Keep your plan realistic, colourful, and consistent.
        </p>
      </button>
    </aside>
  )
}

function StudentHero({
  query,
  onQuery,
  onNotify,
}: {
  query: string
  onQuery: (v: string) => void
  onNotify: () => void
}) {
  return (
    <header className="glass animate-rise flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Plan your week{' '}
          <span className="bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
            — everything you need. In one planner.
          </span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay focused, stay consistent, achieve more.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search tasks…"
            className="input-glow w-56 pl-9"
          />
        </div>
        <button
          onClick={onNotify}
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition-all hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-amber shadow-[0_0_6px_var(--amber)]" />
        </button>
        <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-cyan to-purple text-sm font-bold text-primary-foreground">
          T
        </div>
      </div>
    </header>
  )
}

function NextBestAction({
  onStartPlanning,
  onViewRoadmap,
}: {
  onStartPlanning: () => void
  onViewRoadmap: () => void
}) {
  return (
    <section className="glass animate-rise relative overflow-hidden rounded-3xl p-6">
      <div className="absolute -left-10 -top-10 size-32 rounded-full bg-cyan/20 blur-3xl" />
      <div className="relative">
        <span className="text-xs font-semibold uppercase tracking-wider text-cyan">
          Next best action
        </span>
        <div className="mt-3 flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-cyan/15 text-cyan shadow-[0_0_18px_-4px_var(--cyan)]">
            <Zap className="size-5" />
          </div>
          <h2 className="text-lg font-semibold leading-snug">
            Plan 3 focus sessions and review your revision notes.
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Small steps today lead to big results tomorrow. Let&apos;s make this
          week count.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={onStartPlanning}
            className="flex items-center gap-2 rounded-xl bg-glow-green px-4 py-2 text-sm font-semibold text-[#05241a] transition-all hover:scale-[1.03]"
          >
            <Play className="size-4" /> Start planning
          </button>
          <button
            onClick={onViewRoadmap}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm transition-all hover:border-white/25"
          >
            View roadmap <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

function WeekAtAGlance({ tasks, onView }: { tasks: Task[]; onView: () => void }) {
  const pending = tasks.filter((t) => !t.done).length
  const days = [
    { d: 'Mon', n: 27, tint: 'text-amber', tasks: 0 },
    { d: 'Tue', n: 28, tint: 'text-glow-green', tasks: 0 },
    { d: 'Wed', n: 29, tint: 'text-cyan', today: true, tasks: pending },
    { d: 'Thu', n: 30, tint: 'text-purple', tasks: 0 },
    { d: 'Fri', n: 31, tint: 'text-glow-green', tasks: 0 },
    { d: 'Sat', n: 1, tint: 'text-amber', tasks: 0 },
    { d: 'Sun', n: 2, tint: 'text-cyan', tasks: 0 },
  ]
  return (
    <section className="glass animate-rise h-full rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Week at a glance</h2>
          <p className="text-xs text-muted-foreground">Jul 27 – Aug 2</p>
        </div>
        <button onClick={onView} className="text-xs text-cyan hover:underline">
          View calendar
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.d}
            className={cn(
              'rounded-2xl border p-2 text-center transition-all hover:border-white/25',
              day.today ? 'border-cyan/40 bg-cyan/10' : 'border-white/5 bg-white/[0.02]',
            )}
          >
            <p className="text-[10px] text-muted-foreground">{day.d}</p>
            <div
              className={cn(
                'mx-auto mt-2 grid size-9 place-items-center rounded-full bg-white/5 text-sm font-bold',
                day.tint,
              )}
            >
              {day.n}
            </div>
            <p className="mt-1.5 text-[9px] text-muted-foreground">{day.tasks} tasks</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function TaskManager({
  tasks,
  onToggle,
  onAdd,
  onRemove,
  query,
}: {
  tasks: Task[]
  onToggle: (id: number) => void
  onAdd: (label: string, prio: Task['prio']) => void
  onRemove: (id: number) => void
  query: string
}) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [prio, setPrio] = useState<Task['prio']>('Med')

  const deadlines = [
    { label: 'Science Lab Report', date: 'Jul 14', tint: 'bg-amber' },
    { label: 'Maths Assignment', date: 'Jul 16', tint: 'bg-cyan' },
    { label: 'English Essay', date: 'Jul 18', tint: 'bg-purple' },
    { label: 'History Project', date: 'Jul 22', tint: 'bg-glow-green' },
  ]
  const prioTint: Record<string, string> = {
    High: 'border-red-400/40 bg-red-400/10 text-red-300',
    Med: 'border-amber/40 bg-amber/10 text-amber',
    Low: 'border-glow-green/40 bg-glow-green/10 text-glow-green',
  }

  const visible = useMemo(
    () => (query.trim() ? tasks.filter((t) => t.label.toLowerCase().includes(query.toLowerCase())) : tasks),
    [tasks, query],
  )
  const completed = tasks.filter((t) => t.done).length

  function submit() {
    if (!label.trim()) return
    onAdd(label.trim(), prio)
    setLabel('')
    setPrio('Med')
    setAdding(false)
  }

  return (
    <section className="glass animate-rise rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ListChecks className="size-4 text-cyan" /> Today&apos;s tasks
        </h2>
        <span className="text-xs text-muted-foreground">
          {completed}/{tasks.length} completed
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {visible.map((t) => (
          <div
            key={t.id}
            className="group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-all hover:border-white/15"
          >
            <button
              onClick={() => onToggle(t.id)}
              aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-md border transition-all',
                t.done ? 'border-cyan bg-cyan text-primary-foreground' : 'border-white/25 hover:border-cyan',
              )}
            >
              {t.done && <Check className="size-3.5" />}
            </button>
            <span className={cn('flex-1 text-sm', t.done && 'text-muted-foreground line-through')}>
              {t.label}
            </span>
            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', prioTint[t.prio])}>
              {t.prio}
            </span>
            <button
              onClick={() => onRemove(t.id)}
              aria-label="Remove task"
              className="text-muted-foreground opacity-0 transition-all hover:text-red-300 group-hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {query.trim() ? 'No matching tasks.' : 'Nothing planned. Add a task below.'}
          </p>
        )}
      </div>

      {adding ? (
        <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit()
              if (e.key === 'Escape') setAdding(false)
            }}
            placeholder="New task…"
            className="input-glow"
          />
          <div className="flex items-center gap-2">
            {(['High', 'Med', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPrio(p)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all',
                  prio === p ? prioTint[p] : 'border-white/10 text-muted-foreground',
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={submit}
              className="ml-auto rounded-lg bg-cyan px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:scale-[1.03]"
            >
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-muted-foreground transition-all hover:border-cyan/40 hover:text-cyan"
        >
          <Plus className="size-4" /> Add new task
        </button>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <h3 className="mb-3 text-sm font-semibold">Upcoming deadlines</h3>
        <div className="space-y-2.5">
          {deadlines.map((d) => (
            <div key={d.label} className="flex items-center gap-3 text-sm">
              <span className={cn('size-2 rounded-full', d.tint)} />
              <span className="flex-1">{d.label}</span>
              <span className="text-xs text-muted-foreground">{d.date}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FocusTimer({ onComplete }: { onComplete: () => void }) {
  const TOTAL = 25 * 60
  const [seconds, setSeconds] = useState(TOTAL)
  const [running, setRunning] = useState(false)
  const [ambient, setAmbient] = useState('Lo-Fi')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false)
            onComplete()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, onComplete])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const progress = 1 - seconds / TOTAL
  const R = 52
  const C = 2 * Math.PI * R

  return (
    <section className="glass animate-rise flex flex-col rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Timer className="size-4 text-purple" /> Focus timer
      </h2>
      <p className="text-xs text-muted-foreground">Pomodoro · {ambient}</p>

      <div className="relative mx-auto my-5 grid size-40 place-items-center">
        <svg className="size-40 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 6px var(--cyan))' }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-3xl font-bold tabular-nums">
            {mm}:{ss}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {seconds === 0 ? 'Done' : 'Focus'}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            if (seconds === 0) setSeconds(TOTAL)
            setRunning((r) => !r)
          }}
          className="flex items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_-4px_var(--cyan)] transition-all hover:scale-[1.03]"
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? 'Pause' : seconds === 0 ? 'Restart' : 'Start focus'}
        </button>
        <button
          onClick={() => {
            setRunning(false)
            setSeconds(TOTAL)
          }}
          aria-label="Reset timer"
          className="grid size-10 place-items-center rounded-xl border border-white/10 text-muted-foreground transition-all hover:text-foreground"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {['Lo-Fi', 'Rain', 'Coffee Shop'].map((a) => (
          <button
            key={a}
            onClick={() => setAmbient(a)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-all',
              ambient === a
                ? 'border-purple/50 bg-purple/15 text-purple'
                : 'border-white/10 text-muted-foreground hover:text-foreground',
            )}
          >
            {a}
          </button>
        ))}
      </div>
    </section>
  )
}

function StudyRoadmap({ onNotify }: { onNotify: (m: string) => void }) {
  const [step, setStep] = useState(3)
  const steps = [
    { label: 'Plan', sub: 'Plan your week', icon: Flag },
    { label: 'Learn', sub: 'Learn key topics', icon: BookOpen },
    { label: 'Revise', sub: 'Review & summarise', icon: Repeat },
    { label: 'Practice', sub: 'Do practice tests', icon: Target },
    { label: 'Master', sub: 'Track & improve', icon: Trophy },
  ]
  return (
    <section className="glass animate-rise rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold">Study roadmap</h2>
        <span className="text-xs text-cyan">{step}/{steps.length}</span>
      </div>
      <div className="space-y-1">
        {steps.map((s, i) => {
          const done = i < step
          return (
            <button
              key={s.label}
              onClick={() => {
                setStep(i + 1)
                onNotify(`Roadmap updated to "${s.label}"`)
              }}
              className="flex w-full gap-3 text-left"
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'grid size-9 place-items-center rounded-full border transition-all',
                    done
                      ? 'border-cyan bg-cyan/15 text-cyan shadow-[0_0_14px_-3px_var(--cyan)]'
                      : 'border-white/15 text-muted-foreground',
                  )}
                >
                  <s.icon className="size-4" />
                </div>
                {i < steps.length - 1 && (
                  <span className={cn('my-1 w-px flex-1', done ? 'bg-cyan/50' : 'bg-white/10')} />
                )}
              </div>
              <div className="pb-3">
                <p className={cn('text-sm font-medium', !done && 'text-muted-foreground')}>{s.label}</p>
                <p className="text-xs text-muted-foreground/70">{s.sub}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function SubjectMastery() {
  const subjects = [
    { name: 'Maths', pct: 82, color: 'var(--cyan)' },
    { name: 'Science', pct: 65, color: 'var(--purple)' },
    { name: 'English', pct: 60, color: '#a855f7' },
    { name: 'Biology', pct: 74, color: 'var(--glow-green)' },
    { name: 'History', pct: 57, color: 'var(--amber)' },
  ]
  return (
    <section className="glass animate-rise rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold">Subject mastery</h2>
        <span className="text-xs text-cyan">This week</span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {subjects.map((s) => (
          <Ring key={s.name} {...s} />
        ))}
      </div>
    </section>
  )
}

function Ring({ name, pct, color }: { name: string; pct: number; color: string }) {
  const R = 34
  const C = 2 * Math.PI * R
  return (
    <div className="glass flex flex-col items-center rounded-2xl p-4 transition-all hover:border-white/20">
      <div className="relative grid size-24 place-items-center">
        <svg className="size-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct / 100)}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <span className="absolute text-lg font-bold">{pct}%</span>
      </div>
      <p className="mt-2 text-sm font-medium">{name}</p>
    </div>
  )
}

type ChatMsg = { id: number; role: 'user' | 'coach'; text: string }

function AiPlanningCoach({ onNotify }: { onNotify: (m: string) => void }) {
  const chips = ['Plan my week', 'Balance my subjects', 'Find focus time']
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  const replies: Record<string, string> = {
    'Plan my week':
      'Here’s a plan: 3 focus blocks Mon–Wed on your High-priority tasks, revision on Thu, and a light practice test Fri. Want me to add these to your tasks?',
    'Balance my subjects':
      'Maths and Biology are strong (82% / 74%). Give History and English an extra 30-min block each this week to even things out.',
    'Find focus time':
      'Your calendar is clearest Wed afternoon — I’d lock in two 25-minute Pomodoro sessions there.',
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: ChatMsg = { id: Date.now(), role: 'user', text: trimmed }
    const reply =
      replies[trimmed] ??
      `Good question! Based on your current plan, I’d focus on your High-priority tasks first, then schedule short review sessions to lock it in.`
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: Date.now() + 1, role: 'coach', text: reply },
    ])
    setInput('')
    onNotify('Planning coach replied')
  }

  return (
    <section className="glass animate-rise relative overflow-hidden rounded-3xl p-6 shadow-[0_0_50px_-20px_var(--purple)]">
      <div className="absolute -right-16 -top-16 size-52 rounded-full bg-purple/25 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-purple/20 text-purple shadow-[0_0_16px_-4px_var(--purple)]">
            <Sparkles className="size-4" />
          </div>
          <h2 className="text-base font-semibold">AI Planning Coach</h2>
          <span className="rounded-full bg-purple/20 px-2 py-0.5 text-[9px] font-bold text-purple">
            BETA
          </span>
        </div>

        {messages.length === 0 ? (
          <p className="mt-3 max-w-lg text-sm text-muted-foreground">
            I can help you plan smarter and stay consistent. Ask me to organise
            your week or balance your subjects.
          </p>
        ) : (
          <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-cyan/15 text-foreground'
                      : 'border border-purple/25 bg-purple/10 text-foreground',
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              className="rounded-full border border-purple/30 bg-purple/10 px-3 py-1.5 text-xs text-purple transition-all hover:bg-purple/20"
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) send(input)
            }}
            placeholder="Ask your planning coach…"
            className="input-glow flex-1"
          />
          <button
            onClick={() => send(input)}
            aria-label="Send message"
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple to-fuchsia-500 text-white transition-all hover:scale-105"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
