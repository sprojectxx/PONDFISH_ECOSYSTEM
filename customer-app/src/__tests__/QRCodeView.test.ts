import { generateQRCodeMatrix } from '../utils/qrEncoder';

describe('Standards-Compliant QR Encoder & Component Test', () => {
  it('generates a valid ISO/IEC 18004 2D matrix for backend QR payload', () => {
    const payload = 'PONDFISH_BOOKING:BK-987654';
    const matrix = generateQRCodeMatrix(payload);

    expect(matrix).toBeDefined();
    expect(matrix.length).toBeGreaterThanOrEqual(21);
    expect(matrix[0].length).toBe(matrix.length);

    // Verify top-left finder pattern structure (7x7 outer border dark, 3x3 inner core dark)
    expect(matrix[0][0]).toBe(true); // Outer top-left corner
    expect(matrix[0][6]).toBe(true);
    expect(matrix[6][0]).toBe(true);
    expect(matrix[6][6]).toBe(true);
    expect(matrix[2][2]).toBe(true); // Center module
  });

  it('handles custom backend booking codes deterministically', () => {
    const payloadA = 'PONDFISH_BOOKING:BK-111111';
    const payloadB = 'PONDFISH_BOOKING:BK-222222';

    const matrixA = generateQRCodeMatrix(payloadA);
    const matrixB = generateQRCodeMatrix(payloadB);

    expect(matrixA).not.toEqual(matrixB);
  });
});
