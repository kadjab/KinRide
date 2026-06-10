import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../lib/design';
import { RideCard } from '../../components/RideCard';
import type { RidePost } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const [rides, setRides] = useState<RidePost[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(React.useCallback(() => {
    fetchRides();
  }, []));

  const fetchRides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('rides').select('*').gte('departure_date', new Date().toISOString()).limit(10);
      if (error) throw error;
      if (data && data.length > 0) {
        const driverIds = [...new Set(data.map(r => r.driver_id))];
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', driverIds);
        const profileMap = profiles?.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, any>) || {};
        const ridesWithProfiles = data.map(ride => ({ ...ride, driver: profileMap[ride.driver_id] }));
        setRides(ridesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.postButton} onPress={() => router.push('/post-ride')} activeOpacity={0.7}>
        <Text style={styles.postButtonText}>Post a Ride</Text>
      </TouchableOpacity>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ember} />
        </View>
      ) : rides.length > 0 ? (
        <FlatList data={rides} keyExtractor={item => item.id} renderItem={({ item }) => (
          <RideCard ride={item} onPress={() => router.push(`/ride-detail?rideId=${item.id}`)} />
        )} contentContainerStyle={styles.listContent} scrollEnabled={true} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No rides available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  postButton: { backgroundColor: colors.ember, margin: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 8, alignItems: 'center' },
  postButtonText: { color: colors.surface, fontWeight: '600', fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: spacing.md },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyText: { ...typography.h2, color: colors.midnight, marginBottom: spacing.sm },
});
