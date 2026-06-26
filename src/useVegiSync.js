import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'

export function useVegiSync(userId, onRealtimeUpdate) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const onRealtimeUpdateRef = useRef(onRealtimeUpdate)
  useEffect(() => {
    onRealtimeUpdateRef.current = onRealtimeUpdate
  })

  useEffect(() => {
    if (!userId || !supabase) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        console.error("Error cargando perfil pránico de Supabase:", err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    // Suscripción Realtime
    const profileSubscription = supabase
      .channel(`profile-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('¡Actualización mística recibida de Supabase Realtime!', payload.new)
          setProfile(payload.new)
          if (onRealtimeUpdateRef.current) {
            onRealtimeUpdateRef.current(payload.new)
          }
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profileSubscription)
    }
  }, [userId])

  return { profile, loading, setProfile }
}
