import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../lib/design';
import { Button } from '../components/Button';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to KinRide</Text>
      </View>
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>🚗 Share Rides</Text>
          <Text style={styles.featureText}>Post rides and split costs with travelers.</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>💬 Message & Rate</Text>
          <Text style={styles.featureText}>Connect with drivers and rate your experience.</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>🗺️ Real-time Updates</Text>
          <Text style={styles.featureText}>See bookings and messages instantly.</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button title="Start Using KinRide" onPress={() => router.replace('/(tabs)/home')} size="large" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  content: { padding: spacing.lg },
  header: { marginVertical: spacing.xl, alignItems: 'center' },
  title: { ...typography.h1, color: colors.midnight },
  features: { gap: spacing.lg, marginVertical: spacing.xl },
  feature: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.ember },
  featureTitle: { ...typography.h3, color: colors.midnight, marginBottom: spacing.sm },
  featureText: { ...typography.body, color: colors.textSecondary },
  footer: { marginVertical: spacing.xl },
});
