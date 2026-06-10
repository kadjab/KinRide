import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../lib/design';
import { formatDate, formatTime } from '../lib/dateUtils';
import type { RidePost } from '../types';

interface RideCardProps {
  ride: RidePost;
  onPress: () => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.driverName}>{ride.driver?.full_name || 'Driver'}</Text>
        {ride.driver?.driver_rating && (
          <Text style={styles.rating}>★ {ride.driver.driver_rating.toFixed(1)}</Text>
        )}
      </View>

      <View style={styles.route}>
        <View style={styles.routePoint}>
          <Text style={styles.city}>{ride.from_city}</Text>
          <Text style={styles.time}>{formatTime(ride.departure_date)}</Text>
        </View>
        
        <View style={styles.routeLine} />
        
        <View style={styles.routePoint}>
          <Text style={styles.city}>{ride.to_city}</Text>
          <Text style={styles.time}>{formatDate(ride.departure_date)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.seats}>
          {ride.seats_available} {ride.seats_available === 1 ? 'seat' : 'seats'}
        </Text>
        <Text style={styles.description}>{ride.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  driverName: {
    ...typography.h3,
    color: colors.midnight,
  },
  rating: {
    color: colors.ember,
    fontSize: 14,
    fontWeight: '600',
  },
  route: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  city: {
    ...typography.body,
    color: colors.midnight,
    fontWeight: '600',
  },
  time: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  routeLine: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  seats: {
    color: colors.ember,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
