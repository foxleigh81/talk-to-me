import { useState } from 'react'
import { useTalkToMe } from '@lib/hooks/use-talk-to-me'
import { Provider } from '@supabase/supabase-js'
import './style.css'

export const LoginForm = () => {
  const { login, loginWithEmail, error, isLoading } = useTalkToMe()
  const [email, setEmail] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      await loginWithEmail(email)
      setEmailSent(true)
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  const handleSocialLogin = async (provider: Provider) => {
    try {
      await login(provider)
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  if (emailSent) {
    return (
      <div className="t-t-m-login-success">
        <h3>Email Sent</h3>
        <p>Check your email for a magic link to sign in.</p>
        <button
          className="t-t-m-button t-t-m-button-secondary"
          onClick={() => setEmailSent(false)}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="t-t-m-login-container">
      <h3 className="t-t-m-login-title">Sign in to comment</h3>

      {error && (
        <div className="t-t-m-login-error" role="alert">
          {error.message}
        </div>
      )}

      {showEmailForm ? (
        <form onSubmit={handleEmailSubmit} className="t-t-m-email-form">
          <div className="t-t-m-form-field">
            <label htmlFor="t-t-m-email" className="t-t-m-label">
              Email
            </label>
            <input
              id="t-t-m-email"
              type="email"
              className="t-t-m-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="t-t-m-form-actions">
            <button
              type="submit"
              className="t-t-m-button t-t-m-button-primary"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
            <button
              type="button"
              className="t-t-m-button t-t-m-button-secondary"
              onClick={() => setShowEmailForm(false)}
            >
              Back
            </button>
          </div>
        </form>
      ) : (
        <div className="t-t-m-login-options">
          <button
            className="t-t-m-button t-t-m-button-full t-t-m-button-secondary"
            onClick={() => setShowEmailForm(true)}
          >
            Continue with Email
          </button>

          <div className="t-t-m-social-divider">
            <span>OR</span>
          </div>

          <div className="t-t-m-social-buttons">
            <button
              className="t-t-m-button t-t-m-social-button t-t-m-social-google"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              aria-label="Sign in with Google"
            >
              <span className="t-t-m-social-text">Google</span>
            </button>
            <button
              className="t-t-m-button t-t-m-social-button t-t-m-social-github"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              aria-label="Sign in with GitHub"
            >
              <span className="t-t-m-social-text">GitHub</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
