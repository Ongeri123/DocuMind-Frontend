import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/reset-password'
      })
      if (error) throw error
      setResetSent(true)
    } catch (err) {
      setError(err.message || 'Error sending recovery email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-accent mb-2">DocuMind</h1>
          <p className="text-muted font-body text-sm italic">Chat with your documents</p>
        </div>

        <div className="bg-surface border border-black/8 rounded-xl p-8">

          {forgotPassword ? (
            <div>
              <h2 className="font-display font-bold text-xl text-text-main mb-2">
                Reset your password
              </h2>
              <p className="text-muted font-body text-sm italic mb-6">
                Enter your email and we'll send you a reset link
              </p>

              {resetSent ? (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
                  <p className="text-accent font-mono text-sm">Reset email sent — check your inbox</p>
                  <button
                    onClick={() => { setForgotPassword(false); setResetSent(false) }}
                    className="text-muted font-mono text-xs mt-3 hover:text-text-main transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="font-mono text-xs text-muted block mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                      className="w-full bg-surface2 border border-black/8 rounded-lg px-4 py-2.5 text-sm font-mono text-text-main outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  {error && <p className="text-coral font-mono text-xs">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-mono font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotPassword(false)}
                    className="w-full text-center font-mono text-xs text-muted hover:text-text-main transition-colors"
                  >
                    Back to sign in
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              <h2 className="font-display font-bold text-xl text-text-main mb-6">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-mono text-xs text-muted block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full bg-surface2 border border-black/8 rounded-lg px-4 py-2.5 text-sm font-mono text-text-main outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs text-muted block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-surface2 border border-black/8 rounded-lg px-4 py-2.5 text-sm font-mono text-text-main outline-none focus:border-accent transition-colors"
                  />
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="text-accent font-mono text-xs hover:opacity-75 transition-opacity"
                  >
                    Forgot password?
                  </button>
                )}

                {error && <p className="text-coral font-mono text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-mono font-medium hover:opacity-85 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p className="text-center font-mono text-xs text-muted mt-6">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-accent hover:opacity-75 transition-opacity"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
