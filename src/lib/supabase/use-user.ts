'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient, hasSupabaseEnv } from './client';
import type { Database, PlanTier, PlanStatus } from './database.types';

export interface AppUser extends User {
  profile: {
    full_name: string | null;
    username: string | null;
    photo_url: string | null;
    plan: PlanTier;
    plan_status: PlanStatus;
  };
}

export interface UseUserResult {
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

const DEFAULT_PROFILE: AppUser['profile'] = {
  full_name: null,
  username: null,
  photo_url: null,
  plan: 'basico' as PlanTier,
  plan_status: 'inactive' as PlanStatus,
};

/**
 * Hook reactivo que combina la sesión de Supabase Auth con el `profile` del
 * usuario. Single source: `onAuthStateChange` ya emite la sesión inicial,
 * así que no hay doble fetch ni doble subscribe.
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    // Sin envs no hay auth posible: caer a modo invitado sin tocar la red.
    if (!hasSupabaseEnv()) {
      setIsUserLoading(false);
      return;
    }

    const supabase = createClient();
    let mounted = true;
    let currentUserId: string | null = null;
    let profileChannel: RealtimeChannel | null = null;

    async function loadProfile(authUser: User) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, photo_url, plan, plan_status')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setUserError(error);
        setIsUserLoading(false);
        return;
      }

      const profile = (data ?? DEFAULT_PROFILE) as AppUser['profile'];
      setUser({ ...authUser, profile });
      setIsUserLoading(false);
    }

    function clearChannel() {
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
        profileChannel = null;
      }
    }

    function subscribeProfile(userId: string) {
      // Si ya estamos suscritos a este user, no hacer nada.
      if (currentUserId === userId && profileChannel) return;

      clearChannel();
      currentUserId = userId;

      const channel = supabase.channel(`realtime:profile:${userId}`);
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          if (!mounted) return;
          const next = payload.new as Database['public']['Tables']['profiles']['Row'];
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  profile: {
                    full_name: next.full_name,
                    username: next.username,
                    photo_url: next.photo_url,
                    plan: next.plan,
                    plan_status: next.plan_status,
                  },
                }
              : prev
          );
        }
      );
      channel.subscribe();
      profileChannel = channel;
    }

    // onAuthStateChange emite INITIAL_SESSION con la sesión actual al
    // suscribirse, así que cubre tanto la carga inicial como cambios.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
        subscribeProfile(session.user.id);
      } else {
        currentUserId = null;
        clearChannel();
        if (mounted) {
          setUser(null);
          setIsUserLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearChannel();
    };
  }, []);

  return { user, isUserLoading, userError };
}
