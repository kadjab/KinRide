import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../lib/design';
import { Button } from '../../components/Button';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  driver_rating?: number;
  passenger_rating?: number;
  phone?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(React.useCallback(() => {
    fetchProfile();
  }, []));

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.ember} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {profile && (
        <>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.full_name?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
          </View>
          {profile.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}
          <View style={styles.statsSection}>
            {profile.driver_rating && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Driver Rating</Text>
                <Text style={styles.statValue}>★ {profile.driver_rating.toFixed(1)}</Text>
              </View>
            )}
            {profile.passenger_rating && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Passenger Rating</Text>
                <Text style={styles.statValue}>★ {profile.passenger_rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          {profile.phone && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{profile.phone}</Text>
            </View>
          )}
          <View style={styles.buttonGroup}>
            <Button title="My Rides" onPress={() => router.push('/my-rides')} variant="secondary" size="medium" />
            <Button title="Settings" onPress={() => router.push('/settings')} variant="secondary" size="medium" />
          </View>
          <Button title="Sign Out" onPress={handleLogout} variant="danger" size="medium" />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  content: { padding: spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.warmWhite },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.ember, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.surface },
  name: { ...typography.h2, color: colors.midnight, marginBottom: spacing.xs },
  email: { ...typography.body, color: colors.textSecondary },
  bioSection: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  bioText: { ...typography.body, color: colors.midnight },
  statsSection: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  statLabel: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
  statValue: { ...typography.h3, color: colors.ember },
  infoSection: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  infoLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  infoValue: { ...typography.body, color: colors.midnight },
  buttonGroup: { gap: spacing.md, marginBottom: spacing.lg },
});
