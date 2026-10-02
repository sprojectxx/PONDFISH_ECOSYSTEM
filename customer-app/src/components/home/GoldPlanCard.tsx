import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MedalIcon } from './HomeIcons';

export interface SubscriptionInfoData {
  id?: string;
  planName?: string;
  status?: string;
  creditBalance?: number;
  weeklyQtyLimitKg?: number;
  remainingWeeklyQtyKg?: number;
  resetDays?: number;
}

interface GoldPlanCardProps {
  subscription?: SubscriptionInfoData | null;
  onExplorePlansPress?: () => void;
  onRechargePress?: () => void;
}

export const GoldPlanCard: React.FC<GoldPlanCardProps> = ({
  subscription,
  onExplorePlansPress,
  onRechargePress,
}) => {
  const isActive = subscription && subscription.status === 'ACTIVE';

  if (!isActive) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <View style={styles.medalCircle}>
          <MedalIcon size={18} color="#64748B" />
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.emptyTitleText}>No Active Subscription</Text>
          <Text style={styles.subtext}>
            Choose a subscription to use subscription benefits.
          </Text>
        </View>

        <TouchableOpacity style={styles.exploreButton} onPress={onExplorePlansPress} activeOpacity={0.7}>
          <Text style={styles.exploreButtonText}>Explore Plans</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const remainingKg = subscription.remainingWeeklyQtyKg ?? 0;
  const resetDays = subscription.resetDays ?? 7;
  const planTitle = subscription.planName || 'Active Plan';

  return (
    <View style={styles.container}>
      <View style={styles.medalCircle}>
        <MedalIcon size={18} color="#D97706" />
      </View>

      <View style={styles.infoColumn}>
        <Text style={styles.titleText}>
          {planTitle}: <Text style={styles.boldSpan}>{remainingKg} kg remaining</Text> for today
        </Text>
        <Text style={styles.subtext}>
          Resets in {resetDays} days • Credit: ₹{subscription.creditBalance ?? 0}
        </Text>
      </View>

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
  emptyContainer: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  medalCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
  emptyTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
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
  exploreButton: {
    backgroundColor: '#2463A8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
