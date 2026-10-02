import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WalletIcon, ProfileIcon } from './HomeIcons';

interface HomeHeaderProps {
  userName?: string;
  creditBalance?: number;
  hasSubscription?: boolean;
  onProfilePress?: () => void;
  onCreditPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  creditBalance = 0,
  hasSubscription = false,
  onProfilePress,
  onCreditPress,
}) => {
  const displayName = userName?.trim() ? userName : 'Customer';
  const formattedBalance = creditBalance.toLocaleString('en-IN');

  return (
    <View style={styles.container}>
      {/* Top Row: User Greeting & Actions */}
      <View style={styles.topRow}>
        <View style={styles.userTitleContainer}>
          <Text style={styles.greetingText}>Good morning, {displayName}</Text>
        </View>

        <View style={styles.rightActions}>
          {/* Wallet / Credit Balance Pill (shows when customer has subscription or credit) */}
          {hasSubscription && (
            <TouchableOpacity style={styles.creditPill} onPress={onCreditPress} activeOpacity={0.8}>
              <View style={styles.creditIconBox}>
                <WalletIcon size={14} color="#10B981" />
              </View>
              <Text style={styles.creditAmountText}>₹{formattedBalance}</Text>
            </TouchableOpacity>
          )}

          {/* Action / Profile Circle Button */}
          <TouchableOpacity style={styles.circleActionButton} onPress={onProfilePress} activeOpacity={0.8}>
            <ProfileIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitleText}>Your fresh morning catch is ready to browse</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B192C',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  creditIconBox: {
    marginRight: 6,
  },
  creditAmountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  circleActionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
  },
});
