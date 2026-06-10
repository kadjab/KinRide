import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../lib/design';
import { formatDate } from '../../lib/dateUtils';

interface Trip {
  id: string;
  ride_id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  status: string;
  driver_name?: string;
}

export default function MyTripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useFocusEffect(React.useCallback(() => {
    fetchTrips();
  }, []));

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: bookings, error: bookingError } = await supabase.from('bookings').select('*').eq('passenger_id', user.id);
      if (bookingError) throw bookingError;
      if (bookings && bookings.length > 0) {
        const rideIds = bookings.map(b => b.ride_id);
        const { data: rides } = await supabase.from('rides').select('*').in('id', rideIds);
        if (rides) {
          const driverIds = [...new Set(rides.map(r => r.driver_id))];
          const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', driverIds);
          const profileMap = profiles?.reduce((acc, p) => { acc[p.id] = p.full_name; return acc; }, {} as Record<string, string>) || {};
          const formattedTrips = bookings.map(booking => {
            const ride = rides.find(r => r.id === booking.ride_id);
            return { id: booking.id, ride_id: booking.ride_id, from_city: ride?.from_city || '', to_city: ride?.to_city || '', departure_date: ride?.departure_date || '', status: booking.status, driver_name: profileMap[ride?.driver_id] };
          });
          setTrips(formattedTrips);
        }
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const isUpcoming = new Date(trip.departure_date) > new Date();
    return filter === 'upcoming' ? isUpcoming : !isUpcoming;
  });

  const renderTrip = ({ item }: { item: Trip }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.cities}>{item.from_city} → {item.to_city}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'accepted' ? colors.success : item.status === 'pending' ? colors.warning : colors.error }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.date}>{formatDate(item.departure_date)}</Text>
      {item.driver_name && <Text style={styles.driver}>Driver: {item.driver_name}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <View style={styles.filterButtons}>
          {(['upcoming', 'past'] as const).map(f => (
            <View key={f} style={[styles.filterButton, filter === f && styles.filterButtonActive]} onTouchEnd={() => setFilter(f)}>
              <Text style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>{f === 'upcoming' ? 'Upcoming' : 'Past'}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ember} />
        </View>
      ) : filteredTrips.length > 0 ? (
        <FlatList data={filteredTrips} keyExtractor={item => item.id} renderItem={renderTrip} contentContainerStyle={styles.listContent} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {filter} trips</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  filterContainer: { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 },
  filterButtons: { flexDirection: 'row', padding: spacing.md, gap: spacing.md },
  filterButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  filterButtonActive: { backgroundColor: colors.ember, borderColor: colors.ember },
  filterButtonText: { color: colors.midnight, fontWeight: '600' },
  filterButtonTextActive: { color: colors.surface },
  listContent: { padding: spacing.md },
  tripCard: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cities: { ...typography.body, fontWeight: '600', color: colors.midnight, flex: 1 },
  statusBadge: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: 4 },
  statusText: { color: colors.surface, fontSize: 12, fontWeight: '600' },
  date: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
  driver: { ...typography.bodySmall, color: colors.textSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.h2, color: colors.textSecondary },
});
