import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface RecentTransactionData {
  id: string;
  billId?: string;
  amount: number;
  date: string;
  status: 'SUCCESS' | 'COMPLETED' | 'PENDING';
  itemsSummary?: string;
}

interface RecentTransactionCardProps {
  transaction?: RecentTransactionData | null;
  onViewTransactionPress?: (transactionId: string) => void;
}

export const RecentTransactionCard: React.FC<RecentTransactionCardProps> = ({
  transaction,
  onViewTransactionPress,
}) => {
  if (!transaction) return null;

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.titleText}>Recent Purchase</Text>
        <Text style={styles.dateText}>{transaction.date}</Text>
        {transaction.billId && <Text style={styles.billIdText}>Bill #{transaction.billId}</Text>}
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.amountText}>₹{transaction.amount}</Text>
        <TouchableOpacity
          onPress={() => onViewTransactionPress && onViewTransactionPress(transaction.id)}
          style={styles.viewButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewButtonText}>Receipt ↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  leftCol: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  billIdText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  viewButton: {
    marginTop: 4,
  },
  viewButtonText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '700',
  },
});
