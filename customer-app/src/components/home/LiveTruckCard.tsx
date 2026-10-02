import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TruckIcon, ShieldCheckIcon } from './HomeIcons';

export interface LiveGpsData {
  id?: string;
  truckNumber?: string;
  driverName?: string;
  status?: string;
  origin?: string;
  destination?: string;
  etaMins?: number;
  isPublished?: boolean;
}

interface LiveTruckCardProps {
  gpsData?: LiveGpsData | null;
  onTrackPress?: () => void;
}

export const LiveTruckCard: React.FC<LiveTruckCardProps> = ({
  gpsData,
  onTrackPress,
}) => {
  // If no GPS journey or delivery is not active/published, render empty/unavailable status per CP-02 Section 19
  if (!gpsData || gpsData.isPublished === false || !gpsData.status || gpsData.status === 'IDLE' || gpsData.status === 'COMPLETED') {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <View style={styles.emptyTitleRow}>
          <TruckIcon size={16} color="#64748B" />
          <Text style={styles.emptyTitleText}>No Delivery In Progress</Text>
        </View>
        <Text style={styles.emptySubtext}>Fresh catch delivery schedules will appear here when live.</Text>
      </View>
    );
  }

  const truckNumberStr = gpsData.truckNumber ? `#${gpsData.truckNumber}` : 'Fresh Delivery';
  const originStr = gpsData.origin || 'Supply Hub';
  const destStr = gpsData.destination || 'Local Cold Hub';
  const etaMinsStr = gpsData.etaMins ? `${gpsData.etaMins} mins` : 'In transit';

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithDot}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.truckTitleText}>
            Fresh Catch Truck {truckNumberStr} Published Live
          </Text>
        </View>

        <View style={styles.etaBadge}>
          <Text style={styles.etaBadgeText}>ETA {etaMinsStr}</Text>
        </View>
      </View>

      {/* Middle En Route Box */}
      <View style={styles.innerBox}>
        <View style={styles.truckIconCircle}>
          <TruckIcon size={18} color="#FFFFFF" />
        </View>

        <View style={styles.routeDetailsColumn}>
          <Text style={styles.routeStatusText}>Departed {originStr} • En route</Text>
          <Text style={styles.destinationText}>Destination: {destStr}</Text>
        </View>

        <TouchableOpacity style={styles.trackButton} onPress={onTrackPress} activeOpacity={0.8}>
          <Text style={styles.trackButtonText}>Track Live ↗</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Info Row */}
      <View style={styles.footerRow}>
        <View style={styles.coldChainContainer}>
          <ShieldCheckIcon size={14} color="#34D399" />
          <Text style={styles.coldChainText}>Continuous 0-4°C Cold Chain Assured</Text>
        </View>

        <Text style={styles.gpsSyncText}>GPS Live Sync</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F294A',
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
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    padding: 12,
  },
  emptyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 8,
  },
  emptySubtext: {
    fontSize: 11,
    color: '#64748B',
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
  coldChainText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 6,
  },
  gpsSyncText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
