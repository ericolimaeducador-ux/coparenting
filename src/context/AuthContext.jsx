import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

const withTimeout = (promise, timeoutMs = 3000) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('auth_timeout')), timeoutMs)),
])

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    withTimeout(supabase.auth.getSession())
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
      })
      .catch(() => {
        setSession(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, name: fullName },
      },
    })
    return { data, error }
  }

  const signInWithGoogle = async (redirectPath = '/home') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#${redirectPath}`,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/#/update-password',
    })
    return { data, error }
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    return { data, error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    // Convenience getters
    isAuthenticated: !!user,
    userDisplayName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário',
    userEmail: user?.email,
    userAvatar: user?.user_metadata?.avatar_url,
    userId: user?.id,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
