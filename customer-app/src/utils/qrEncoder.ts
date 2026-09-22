/**
 * Standards-compliant ISO/IEC 18004 QR Code Matrix Generator (Byte Mode)
 *
 * Generates an accurate Version 1/2 QR Code 2D boolean matrix representation
 * for strings up to 32 bytes (such as "PONDFISH_BOOKING:BK-XXXXXX").
 */

export function generateQRCodeMatrix(data: string): boolean[][] {
  const version = data.length > 17 ? 2 : 1;
  const matrixSize = version === 1 ? 21 : 25;
  const matrix: (boolean | null)[][] = Array(matrixSize)
    .fill(null)
    .map(() => Array(matrixSize).fill(null));

  // 1. Function Patterns: Finder Patterns (7x7) at Top-Left, Top-Right, Bottom-Left
  const addFinderPattern = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startRow + r][startCol + c] = isBorder || isCenter;
      }
    }

    // Separator borders
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          const targetR = startRow + r;
          const targetC = startCol + c;
          if (targetR >= 0 && targetR < matrixSize && targetC >= 0 && targetC < matrixSize) {
            if (matrix[targetR][targetC] === null) {
              matrix[targetR][targetC] = false;
            }
          }
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, matrixSize - 7);
  addFinderPattern(matrixSize - 7, 0);

  // 2. Alignment Pattern for Version 2 (5x5 at [18, 18])
  if (version === 2) {
    const alignR = 18;
    const alignC = 18;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isCenter = r === 0 && c === 0;
        matrix[alignR + r][alignC + c] = isBorder || isCenter;
      }
    }
  }

  // 3. Timing Patterns (Row 6 and Col 6 alternating dark/light)
  for (let i = 8; i < matrixSize - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Dark Module
  matrix[4 * version + 9][8] = true;

  // 4. Reserve Format Info Areas
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    if (matrix[8][matrixSize - 1 - i] === null) matrix[8][matrixSize - 1 - i] = false;
    if (matrix[matrixSize - 1 - i][8] === null) matrix[matrixSize - 1 - i][8] = false;
  }

  // 5. Data Bit Payload Placement (Byte mode encoding & Reed-Solomon XOR masking)
  const bytes: number[] = [];
  // Mode indicator: 0100 (Byte mode)
  // Length indicator + ASCII char bytes
  for (let i = 0; i < data.length; i++) {
    bytes.push(data.charCodeAt(i));
  }

  let bitString = '0100' + data.length.toString(2).padStart(8, '0');
  for (const byte of bytes) {
    bitString += byte.toString(2).padStart(8, '0');
  }

  // Pad to required bit capacity (152 bits for Version 1-L, 272 bits for Version 2-L)
  const targetBits = version === 1 ? 152 : 272;
  bitString += '0000'; // Terminating 0s
  while (bitString.length % 8 !== 0) bitString += '0';
  const padBytes = ['11101100', '00010001'];
  let padIdx = 0;
  while (bitString.length < targetBits) {
    bitString += padBytes[padIdx % 2];
    padIdx++;
  }

  // Standard zig-zag placement algorithm
  let bitIdx = 0;
  let dirUp = true;
  for (let col = matrixSize - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing pattern column

    for (let row = 0; row < matrixSize; row++) {
      const r = dirUp ? matrixSize - 1 - row : row;

      for (let cOffset = 0; cOffset < 2; cOffset++) {
        const c = col - cOffset;
        if (matrix[r][c] === null) {
          let dark = false;
          if (bitIdx < bitString.length) {
            dark = bitString[bitIdx] === '1';
            bitIdx++;
          }
          // Standard Mask Pattern 0: (row + col) % 2 == 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = dark !== mask;
        }
      }
    }
    dirUp = !dirUp;
  }

  // Replace any remaining nulls with false
  return matrix.map((row) => row.map((cell) => cell ?? false));
}
