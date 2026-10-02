import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface GoldPlanCardProps {
  remainingKgToday?: number;
  resetDays?: number;
  claimedThisWeekKg?: number;
  onRechargePress?: () => void;
}

export const GoldPlanCard: React.FC<GoldPlanCardProps> = ({
  remainingKgToday = 0.6,
  resetDays = 2,
  claimedThisWeekKg = 1.4,
  onRechargePress,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Icon Badge */}
      <View style={styles.medalCircle}>
        <Text style={styles.medalIconText}>🎖️</Text>
      </View>

      {/* Middle Info Column */}
      <View style={styles.infoColumn}>
        <Text style={styles.titleText}>
          Gold Plan: <Text style={styles.boldSpan}>{remainingKgToday} kg remaining</Text> for today
        </Text>
        <Text style={styles.subtext}>
          Resets in {resetDays} days • {claimedThisWeekKg} kg claimed this week
        </Text>
      </View>

      {/* Right Recharge Button */}
      <TouchableOpacity style={styles.rechargeButton} onPress={onRechargePress} activeOpacity={0.7}>
        <Text style={styles.rechargeButtonText}>Recharge</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,

    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  medalCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7', // Warm gold/yellow light background
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  medalIconText: {
    fontSize: 16,
  },
  infoColumn: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  boldSpan: {
    fontWeight: '800',
    color: '#0F172A',
  },
  subtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rechargeButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rechargeButtonText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
});
