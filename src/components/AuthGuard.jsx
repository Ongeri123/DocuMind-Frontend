import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useAuth from '../store/useAuth'

export default function AuthGuard({ children }) {
  const { user, setUser, setSession, setLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setSession(session)
      setLoading(false)
      if (!session) navigate('/auth')
    })

    // listen for auth changes — login, logout, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setSession(session)
        if (!session) navigate('/auth')
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (!user) return <div className="min-h-screen bg-bg" />

  return children
}