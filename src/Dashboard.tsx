import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

type Report = {
  id: string
  name: string
  size: string
  addedAt: string
}

type Message = {
  id: string
  role: 'you' | 'system'
  text: string
}

const ACCEPT = '.pdf,.txt,.md,image/*,.doc,.docx'

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function DocIcon() {
  return (
    <svg
      width="44"
      height="56"
      viewBox="0 0 44 56"
      fill="none"
      aria-hidden="true"
      className="dash-empty__icon"
    >
      <path
        d="M6 6C6 4.9 6.9 4 8 4H27L38 15V50C38 51.1 37.1 52 36 52H8C6.9 52 6 51.1 6 50V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M27 4V15H38" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M13 24H30M13 31H30M13 38H22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function EmptyState({ onFiles }: { onFiles: (files: FileList | null) => void }) {
  return (
    <section className="dash-empty reveal" style={stagger(0)} aria-labelledby="dash-empty-title">
      <DocIcon />
      <h1 className="dash-empty__title" id="dash-empty-title">
        No records yet.
      </h1>
      <p className="dash-empty__body">
        Upload what your doctor gave you — lab work, letters, scans — then ask about
        anything in it.
      </p>
      <label className="btn">
        <input
          type="file"
          className="visually-hidden"
          multiple
          accept={ACCEPT}
          onChange={(event) => {
            onFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <span className="btn__label">Upload a record</span>
        <span className="btn__arrow" aria-hidden="true">
          ↑
        </span>
      </label>
      <p className="dash-empty__note">
        PDF, photo, or text file · stays in this browser session — nothing is sent anywhere
        yet.
      </p>
    </section>
  )
}

export default function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Record<string, Message[]>>({})
  const [question, setQuestion] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  const selected = useMemo(
    () => reports.find((r) => r.id === selectedId) ?? reports[0] ?? null,
    [reports, selectedId],
  )
  const messages = selected ? (threads[selected.id] ?? []) : []

  useEffect(() => {
    document.title = 'Records — Repera'
  }, [])

  // Keep the newest message in view.
  useEffect(() => {
    const thread = threadRef.current
    if (thread) thread.scrollTop = thread.scrollHeight
  }, [messages.length, selectedId])

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    const added: Report[] = Array.from(list).map((file) => {
      idRef.current += 1
      return {
        id: `r${idRef.current}`,
        name: file.name,
        size: formatSize(file.size),
        addedAt: formatTime(new Date()),
      }
    })
    setReports((prev) => [...added, ...prev])
    if (!selected) setSelectedId(added[0].id)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeReport(id: string) {
    setReports((prev) => {
      const next = prev.filter((r) => r.id !== id)
      if (id === selectedId) setSelectedId(next[0]?.id ?? null)
      return next
    })
    setThreads((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = question.trim()
    if (value === '') return

    const stamp = `m${idRef.current}`
    idRef.current += 1
    const noticeStamp = `m${idRef.current}`
    idRef.current += 1

    setQuestion('')
    setThreads((prev) => ({
      ...prev,
      [selected!.id]: [
        ...(prev[selected!.id] ?? []),
        { id: stamp, role: 'you', text: value },
        {
          id: noticeStamp,
          role: 'system',
          text: 'Assistant isn’t connected in this build — your question is saved to the thread for when it’s wired up.',
        },
      ],
    }))
  }

  return (
    <div className="page">
      <header className="nav shell">
        <a className="nav__wordmark" href="/" onClick={(event) => event.preventDefault()}>
          Repera
        </a>
        <a className="nav__link" href="/" onClick={(event) => { event.preventDefault(); onSignOut() }}>
          Sign out
        </a>
      </header>

      <main className="dash shell">
        {reports.length === 0 ? (
          <EmptyState onFiles={addFiles} />
        ) : (
          <section className="dash-grid reveal" style={stagger(0)}>
            <aside className="dash-rail" aria-label="Uploaded records">
              <div className="dash-rail__head">
                <h2 className="dash-rail__title">Records</h2>
                <label className="btn btn--sm">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="visually-hidden"
                    multiple
                    accept={ACCEPT}
                    onChange={(event) => addFiles(event.target.files)}
                  />
                  <span className="btn__label">Upload</span>
                </label>
              </div>
              <ul className="dash-list">
                {reports.map((report) => (
                  <li className="report-row" key={report.id}>
                    <button
                      type="button"
                      className={`report-item${selected?.id === report.id ? ' is-selected' : ''}`}
                      onClick={() => setSelectedId(report.id)}
                      aria-pressed={selected?.id === report.id}
                    >
                      <span className="report-item__name">{report.name}</span>
                      <span className="report-item__meta">
                        {report.size} · {report.addedAt}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="report-remove"
                      onClick={() => removeReport(report.id)}
                    >
                      <span className="visually-hidden">Remove {report.name}</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="dash-rail__note">Files stay in this browser session.</p>
            </aside>

            <section className="dash-chat" aria-label={`Chat about ${selected?.name}`}>
              <div className="dash-chat__head">
                <span className="chip">
                  <span className="chip__dot" aria-hidden="true" />
                  <span className="chip__name">{selected?.name}</span>
                </span>
                <span className="sample__meta">
                  {selected?.size} · added {selected?.addedAt}
                </span>
              </div>

              <div className="chat__thread" role="log" aria-live="polite" ref={threadRef}>
                {messages.length === 0 ? (
                  <p className="chat__empty">Ask anything about this report.</p>
                ) : (
                  messages.map((message) => (
                    <p
                      key={message.id}
                      className={`bubble bubble--${message.role === 'you' ? 'you' : 'system'}`}
                    >
                      {message.text}
                    </p>
                  ))
                )}
              </div>

              <form className="chat__composer" onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="field__input"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about this report…"
                  aria-label="Ask about this report"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="btn"
                  disabled={question.trim() === ''}
                  aria-disabled={question.trim() === ''}
                >
                  <span className="btn__label">Ask</span>
                  <span className="btn__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              </form>
              <p className="chat__note">
                Answers come from the AI once the backend is wired — your questions are kept
                here.
              </p>
            </section>
          </section>
        )}
      </main>
    </div>
  )
}
