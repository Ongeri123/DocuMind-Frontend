import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => navigate('/auth'), 2000)
    } catch (err) {
      setError(err.message)
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
          <p className="text-text-sub text-sm">Set a new password</p>
        </div>

        <div className="bg-surface border border-white/[0.08] rounded-xl p-7">
          {done ? (
            <div className="text-center py-2">
              <p className="text-emerald text-sm">Password updated — redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-sub block mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface2 border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-white/20 transition-colors placeholder:text-muted"
                />
              </div>
              <div>
                <label className="text-xs text-text-sub block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface2 border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-white/20 transition-colors placeholder:text-muted"
                />
              </div>
              {error && <p className="text-coral text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-text-main text-bg py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
