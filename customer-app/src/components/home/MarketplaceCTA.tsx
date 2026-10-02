import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MarketplaceCTAProps {
  onPress?: () => void;
}

export const MarketplaceCTA: React.FC<MarketplaceCTAProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Show More Fishes in Marketplace →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#F0F9FF',
    borderColor: '#7DD3FC',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '800',
  },
});
