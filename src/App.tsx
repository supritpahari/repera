import { useState } from 'react'
import Splash from './Splash'
import SignIn from './SignIn'
import Dashboard from './Dashboard'

type View = 'splash' | 'signin' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('splash')
  const [signupEmail, setSignupEmail] = useState('')

  if (view === 'dashboard') {
    return <Dashboard onSignOut={() => setView('splash')} />
  }

  if (view === 'signin') {
    return (
      <SignIn
        initialEmail={signupEmail}
        onSignedIn={() => setView('dashboard')}
        onBack={() => {
          setSignupEmail('')
          setView('splash')
        }}
      />
    )
  }

  return (
    <Splash
      onSuccess={(email) => {
        setSignupEmail(email)
        setView('signin')
      }}
      onSignIn={() => {
        setSignupEmail('')
        setView('signin')
      }}
    />
  )
}
