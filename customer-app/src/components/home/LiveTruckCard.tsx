import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface LiveTruckCardProps {
  truckNumber?: string;
  etaMins?: number;
  origin?: string;
  destination?: string;
  onTrackPress?: () => void;
}

export const LiveTruckCard: React.FC<LiveTruckCardProps> = ({
  truckNumber = '#OD-04',
  etaMins = 18,
  origin = 'Godavari Farm',
  destination = 'Madhapur Cold Hub',
  onTrackPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithDot}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.truckTitleText}>
            Fresh Catch Truck {truckNumber} Published Live
          </Text>
        </View>

        <View style={styles.etaBadge}>
          <Text style={styles.etaBadgeText}>ETA {etaMins} mins</Text>
        </View>
      </View>

      {/* Middle En Route Box */}
      <View style={styles.innerBox}>
        <View style={styles.truckIconCircle}>
          <Text style={styles.truckEmoji}>🚚</Text>
        </View>

        <View style={styles.routeDetailsColumn}>
          <Text style={styles.routeStatusText}>Departed {origin} • En route</Text>
          <Text style={styles.destinationText}>Destination: {destination}</Text>
        </View>

        <TouchableOpacity style={styles.trackButton} onPress={onTrackPress} activeOpacity={0.8}>
          <Text style={styles.trackButtonText}>Track Live ↗</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Info Row */}
      <View style={styles.footerRow}>
        <View style={styles.coldChainContainer}>
          <View style={styles.shieldCheckIcon}>
            <Text style={styles.checkChar}>✓</Text>
          </View>
          <Text style={styles.coldChainText}>Continuous 0-4°C Cold Chain Assured</Text>
        </View>

        <Text style={styles.gpsSyncText}>GPS Live Sync</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F294A', // Rich Dark Blue matching Figma
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,

    shadowColor: '#0A192F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  truckTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  etaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 6,
  },
  etaBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  innerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  truckIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  truckEmoji: {
    fontSize: 15,
  },
  routeDetailsColumn: {
    flex: 1,
    marginRight: 6,
  },
  routeStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  destinationText: {
    color: '#93C5FD',
    fontSize: 11,
    marginTop: 2,
  },
  trackButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  trackButtonText: {
    color: '#0F294A',
    fontSize: 11,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coldChainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldCheckIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderColor: '#34D399',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  checkChar: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '900',
  },
  coldChainText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '500',
  },
  gpsSyncText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
