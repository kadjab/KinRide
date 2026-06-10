import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, spacing } from '../../lib/design';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { RideCard } from '../../components/RideCard';
import type { RidePost } from '../../types';

export default function SearchScreen() {
  const router = useRouter();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [rides, setRides] = useState<RidePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!fromCity || !toCity) {
      alert('Please enter both cities');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      let query = supabase.from('rides').select('*').gte('departure_date', new Date().toISOString());
      if (fromCity.trim()) query = query.ilike('from_city', `%${fromCity}%`);
      if (toCity.trim()) query = query.ilike('to_city', `%${toCity}%`);
      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        const driverIds = [...new Set(data.map(r => r.driver_id))];
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', driverIds);
        const profileMap = profiles?.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, any>) || {};
        const ridesWithProfiles = data.map(ride => ({ ...ride, driver: profileMap[ride.driver_id] }));
        setRides(ridesWithProfiles);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error searching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchForm}>
        <Input label="From" placeholder="City name" value={fromCity} onChangeText={setFromCity} />
        <Input label="To" placeholder="City name" value={toCity} onChangeText={setToCity} />
        <Button title="Search Rides" onPress={handleSearch} loading={loading} />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ember} />
        </View>
      ) : searched && rides.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No rides found</Text>
        </View>
      ) : rides.length > 0 ? (
        <FlatList data={rides} keyExtractor={item => item.id} renderItem={({ item }) => (
          <RideCard ride={item} onPress={() => router.push(`/ride-detail?rideId=${item.id}`)} />
        )} contentContainerStyle={styles.listContent} scrollEnabled={true} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  searchForm: { backgroundColor: colors.surface, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: spacing.md },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.midnight, marginBottom: spacing.sm },
});
