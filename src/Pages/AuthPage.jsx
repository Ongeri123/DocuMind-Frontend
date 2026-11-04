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
        redirectTo: 'https://docu-mind-frontend-mu.vercel.app/reset-password' // replace with your actual URL
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl tracking-tight mb-1">
            <span className="text-text-main">Docu</span><span className="text-accent">Mind</span>
          </h1>
          <p className="text-text-sub text-sm">Chat with your documents using AI</p>
        </div>

        <div className="bg-surface border border-white/[0.08] rounded-xl p-7">

          {forgotPassword ? (
            <div>
              <h2 className="font-display font-semibold text-lg text-text-main mb-1">Reset password</h2>
              <p className="text-text-sub text-sm mb-5">We'll send a reset link to your email</p>

              {resetSent ? (
                <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-4 text-center">
                  <p className="text-emerald text-sm">Reset email sent — check your inbox</p>
                  <button
                    onClick={() => { setForgotPassword(false); setResetSent(false) }}
                    className="text-muted text-xs mt-3 hover:text-text-main transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs text-text-sub block mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                      className="w-full bg-surface2 border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-white/20 transition-colors placeholder:text-muted"
                    />
                  </div>
                  {error && <p className="text-coral text-xs">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-text-main text-bg py-2.5 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button type="button" onClick={() => setForgotPassword(false)}
                    className="w-full text-center text-xs text-muted hover:text-text-main transition-colors"
                  >
                    Back to sign in
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              <h2 className="font-display font-semibold text-lg text-text-main mb-5">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => { setEmail('demo@documind.com'); setPassword('Demo1234!') }}
                  className="w-full mb-4 px-3.5 py-2.5 rounded-lg border border-white/[0.08] bg-surface2 hover:bg-surface3 transition-colors text-left"
                >
                  <p className="text-xs text-muted mb-1">Try the demo account</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-text-sub font-mono">demo@documind.com</span>
                    <span className="text-xs text-text-sub font-mono">Demo1234!</span>
                  </div>
                </button>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-text-sub block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full bg-surface2 border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-white/20 transition-colors placeholder:text-muted"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-sub block mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-surface2 border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-white/20 transition-colors placeholder:text-muted"
                  />
                </div>

                {isLogin && (
                  <button type="button" onClick={() => setForgotPassword(true)}
                    className="text-text-sub text-xs hover:text-text-main transition-colors"
                  >
                    Forgot password?
                  </button>
                )}

                {error && <p className="text-coral text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-text-main text-bg py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40"
                >
                  {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <p className="text-center text-xs text-muted mt-5">
                {isLogin ? "No account?" : 'Have an account?'}{' '}
                <button onClick={() => setIsLogin(!isLogin)}
                  className="text-text-sub hover:text-text-main transition-colors"
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
