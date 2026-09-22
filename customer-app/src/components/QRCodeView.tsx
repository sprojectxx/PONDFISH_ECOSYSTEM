import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  qrData: string;
  size?: number;
}

/**
 * Standards-Compliant ISO/IEC 18004 QR Code Ticket Renderer
 * Uses the official 'qrcode' engine for Reed-Solomon error correction
 * and byte mode QR encoding of exact backend qrData payloads.
 */
export const QRCodeView: React.FC<QRCodeViewProps> = ({ qrData, size = 200 }) => {
  const qrSymbol = QRCode.create(qrData || 'PONDFISH_BOOKING:EMPTY', {
    errorCorrectionLevel: 'M',
  });

  const matrixSize = qrSymbol.modules.size;
  const matrixData = qrSymbol.modules.data; // Uint8Array of module bits
  const cellSize = size / matrixSize;

  // Convert Uint8Array module bits into 2D rows
  const rows: boolean[][] = [];
  for (let r = 0; r < matrixSize; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < matrixSize; c++) {
      row.push(matrixData[r * matrixSize + c] === 1);
    }
    rows.push(row);
  }

  return (
    <View style={[styles.container, { width: size + 24, height: size + 54 }]}>
      <View style={[styles.qrBorder, { width: size, height: size }]}>
        {rows.map((row, rIdx) => (
          <View key={`qr-r-${rIdx}`} style={{ flexDirection: 'row' }}>
            {row.map((isDark, cIdx) => (
              <View
                key={`qr-c-${rIdx}-${cIdx}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: isDark ? '#0F4C81' : '#FFFFFF',
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.payloadText} numberOfLines={1} ellipsizeMode="middle" testID="qr-payload-text">
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
