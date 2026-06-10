import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../lib/design';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function PostRideScreen() {
  const router = useRouter();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState('');
  const [description, setDescription] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDepartureDate(selectedDate);
    }
  };

  const handlePostRide = async () => {
    if (!fromCity || !toCity || !seatsAvailable) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const { error } = await supabase.from('rides').insert({
        driver_id: user.id,
        from_city: fromCity,
        to_city: toCity,
        seats_available: parseInt(seatsAvailable),
        departure_date: departureDate.toISOString(),
        description,
      });
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      Alert.alert('Success', 'Ride posted successfully!');
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Post a New Ride</Text>
      <Input label="From City" placeholder="e.g., Oslo" value={fromCity} onChangeText={setFromCity} />
      <Input label="To City" placeholder="e.g., Bergen" value={toCity} onChangeText={setToCity} />
      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>DEPARTURE DATE & TIME</Text>
        <Button title={departureDate.toLocaleString('no-NO')} onPress={() => setShowDatePicker(true)} variant="outline" size="medium" />
        {showDatePicker && (
          <DateTimePicker value={departureDate} mode="datetime" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleDateChange} minimumDate={new Date()} />
        )}
      </View>
      <Input label="Available Seats" placeholder="e.g., 3" value={seatsAvailable} onChangeText={setSeatsAvailable} keyboardType="numeric" />
      <Input label="Description (Optional)" placeholder="Any special details..." value={description} onChangeText={setDescription} multiline numberOfLines={4} />
      <View style={styles.buttonGroup}>
        <Button title="Post Ride" onPress={handlePostRide} loading={loading} size="large" />
        <Button title="Cancel" onPress={() => router.back()} variant="outline" size="large" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.midnight, marginBottom: spacing.lg },
  datePickerContainer: { marginBottom: spacing.md },
  dateLabel: { ...typography.label, color: colors.midnight, marginBottom: spacing.xs },
  buttonGroup: { gap: spacing.md, marginTop: spacing.lg },
});
