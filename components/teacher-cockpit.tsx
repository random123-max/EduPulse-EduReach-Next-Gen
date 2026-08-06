'use client'

import { useMemo, useState } from 'react'
import {
  Users,
  MessageSquare,
  Clock,
  CalendarRange,
  FileText,
  BookOpen,
  Plus,
  Lightbulb,
  Send,
  ChevronRight,
  Sparkles,
  LogOut,
  ShieldCheck,
  Check,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal, Field, useToast } from '@/components/ui-primitives'

type Classroom = {
  id: number
  name: string
  subject: string
  learners: number
  status: string
  tint: string
}

type Activity = { id: number; title: string; sub: string; kind: 'announcement' | 'room' }

const TINTS = ['from-cyan/20', 'from-purple/20', 'from-glow-green/20', 'from-amber/20']

export function TeacherCockpit() {
  const { notify } = useToast()

  const [classrooms, setClassrooms] = useState<Classroom[]>([
    { id: 1, name: 'Year 10 Mathematics', subject: 'Mathematics', learners: 28, status: 'Test ready', tint: 'from-cyan/20' },
  ])
  const [activity, setActivity] = useState<Activity[]>([
    { id: 1, title: 'Classroom active', sub: 'Maths test is ready for questions', kind: 'room' },
  ])
  const [requests, setRequests] = useState(3)
  const [drafts, setDrafts] = useState(2)
  const [modal, setModal] = useState<null | 'planner' | 'worksheet' | 'lesson' | 'classrooms' | { room: Classroom }>(null)
  const [sortRecent, setSortRecent] = useState(true)

  function addClassroom(c: Omit<Classroom, 'id' | 'tint' | 'status'>) {
    const id = Date.now()
    setClassrooms((prev) => [
      { ...c, id, status: 'Active', tint: TINTS[prev.length % TINTS.length] },
      ...prev,
    ])
    setActivity((prev) => [
      { id, title: 'Classroom created', sub: `${c.name} is ready`, kind: 'room' },
      ...prev,
    ])
    notify(`Workspace "${c.name}" created`)
  }

  function sendAnnouncement(text: string) {
    const id = Date.now()
    setActivity((prev) => [
      { id, title: 'Announcement sent', sub: text.slice(0, 42) || 'Message', kind: 'announcement' },
      ...prev,
    ])
    notify('Announcement sent to your learners')
  }

  const displayedRooms = useMemo(
    () => (sortRecent ? classrooms : [...classrooms].sort((a, b) => a.name.localeCompare(b.name))),
    [classrooms, sortRecent],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <TeacherNav
        onLogout={() => notify('Signed out — see you soon, Mr Person!')}
        onNavClassrooms={() => setModal('classrooms')}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <HeroCard
            rooms={classrooms.length}
            requests={requests}
            drafts={drafts}
            onAction={(m) => setModal(m)}
          />
          <ClassroomGenerator onCreate={addClassroom} />
          <ActiveClassrooms
            rooms={displayedRooms}
            sortRecent={sortRecent}
            onToggleSort={() => setSortRecent((s) => !s)}
            onOpen={(room) => setModal({ room })}
          />
        </div>
        <div className="space-y-6">
          <QuickActions
            requests={requests}
            drafts={drafts}
            onReview={() => {
              if (requests === 0) return notify('No learner requests to review')
              setRequests((r) => Math.max(0, r - 1))
              notify('Learner request approved')
            }}
            onDrafts={() => {
              if (drafts === 0) return notify('No answer drafts pending')
              setDrafts((d) => Math.max(0, d - 1))
              notify('Answer draft published')
            }}
            onAnnounce={() => setModal('planner')}
            onViewAll={() => setModal('classrooms')}
          />
          <RecentActivity feed={activity} />
          <TeacherTip />
          <AnnouncementWidget onSend={sendAnnouncement} />
        </div>
      </div>

      {/* Modals */}
      <Modal
        open={modal === 'planner'}
        onClose={() => setModal(null)}
        title="Weekly planner"
        description="Draft focus sessions for the week ahead."
      >
        <PlannerBody onDone={() => { setModal(null); notify('Weekly plan saved') }} />
      </Modal>

      <Modal
        open={modal === 'worksheet'}
        onClose={() => setModal(null)}
        title="Create worksheet or test"
        description="Generate a Gemini-assisted worksheet for your class."
      >
        <WorksheetBody onDone={() => { setModal(null); notify('Worksheet generated') }} />
      </Modal>

      <Modal
        open={modal === 'lesson'}
        onClose={() => setModal(null)}
        title="Build lesson content"
        description="Outline a structured lesson your learners can follow."
      >
        <WorksheetBody lesson onDone={() => { setModal(null); notify('Lesson content built') }} />
      </Modal>

      <Modal
        open={modal === 'classrooms'}
        onClose={() => setModal(null)}
        title="All classrooms"
        description={`${classrooms.length} active learning ${classrooms.length === 1 ? 'space' : 'spaces'}.`}
      >
        <div className="space-y-2">
          {classrooms.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.learners} learners · {r.status}</p>
              </div>
              <button
                aria-label={`Remove ${r.name}`}
                onClick={() => {
                  setClassrooms((prev) => prev.filter((x) => x.id !== r.id))
                  notify(`Removed ${r.name}`)
                }}
                className="grid size-8 place-items-center rounded-lg border border-white/10 text-muted-foreground transition-all hover:border-red-400/40 hover:text-red-300"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {classrooms.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No classrooms yet. Create one to get started.</p>
          )}
        </div>
      </Modal>

      <Modal
        open={typeof modal === 'object' && modal !== null}
        onClose={() => setModal(null)}
        title={typeof modal === 'object' && modal !== null ? modal.room.name : ''}
        description="Classroom overview"
      >
        {typeof modal === 'object' && modal !== null && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-muted-foreground">Subject</span>
              <span className="font-medium">{modal.room.subject}</span>
            </div>
            <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-muted-foreground">Learners</span>
              <span className="font-medium">{modal.room.learners}</span>
            </div>
            <div className="flex justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-glow-green">{modal.room.status}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function TeacherNav({
  onLogout,
  onNavClassrooms,
}: {
  onLogout: () => void
  onNavClassrooms: () => void
}) {
  return (
    <header className="glass animate-rise flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cyan to-purple text-primary-foreground shadow-[0_0_18px_-4px_var(--cyan)]">
            <ShieldCheck className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Edu<span className="text-cyan">Reach</span>
          </span>
        </div>
        <nav className="hidden items-center gap-5 md:flex">
          <button
            onClick={onNavClassrooms}
            className="text-sm font-medium text-foreground transition-colors"
          >
            My Classrooms
          </button>
          <span className="text-sm text-muted-foreground">Mr Person · Mathematics</span>
        </nav>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-white/25 hover:text-foreground"
      >
        <LogOut className="size-4" /> Logout
      </button>
    </header>
  )
}

function HeroCard({
  rooms,
  requests,
  drafts,
  onAction,
}: {
  rooms: number
  requests: number
  drafts: number
  onAction: (m: 'planner' | 'worksheet' | 'lesson') => void
}) {
  const stats = [
    { label: 'Rooms', sub: 'Active classrooms', value: rooms, icon: Users, tint: 'text-cyan', dot: true },
    { label: 'Requests', sub: 'Awaiting review', value: requests, icon: MessageSquare, tint: 'text-purple' },
    { label: 'Pending', sub: 'Answer drafts', value: drafts, icon: Clock, tint: 'text-glow-green' },
  ]
  return (
    <section className="glass animate-rise relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="absolute -right-16 -top-16 size-56 rounded-full bg-purple/20 blur-3xl" />
      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-glow-green/30 bg-glow-green/10 px-3 py-1 text-xs font-medium text-glow-green">
          <Sparkles className="size-3" /> Live teacher cockpit
        </span>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Good to see you, Mr Person.
            </h1>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Manage classrooms, approve learners, and send clear
              Gemini-assisted answers from one polished space.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionButton primary icon={<CalendarRange className="size-4" />} onClick={() => onAction('planner')}>
                Open weekly planner
              </ActionButton>
              <ActionButton outline icon={<FileText className="size-4" />} onClick={() => onAction('worksheet')}>
                Create worksheet or test
              </ActionButton>
              <ActionButton icon={<BookOpen className="size-4" />} onClick={() => onAction('lesson')}>
                Build lesson content
              </ActionButton>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-glow-green shadow-[0_0_8px_var(--glow-green)]" />
              You&apos;re all set. Keep inspiring your learners.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl p-3 text-center transition-all hover:border-white/20 hover:shadow-lg hover:shadow-black/30"
              >
                <div className="relative mx-auto grid size-9 place-items-center rounded-xl bg-white/5">
                  <s.icon className={cn('size-4', s.tint)} />
                  {s.dot && (
                    <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-glow-green shadow-[0_0_8px_var(--glow-green)]" />
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground/70">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ClassroomGenerator({
  onCreate,
}: {
  onCreate: (c: { name: string; subject: string; learners: number }) => void
}) {
  const [subject, setSubject] = useState('Mathematics')
  const [grade, setGrade] = useState('Year 10')
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')

  const tags = [grade, subject, topic].filter(Boolean)

  function handleCreate() {
    if (!grade.trim() || !subject.trim() || !topic.trim()) {
      setError('Please fill in grade, subject, and topic.')
      return
    }
    setError('')
    onCreate({ name: `${grade} ${subject}`, subject, learners: 0 })
    setTopic('')
  }

  return (
    <section className="glass animate-rise rounded-3xl p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple/15 text-purple">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI Lesson &amp; Classroom Generator</h2>
          <p className="text-sm text-muted-foreground">
            Start a new learning space and invite your learners.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Grade">
          <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. Year 5" className="input-glow" />
        </Field>
        <Field label="Subject">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" className="input-glow" />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="What are we learning this term?">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleCreate()
            }}
            placeholder="e.g. Quadratic equations"
            className="input-glow"
          />
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Auto tags:</span>
        {tags.length ? (
          tags.map((t) => (
            <span key={t} className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-medium text-cyan">
              {t}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground/60">
            EduReach will create suitable tags from the subject and topic.
          </span>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}

      <button
        onClick={handleCreate}
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-teal-400 px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-6px_var(--cyan)] transition-all hover:scale-[1.02]"
      >
        Create Workspace <Plus className="size-4" />
      </button>
    </section>
  )
}

function ActiveClassrooms({
  rooms,
  sortRecent,
  onToggleSort,
  onOpen,
}: {
  rooms: Classroom[]
  sortRecent: boolean
  onToggleSort: () => void
  onOpen: (r: Classroom) => void
}) {
  return (
    <section className="glass animate-rise rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-white/5 text-cyan">
            <Users className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Active Classrooms</h2>
            <p className="text-xs text-muted-foreground">
              Manage ongoing classrooms and track activity.
            </p>
          </div>
        </div>
        <button
          onClick={onToggleSort}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-white/25 hover:text-foreground"
        >
          Sort: {sortRecent ? 'Recent' : 'A–Z'}
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {rooms.map((r) => (
          <button
            key={r.id}
            onClick={() => onOpen(r)}
            className={cn(
              'group rounded-2xl border border-white/10 bg-gradient-to-br to-transparent p-4 text-left transition-all hover:border-white/25',
              r.tint,
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{r.name}</h3>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{r.learners} learners</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-glow-green" />
                {r.status}
              </span>
            </div>
          </button>
        ))}
        {rooms.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
            No classrooms yet — create one above.
          </p>
        )}
      </div>
    </section>
  )
}

function QuickActions({
  requests,
  drafts,
  onReview,
  onDrafts,
  onAnnounce,
  onViewAll,
}: {
  requests: number
  drafts: number
  onReview: () => void
  onDrafts: () => void
  onAnnounce: () => void
  onViewAll: () => void
}) {
  const items = [
    { label: 'Review learner requests', icon: Users, badge: requests, onClick: onReview },
    { label: 'Answer drafts', icon: MessageSquare, badge: drafts, onClick: onDrafts },
    { label: 'Create announcement', icon: Send, onClick: onAnnounce },
    { label: 'View all classrooms', icon: BookOpen, onClick: onViewAll },
  ]
  return (
    <section className="glass animate-rise rounded-3xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-4 text-purple" />
        <h2 className="text-sm font-semibold">Quick Actions</h2>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={it.onClick}
            className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm transition-all hover:border-white/15 hover:bg-white/[0.06]"
          >
            <span className="flex items-center gap-2.5">
              <it.icon className="size-4 text-muted-foreground" />
              {it.label}
            </span>
            <span className="flex items-center gap-2">
              {typeof it.badge === 'number' && (
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full text-[10px] font-semibold',
                    it.badge > 0 ? 'bg-glow-green/15 text-glow-green' : 'bg-white/5 text-muted-foreground',
                  )}
                >
                  {it.badge}
                </span>
              )}
              <ChevronRight className="size-4 text-muted-foreground" />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function RecentActivity({ feed }: { feed: Activity[] }) {
  return (
    <section className="glass animate-rise rounded-3xl p-5">
      <h2 className="mb-4 text-sm font-semibold">Recent Activity</h2>
      <div className="space-y-3">
        {feed.slice(0, 5).map((f) => (
          <div key={f.id} className="flex items-start gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5">
              {f.kind === 'announcement' ? (
                <Send className="size-4 text-cyan" />
              ) : (
                <BookOpen className="size-4 text-purple" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.sub}</p>
            </div>
          </div>
        ))}
        {feed.length === 0 && (
          <p className="text-xs text-muted-foreground">No activity yet.</p>
        )}
      </div>
    </section>
  )
}

function TeacherTip() {
  return (
    <section className="glass animate-rise relative overflow-hidden rounded-3xl p-5">
      <div className="absolute -right-8 -top-8 size-28 rounded-full bg-amber/20 blur-2xl" />
      <div className="relative flex items-center gap-2">
        <Lightbulb className="size-4 text-amber drop-shadow-[0_0_8px_var(--amber)]" />
        <h2 className="text-sm font-semibold">Teacher Tip</h2>
      </div>
      <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
        Use structured answers to break complex topics into clear, digestible
        steps for your learners.
      </p>
    </section>
  )
}

function AnnouncementWidget({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  return (
    <section className="glass animate-rise rounded-3xl p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Send className="size-4 text-cyan" /> Quick announcement
      </h2>
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Send a note to your classroom…"
        className="input-glow resize-none"
      />
      <button
        onClick={() => {
          if (!text.trim()) return
          onSend(text.trim())
          setText('')
        }}
        disabled={!text.trim()}
        className="mt-3 w-full rounded-xl bg-purple/90 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-purple disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        Send announcement
      </button>
    </section>
  )
}

/* ---- modal bodies ---- */

function PlannerBody({ onDone }: { onDone: () => void }) {
  const [sessions, setSessions] = useState(3)
  return (
    <div className="space-y-4">
      <Field label="Focus sessions this week">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSessions((s) => Math.max(1, s - 1))}
            className="grid size-9 place-items-center rounded-lg border border-white/10 transition-all hover:border-white/25"
          >
            −
          </button>
          <span className="w-8 text-center text-lg font-bold tabular-nums">{sessions}</span>
          <button
            onClick={() => setSessions((s) => Math.min(10, s + 1))}
            className="grid size-9 place-items-center rounded-lg border border-white/10 transition-all hover:border-white/25"
          >
            +
          </button>
        </div>
      </Field>
      <button
        onClick={onDone}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01]"
      >
        <Check className="size-4" /> Save plan
      </button>
    </div>
  )
}

function WorksheetBody({ onDone, lesson }: { onDone: () => void; lesson?: boolean }) {
  const [title, setTitle] = useState('')
  const [count, setCount] = useState('10')
  return (
    <div className="space-y-4">
      <Field label={lesson ? 'Lesson title' : 'Worksheet title'}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={lesson ? 'e.g. Intro to functions' : 'e.g. Algebra practice'}
          className="input-glow"
        />
      </Field>
      {!lesson && (
        <Field label="Number of questions">
          <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(e.target.value)} className="input-glow" />
        </Field>
      )}
      <button
        onClick={onDone}
        disabled={!title.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-teal-400 px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        <Sparkles className="size-4" /> Generate with Gemini
      </button>
    </div>
  )
}

function ActionButton({
  children,
  icon,
  primary,
  outline,
  onClick,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  primary?: boolean
  outline?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.03]',
        primary && 'bg-cyan text-primary-foreground shadow-[0_0_24px_-6px_var(--cyan)]',
        outline && 'border border-purple/40 text-purple hover:bg-purple/10',
        !primary && !outline && 'border border-white/10 bg-white/5 text-foreground hover:border-white/25',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
