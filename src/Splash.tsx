import { useState, type CSSProperties, type FormEvent } from 'react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Status = 'idle' | 'submitting' | 'error'

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

function SampleExchange() {
  return (
    <figure className="sample reveal" style={stagger(1)} aria-label="Example exchange">
      <div className="sample__head">
        <span className="chip">
          <span className="chip__dot" aria-hidden="true" />
          <span className="chip__name">blood-work-summary.pdf</span>
        </span>
        <span className="sample__meta">PDF · 4 pages</span>
      </div>
      <p className="sample__q">“What should I bring up at my check-up?”</p>
      <p className="sample__a">
        Your report is mostly routine. Two values sit just outside the lab’s reference
        ranges — vitamin D below, ferritin slightly above — and both are worth a sentence at
        your next appointment.
      </p>
      <figcaption className="sample__tag">Example exchange</figcaption>
    </figure>
  )
}

function SignupForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [status, setStatus] = useState<Status>('idle')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = email.trim()

    if (!EMAIL_RE.test(value)) {
      setStatus('error')
      setMessage('That email doesn’t look right — try a format like name@example.com.')
      return
    }

    setStatus('submitting')
    setMessage('')
    // Spinner stays visible long enough to register (≥ 300 ms), then we hand off.
    await new Promise((resolve) => setTimeout(resolve, 600))
    onSuccess(value)
  }

  return (
    <form className="cta" noValidate onSubmit={handleSubmit}>
      <label className="field__label" htmlFor="email">
        Email address
      </label>
      <div className="cta__row">
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="field__input"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (status === 'error') {
              setStatus('idle')
              setMessage('')
            }
          }}
          aria-invalid={status === 'error'}
          aria-describedby="cta-msg"
          aria-disabled={status === 'submitting'}
          disabled={status === 'submitting'}
        />
        <button
          type="submit"
          className="btn"
          data-busy={status === 'submitting'}
          disabled={status === 'submitting'}
          aria-busy={status === 'submitting'}
        >
          <span className="btn__label">Sign up</span>
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
      <p
        id="cta-msg"
        className="field__msg"
        data-tone={status === 'error' ? 'error' : undefined}
        aria-live="polite"
        role={status === 'error' ? 'alert' : undefined}
      >
        {message}
      </p>
    </form>
  )
}

function Steps() {
  const steps = [
    {
      num: '1.0',
      title: 'Upload.',
      body: 'Drop in what the clinic gave you — a PDF, photos of paper, lab summaries.',
    },
    {
      num: '2.0',
      title: 'Read.',
      body: 'Repera goes through the whole report and marks what changed, what stands out, and what’s routine.',
    },
    {
      num: '3.0',
      title: 'Ask.',
      body: 'Get plain-language answers, plus the questions worth taking to your next appointment.',
    },
  ]

  return (
    <section className="band" aria-labelledby="how-title">
      <div className="shell">
        <h2 className="band__title" id="how-title">
          How it happens
        </h2>
        <p className="band__lede">Three steps, on your schedule.</p>
        <ol className="steps">
          {steps.map((step) => (
            <li className="steps__step" key={step.num}>
              <span className="steps__num" aria-hidden="true">
                {step.num}
              </span>
              <h3 className="steps__title">{step.title}</h3>
              <p className="steps__body">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default function Splash({
  onSuccess,
  onSignIn,
}: {
  onSuccess: (email: string) => void
  onSignIn: () => void
}) {
  return (
    <div className="page">
      <header className="nav shell">
        <a className="nav__wordmark" href="/">
          Repera
        </a>
        <a
          className="nav__link"
          href="/sign-in"
          onClick={(event) => {
            event.preventDefault()
            onSignIn()
          }}
        >
          Sign in
        </a>
      </header>

      <main>
        <section className="hero shell" aria-labelledby="splash-title">
          <div className="hero__copy reveal" style={stagger(0)}>
            <h1 className="hero__title" id="splash-title">
              Your records, read and explained.
            </h1>
            <p className="hero__lede">
              Repera reads the reports your doctors hand you — lab work, letters, scans —
              and tells you what they say, in plain language.
            </p>
            <SignupForm onSuccess={onSuccess} />
          </div>
          <SampleExchange />
        </section>

        <Steps />
      </main>

      <footer className="foot" aria-label="Footer">
        <div className="shell foot__row">
          <span className="foot__brand">Repera</span>
          <nav className="foot__links" aria-label="Footer links">
            <a className="foot__link" href="/privacy">
              Privacy
            </a>
            <a className="foot__link" href="/terms">
              Terms
            </a>
          </nav>
          <span className="foot__credit">© 2026</span>
        </div>
      </footer>
    </div>
  )
}
