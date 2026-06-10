import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors } from '../lib/design';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile?.full_name) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/setup-profile');
        }
      } else {
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Session check error:', error);
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.midnight }}>
      <ActivityIndicator size="large" color={colors.ember} />
    </View>
  );
}
