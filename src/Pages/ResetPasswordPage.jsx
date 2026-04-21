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
    // Supabase puts the token in the URL hash — this exchanges it for a session
    supabase.auth.getSession()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-accent mb-2">DocuMind</h1>
          <p className="text-muted font-body text-sm italic">Set a new password</p>
        </div>

        <div className="bg-surface border border-black/8 rounded-xl p-8">
          {done ? (
            <div className="text-center">
              <p className="text-accent font-mono text-sm">Password updated — redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-xs text-muted block mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface2 border border-black/8 rounded-lg px-4 py-2.5 text-sm font-mono text-text-main outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="font-mono text-xs text-muted block mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
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
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
