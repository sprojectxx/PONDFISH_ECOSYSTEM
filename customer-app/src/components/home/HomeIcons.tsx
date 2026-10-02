import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export const WalletIcon: React.FC<IconProps> = ({ size = 16, color = '#10B981' }) => (
  <View style={[styles.iconBase, { width: size, height: size * 0.75, borderColor: color, borderWidth: 1.5, borderRadius: 3 }]}>
    <View style={[{ width: size * 0.3, height: 2, backgroundColor: color, position: 'absolute', right: 1, top: size * 0.25 }]} />
  </View>
);

export const ProfileIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <View style={[styles.iconBase, { width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}>
    <View style={{ width: size * 0.45, height: size * 0.45, borderRadius: size * 0.225, borderWidth: 1.5, borderColor: color, marginBottom: 1 }} />
    <View style={{ width: size * 0.8, height: size * 0.35, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2, borderWidth: 1.5, borderColor: color, borderBottomWidth: 0 }} />
  </View>
);

export const MedalIcon: React.FC<IconProps> = ({ size = 18, color = '#D97706' }) => (
  <View style={[styles.iconBase, { width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}>
    <View style={{ width: size * 0.65, height: size * 0.65, borderRadius: size * 0.325, borderWidth: 1.5, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.35, color, fontWeight: '900' }}>★</Text>
    </View>
  </View>
);

export const TruckIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <View style={[styles.iconBase, { width: size, height: size * 0.7, flexDirection: 'row', alignItems: 'flex-end' }]}>
    <View style={{ width: size * 0.6, height: size * 0.55, backgroundColor: color, borderRadius: 2 }} />
    <View style={{ width: size * 0.35, height: size * 0.4, backgroundColor: color, borderTopRightRadius: 4, borderBottomRightRadius: 2, marginLeft: 1 }} />
  </View>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 14, color = '#34D399' }) => (
  <View style={[styles.iconBase, { width: size, height: size, borderRadius: size / 2, borderColor: color, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center' }]}>
    <Text style={{ color, fontSize: size * 0.6, fontWeight: '900' }}>✓</Text>
  </View>
);

export const FlameIcon: React.FC<IconProps> = ({ size = 16, color = '#EF4444' }) => (
  <View style={[styles.iconBase, { width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}>
    <View style={{ width: size * 0.6, height: size * 0.8, borderRadius: size * 0.3, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
  </View>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 14, color = '#EA580C' }) => (
  <View style={[styles.iconBase, { width: size, height: size, borderRadius: size / 2, borderColor: color, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center' }]}>
    <View style={{ width: 1, height: size * 0.3, backgroundColor: color, position: 'absolute', top: size * 0.2 }} />
    <View style={{ width: size * 0.25, height: 1, backgroundColor: color, position: 'absolute', right: size * 0.2 }} />
  </View>
);

export const FilterIcon: React.FC<IconProps> = ({ size = 16, color = '#0284C7' }) => (
  <View style={[styles.iconBase, { width: size, height: size, justifyContent: 'space-around', paddingVertical: 2 }]}>
    <View style={{ height: 1.5, backgroundColor: color, width: '100%' }} />
    <View style={{ height: 1.5, backgroundColor: color, width: '70%', alignSelf: 'center' }} />
    <View style={{ height: 1.5, backgroundColor: color, width: '40%', alignSelf: 'center' }} />
  </View>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <View style={[styles.iconBase, { width: size, height: size, alignItems: 'center' }]}>
    <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.45, borderRightWidth: size * 0.45, borderBottomWidth: size * 0.4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
    <View style={{ width: size * 0.7, height: size * 0.45, backgroundColor: color, marginTop: -1 }} />
  </View>
);

export const GpsIcon: React.FC<IconProps> = ({ size = 20, color = '#64748B' }) => (
  <View style={[styles.iconBase, { width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}>
    <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35, borderColor: color, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125, backgroundColor: color }} />
    </View>
  </View>
);

export const ScanQrIcon: React.FC<IconProps> = ({ size = 22, color = '#FFFFFF' }) => (
  <View style={[styles.iconBase, { width: size, height: size, borderColor: color, borderWidth: 2, borderRadius: 4, padding: 3, justifyContent: 'space-between' }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 4, height: 4, backgroundColor: color }} />
      <View style={{ width: 4, height: 4, backgroundColor: color }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 4, height: 4, backgroundColor: color }} />
      <View style={{ width: 4, height: 4, backgroundColor: color }} />
    </View>
  </View>
);

export const TagIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <View style={[styles.iconBase, { width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}>
    <View style={{ width: size * 0.7, height: size * 0.7, borderColor: color, borderWidth: 1.5, transform: [{ rotate: '45deg' }], borderRadius: 2 }} />
  </View>
);

export const StarIcon: React.FC<IconProps> = ({ size = 12, color = '#F59E0B' }) => (
  <Text style={{ fontSize: size, color, fontWeight: '900', lineHeight: size + 2 }}>★</Text>
);

export const FlashIcon: React.FC<IconProps> = ({ size = 12, color = '#10B981' }) => (
  <Text style={{ fontSize: size, color, fontWeight: '900', lineHeight: size + 2 }}>⚡</Text>
);

export const HeartIcon: React.FC<{ size?: number; active?: boolean }> = ({ size = 14, active = false }) => (
  <Text style={{ fontSize: size, color: active ? '#EF4444' : '#64748B', fontWeight: '900' }}>
    {active ? '♥' : '♡'}
  </Text>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 12, color = '#64748B' }) => (
  <Text style={{ fontSize: size, color, fontWeight: '700' }}>›</Text>
);

const styles = StyleSheet.create({
  iconBase: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
