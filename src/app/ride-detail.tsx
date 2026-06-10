import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../lib/design';
import { formatDate, formatTime } from '../lib/dateUtils';
import { Button } from '../components/Button';

interface RideDetail {
  id: string;
  driver_id: string;
  driver_name?: string;
  from_city: string;
  to_city: string;
  departure_date: string;
  seats_available: number;
  description?: string;
  driver_rating?: number;
}

export default function RideDetailScreen() {
  const router = useRouter();
  const { rideId } = useLocalSearchParams();
  const [ride, setRide] = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    if (!rideId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      const { data: rideData } = await supabase.from('rides').select('*').eq('id', rideId).single();
      if (rideData) {
        const { data: driverProfile } = await supabase.from('profiles').select('full_name, driver_rating').eq('id', rideData.driver_id).single();
        setRide({ ...rideData, driver_name: driverProfile?.full_name, driver_rating: driverProfile?.driver_rating });
      }
    } catch (error) {
      console.error('Error fetching ride:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async () => {
    if (!ride || !currentUserId) {
      Alert.alert('Error', 'Unable to book ride');
      return;
    }
    if (ride.driver_id === currentUserId) {
      Alert.alert('Error', "You can't book your own ride");
      return;
    }
    setBooking(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        ride_id: ride.id,
        passenger_id: currentUserId,
        status: 'pending',
      });
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      Alert.alert('Success', 'Booking request sent!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to book ride');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.ember} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Ride not found</Text>
      </View>
    );
  }

  const isOwnRide = ride.driver_id === currentUserId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.city}>{ride.from_city}</Text>
          <Text style={styles.smallText}>{formatTime(ride.departure_date)}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View>
          <Text style={styles.city}>{ride.to_city}</Text>
          <Text style={styles.smallText}>{formatDate(ride.departure_date)}</Text>
        </View>
      </View>
      <View style={styles.driverSection}>
        <View style={styles.driverInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{ride.driver_name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{ride.driver_name}</Text>
            {ride.driver_rating && <Text style={styles.rating}>★ {ride.driver_rating.toFixed(1)}</Text>}
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Available Seats</Text>
        <Text style={styles.cardValue}>{ride.seats_available}</Text>
      </View>
      {ride.description && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Details</Text>
          <Text style={styles.cardValue}>{ride.description}</Text>
        </View>
      )}
      <View style={styles.buttonGroup}>
        {!isOwnRide && (
          <>
            <Button title="Request to Book" onPress={handleBookRide} loading={booking} size="large" />
            <Button title="Contact Driver" variant="secondary" onPress={() => {}} size="large" />
          </>
        )}
        <Button title="Back" variant="outline" onPress={() => router.back()} size="large" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  content: { padding: spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.warmWhite },
  header: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  city: { ...typography.h3, color: colors.midnight },
  smallText: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  arrow: { ...typography.h2, color: colors.ember },
  driverSection: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.ember, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.surface },
  driverDetails: { flex: 1 },
  driverName: { ...typography.body, fontWeight: '600', color: colors.midnight },
  rating: { color: colors.ember, fontSize: 14, fontWeight: '600', marginTop: spacing.xs },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  cardValue: { ...typography.body, color: colors.midnight },
  buttonGroup: { gap: spacing.md, marginTop: spacing.lg },
});
