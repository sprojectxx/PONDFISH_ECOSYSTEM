import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HomeHeaderProps {
  userName?: string;
  creditBalance?: number;
  onProfilePress?: () => void;
  onCreditPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Stevan',
  creditBalance = 3420,
  onProfilePress,
  onCreditPress,
}) => {
  const formattedBalance = creditBalance.toLocaleString('en-IN');

  return (
    <View style={styles.container}>
      {/* Top Row: User Greeting & Badges */}
      <View style={styles.topRow}>
        <View style={styles.userTitleContainer}>
          <Text style={styles.greetingText}>Good morning, {userName}</Text>
          {/* Verified Checkmark Badge */}
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedCheck}>✓</Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          {/* Wallet / Credit Balance Pill */}
          <TouchableOpacity style={styles.creditPill} onPress={onCreditPress} activeOpacity={0.8}>
            <View style={styles.creditIconBox}>
              <Text style={styles.creditIconText}>💳</Text>
            </View>
            <Text style={styles.creditAmountText}>₹{formattedBalance}</Text>
          </TouchableOpacity>

          {/* Action / Key Circle Button */}
          <TouchableOpacity style={styles.circleActionButton} onPress={onProfilePress} activeOpacity={0.8}>
            <Text style={styles.keyIconText}>🔑</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitleText}>Your fresh morning quota is ready to claim</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B192C',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
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
  verifiedBadge: {
    backgroundColor: '#3B82F6',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  verifiedCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: -1,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  creditIconBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  creditIconText: {
    fontSize: 11,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyIconText: {
    fontSize: 14,
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
  },
});
