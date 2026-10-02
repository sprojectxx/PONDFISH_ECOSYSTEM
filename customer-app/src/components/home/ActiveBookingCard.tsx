import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface ActiveBookingData {
  id: string;
  bookingCode: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  totalAmount: number;
  itemsSummary?: string;
  qrCodeData?: string;
}

interface ActiveBookingCardProps {
  booking?: ActiveBookingData | null;
  onViewBookingPress?: (bookingId: string) => void;
}

export const ActiveBookingCard: React.FC<ActiveBookingCardProps> = ({
  booking,
  onViewBookingPress,
}) => {
  if (!booking || booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
    return null;
  }

  const formattedDate = new Date(booking.expiresAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.statusBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusText}>{booking.status === 'CONFIRMED' ? 'Booking Confirmed' : 'Active Booking'}</Text>
        </View>
        <Text style={styles.codeText}>#{booking.bookingCode}</Text>
      </View>

      {/* Booking Main Info */}
      <View style={styles.contentRow}>
        <View style={styles.detailsCol}>
          <Text style={styles.itemsText}>{booking.itemsSummary || 'Fresh Fish Booking'}</Text>
          <Text style={styles.expiryText}>Valid until: {formattedDate}</Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onViewBookingPress && onViewBookingPress(booking.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>View Ticket / QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#10B981', // Fresh Green background
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  codeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsCol: {
    flex: 1,
    marginRight: 8,
  },
  itemsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  expiryText: {
    color: '#E0F2FE',
    fontSize: 11,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },
});
