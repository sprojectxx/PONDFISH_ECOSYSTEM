import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { generateQRCodeMatrix } from '../utils/qrEncoder';

interface QRCodeViewProps {
  qrData: string;
  size?: number;
}

/**
 * Standards-compliant ISO/IEC 18004 2D QR Code Ticket Renderer.
 * Encodes exact backend qrData string without fake hashing or hardcoded text.
 */
export const QRCodeView: React.FC<QRCodeViewProps> = ({ qrData, size = 200 }) => {
  const matrix = generateQRCodeMatrix(qrData);
  const matrixDimension = matrix.length;
  const cellSize = size / matrixDimension;

  return (
    <View style={[styles.container, { width: size + 24, height: size + 50 }]}>
      <View style={[styles.qrBorder, { width: size, height: size }]}>
        {matrix.map((row, rIdx) => (
          <View key={`qr-row-${rIdx}`} style={{ flexDirection: 'row' }}>
            {row.map((cell, cIdx) => (
              <View
                key={`qr-cell-${rIdx}-${cIdx}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell ? '#0F4C81' : '#FFFFFF',
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.payloadText} numberOfLines={1} ellipsizeMode="middle" testID="qr-data-payload">
        {qrData}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  qrBorder: {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  payloadText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F4C81',
    fontFamily: 'monospace',
  },
});
