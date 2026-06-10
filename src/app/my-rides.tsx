import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../lib/design';
import { formatDate } from '../lib/dateUtils';
import { Button } from '../components/Button';

interface MyRide {
  id: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  seats_available: number;
  bookingCount: number;
}

export default function MyRidesScreen() {
  const [rides, setRides] = useState<MyRide[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(React.useCallback(() => {
    fetchMyRides();
  }, []));

  const fetchMyRides = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: rideData, error } = await supabase.from('rides').select('*').eq('driver_id', user.id).gte('departure_date', new Date().toISOString());
      if (error) throw error;
      if (rideData) {
        const ridesWithBookings = await Promise.all(rideData.map(async ride => {
          const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('ride_id', ride.id).eq('status', 'pending');
          return {
            id: ride.id,
            from_city: ride.from_city,
            to_city: ride.to_city,
            departure_date: ride.departure_date,
            seats_available: ride.seats_available,
            bookingCount: count || 0,
          };
        }));
        setRides(ridesWithBookings);
      }
    } catch (error) {
      console.error('Error fetching my rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookings = (rideId: string) => {
    Alert.alert('Bookings', `View bookings for ride ${rideId.slice(0, 8)}`);
  };

  const renderRide = ({ item }: { item: MyRide }) => (
    <View style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <Text style={styles.routeText}>{item.from_city} → {item.to_city}</Text>
        <View style={styles.bookingBadge}>
          <Text style={styles.bookingText}>{item.bookingCount} requests</Text>
        </View>
      </View>
      <Text style={styles.dateText}>{formatDate(item.departure_date)}</Text>
      <Text style={styles.seatsText}>{item.seats_available} seats available</Text>
      <Button title="View Bookings" onPress={() => handleViewBookings(item.id)} size="small" variant="secondary" />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ember} />
        </View>
      ) : rides.length > 0 ? (
        <FlatList data={rides} keyExtractor={item => item.id} renderItem={renderRide} contentContainerStyle={styles.listContent} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active rides</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: spacing.md },
  rideCard: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  routeText: { ...typography.body, fontWeight: '600', color: colors.midnight, flex: 1 },
  bookingBadge: { backgroundColor: colors.ember, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: 4 },
  bookingText: { color: colors.surface, fontSize: 12, fontWeight: '600' },
  dateText: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.xs },
  seatsText: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.md },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...typography.h2, color: colors.textSecondary },
});
