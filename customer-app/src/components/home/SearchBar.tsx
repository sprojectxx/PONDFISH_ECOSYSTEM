import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSearchPress?: () => void;
  onMicPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearchPress,
  onMicPress,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Search Lens Icon */}
        <TouchableOpacity onPress={onSearchPress} style={styles.iconBox} activeOpacity={0.7}>
          <Text style={styles.searchIconText}>🔍</Text>
        </TouchableOpacity>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder='Search "fresh pomfret, rohu, prawns"'
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
        />

        {/* Mic Icon */}
        <TouchableOpacity onPress={onMicPress} style={styles.iconBox} activeOpacity={0.7}>
          <Text style={styles.micIconText}>🎙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginTop: -16, // Overlay effect on dark header
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#38BDF8', // Cyan-blue outline matching Figma
    height: 46,
    paddingHorizontal: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    fontSize: 16,
    color: '#64748B',
  },
  micIconText: {
    fontSize: 16,
    color: '#64748B',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingHorizontal: 8,
    fontWeight: '500',
  },
});
