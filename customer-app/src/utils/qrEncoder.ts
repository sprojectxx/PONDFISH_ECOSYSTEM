import QRCode from 'qrcode';

/**
 * Standards-compliant ISO/IEC 18004 QR Code Matrix Encoder Utility
 * Wraps official 'qrcode' library for byte mode encoding and Reed-Solomon error correction.
 */
export function generateQRCodeSymbol(data: string) {
  return QRCode.create(data, { errorCorrectionLevel: 'M' });
}
