import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  isUnread?: boolean;
}

interface RecentNotificationsSectionProps {
  notifications?: NotificationItem[];
  onViewAllPress?: () => void;
}

export const RecentNotificationsSection: React.FC<RecentNotificationsSectionProps> = ({
  notifications = [],
  onViewAllPress,
}) => {
  if (!notifications || notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You're all caught up.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        <TouchableOpacity onPress={onViewAllPress} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {notifications.slice(0, 2).map((item) => (
        <View key={item.id} style={styles.notificationCard}>
          <View style={styles.titleRow}>
            {item.isUnread && <View style={styles.unreadDot} />}
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.timeText}>{item.timeAgo}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2463A8',
    marginRight: 6,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 6,
  },
  messageText: {
    fontSize: 11,
    color: '#64748B',
  },
  emptyContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
