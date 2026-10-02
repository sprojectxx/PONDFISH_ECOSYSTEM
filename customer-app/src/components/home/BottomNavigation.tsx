import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HomeIcon, GpsIcon, ScanQrIcon, TagIcon, ProfileIcon } from './HomeIcons';

export type NavTabType = 'HOME' | 'CATALOG' | 'FISH_DETAIL' | 'BOOKINGS' | 'BOOKING_CONFIRM' | 'SCAN_BILL' | 'SUBSCRIPTION' | 'GPS_MAP' | 'PROFILE' | string;

interface BottomNavigationProps {
  currentTab?: NavTabType;
  onTabPress?: (tab: NavTabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab = 'HOME',
  onTabPress,
}) => {
  const handlePress = (tab: NavTabType) => {
    if (onTabPress) onTabPress(tab);
  };

  const activeColor = '#0F294A';
  const inactiveColor = '#64748B';

  return (
    <View style={styles.navContainer}>
      {/* 1. Home Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress('HOME')}
        activeOpacity={0.7}
      >
        <HomeIcon size={20} color={currentTab === 'HOME' ? activeColor : inactiveColor} />
        <Text style={[styles.navLabel, currentTab === 'HOME' && styles.activeNavLabel]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* 2. Track / Live GPS Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress('GPS_MAP')}
        activeOpacity={0.7}
      >
        <GpsIcon size={20} color={currentTab === 'GPS_MAP' ? activeColor : inactiveColor} />
        <Text style={[styles.navLabel, currentTab === 'GPS_MAP' && styles.activeNavLabel]}>
          Track
        </Text>
      </TouchableOpacity>

      {/* 3. Center Prominent Scan Bill Circular Button */}
      <TouchableOpacity
        style={styles.scanBillCenterButton}
        onPress={() => handlePress('SCAN_BILL')}
        activeOpacity={0.85}
      >
        <View style={styles.scanBillInnerCircle}>
          <ScanQrIcon size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.scanBillLabel}>Scan Bill</Text>
      </TouchableOpacity>

      {/* 4. Subscriptions Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress('SUBSCRIPTION')}
        activeOpacity={0.7}
      >
        <View style={styles.iconWithBadge}>
          <TagIcon size={18} color={currentTab === 'SUBSCRIPTION' ? activeColor : inactiveColor} />
          <View style={styles.blueDotBadge} />
        </View>
        <Text style={[styles.navLabel, currentTab === 'SUBSCRIPTION' && styles.activeNavLabel]}>
          Subscriptions
        </Text>
      </TouchableOpacity>

      {/* 5. Profile Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress('PROFILE')}
        activeOpacity={0.7}
      >
        <ProfileIcon size={18} color={currentTab === 'PROFILE' ? activeColor : inactiveColor} />
        <Text style={[styles.navLabel, currentTab === 'PROFILE' && styles.activeNavLabel]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: 68,
    paddingBottom: 8,
    paddingHorizontal: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  activeNavLabel: {
    color: '#0F294A',
    fontWeight: '800',
  },
  scanBillCenterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  scanBillInnerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A192F',
    borderColor: '#38BDF8',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A192F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  scanBillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 3,
  },
  iconWithBadge: {
    position: 'relative',
  },
  blueDotBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
});
