import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

type Status = 'idle' | 'submitting' | 'error'

export default function SignIn({
  initialEmail,
  onSignedIn,
  onBack,
}: {
  initialEmail: string
  onSignedIn: () => void
  onBack: () => void
}) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const passwordRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'Sign in — Repera'
  }, [])

  // Email arrives prefilled after sign-up — land focus on the next thing the
  // user needs: the password field. Visiting directly, focus the email.
  // Focus moves instantly; rings are never animated.
  useEffect(() => {
    if (initialEmail.trim() === '') {
      emailRef.current?.focus()
    } else {
      passwordRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleBack(event: { preventDefault: () => void }) {
    event.preventDefault()
    document.title = 'Repera — Your records, read and explained'
    onBack()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password.trim() === '') {
      setStatus('error')
      setMessage('Enter your password to continue.')
      return
    }

    setStatus('submitting')
    setMessage('')
    await new Promise((resolve) => setTimeout(resolve, 600))
    onSignedIn()
  }

  return (
    <div className="page">
      <header className="nav shell">
        <a className="nav__wordmark" href="/" onClick={handleBack}>
          Repera
        </a>
        <a className="nav__link" href="/" onClick={handleBack}>
          ← Back
        </a>
      </header>

      <main>
        <section className="auth" aria-labelledby="signin-title">
          <h1 className="auth__title reveal" style={stagger(0)} id="signin-title">
            Welcome back.
          </h1>
              <p className="auth__lede reveal" style={stagger(0)}>
                Sign in to keep reading your records.
              </p>
              <form className="auth__form reveal" style={stagger(1)} noValidate onSubmit={handleSubmit}>
                <div className="auth__field">
                  <label className="field__label" htmlFor="signin-email">
                    Email address
                  </label>
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="field__input"
                    ref={emailRef}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-describedby="signin-msg"
                  />
                </div>
                <div className="auth__field">
                  <label className="field__label" htmlFor="signin-password">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="field__input"
                    ref={passwordRef}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      if (status === 'error') {
                        setStatus('idle')
                        setMessage('')
                      }
                    }}
                    aria-invalid={status === 'error'}
                    aria-describedby="signin-msg"
                    aria-disabled={status === 'submitting'}
                    disabled={status === 'submitting'}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn--block"
                  data-busy={status === 'submitting'}
                  disabled={status === 'submitting'}
                  aria-busy={status === 'submitting'}
                >
                  <span className="btn__label">Sign in</span>
                </button>
                <p
                  id="signin-msg"
                  className="field__msg"
                  data-tone={status === 'error' ? 'error' : undefined}
                  aria-live="polite"
                  role={status === 'error' ? 'alert' : undefined}
                >
                  {message}
                </p>
                <p className="auth__hint">
                  <a href="/reset-password">Forgot password?</a>
                  <a href="/" onClick={handleBack}>
                    New here? Create an account
                  </a>
                </p>
              </form>
        </section>
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
