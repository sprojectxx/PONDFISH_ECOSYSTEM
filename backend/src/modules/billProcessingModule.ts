import { prisma } from '../prismaClient';
import { BillStatus } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

export interface OCRExtractedData {
  billNumber?: string;
  items: Array<{ name: string; quantityKg: number; unitPrice: number; subtotal: number }>;
  totalAmount: number;
  confidenceScore: number;
  rawText: string;
}

export interface IOCRAdapter {
  extractBillData(imageUrl: string): Promise<OCRExtractedData>;
}

export class MockOCRAdapter implements IOCRAdapter {
  async extractBillData(imageUrl: string): Promise<OCRExtractedData> {
    // Simulated OCR Extraction Response
    return {
      billNumber: 'BILL-' + Math.floor(100000 + Math.random() * 900000),
      items: [
        { name: 'Fresh Live Rohu', quantityKg: 2.0, unitPrice: 240.0, subtotal: 480.0 },
      ],
      totalAmount: 480.0,
      confidenceScore: 0.92, // 92% confidence (Passing threshold)
      rawText: 'PONDFISH STORE RECEIPT\nBILL: BILL-123456\nROHU 2KG @ 240 = 480\nTOTAL: 480',
    };
  }
}

export class BillProcessingModule {
  private static ocrAdapter: IOCRAdapter = new MockOCRAdapter();

  static setOCRAdapter(adapter: IOCRAdapter) {
    this.ocrAdapter = adapter;
  }

  static async scanBill(customerId: string, imageUrl: string) {
    // Perform OCR extraction via adapter
    const extractedData = await this.ocrAdapter.extractBillData(imageUrl);

    // If confidence score below 85% (0.85), flag low confidence
    const requiresManualEntry = extractedData.confidenceScore < 0.85 || !extractedData.billNumber;

    const bill = await prisma.bill.create({
      data: {
        customerId,
        billNumber: extractedData.billNumber || null,
        imageUrl,
        extractedText: extractedData.rawText,
        aiConfidenceScore: extractedData.confidenceScore,
        status: requiresManualEntry ? BillStatus.PENDING : BillStatus.EXTRACTED,
      },
    });

    await prisma.aIExtractionLog.create({
      data: {
        billId: bill.id,
        rawResponse: JSON.stringify(extractedData),
        confidenceScore: extractedData.confidenceScore,
        extractionDuration: 250, // ms
      },
    });

    if (requiresManualEntry) {
      throw new DomainError(
        'ERR_AI_CONFIDENCE_LOW',
        'AI OCR confidence low. Manual Bill ID entry is required before processing transaction.',
        422,
        [{ billId: bill.id, confidenceScore: extractedData.confidenceScore }]
      );
    }

    // Check for double-claim
    if (extractedData.billNumber) {
      const existingBill = await prisma.bill.findFirst({
        where: {
          billNumber: extractedData.billNumber,
          id: { not: bill.id },
          status: { in: [BillStatus.PROCESSED, BillStatus.MANUALLY_VERIFIED] },
        },
      });

      if (existingBill) {
        await prisma.bill.update({ where: { id: bill.id }, data: { status: BillStatus.REJECTED } });
        throw new DomainError('ERR_BILL_DOUBLE_CLAIM', 'This Bill ID has already been scanned and processed previously.', 409);
      }
    }

    return { bill, extractedData };
  }

  static async verifyManualBillId(billId: string, manualBillId: string) {
    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) {
      throw new DomainError('ERR_BILL_NOT_FOUND', 'Scanned bill record not found.', 404);
    }

    // Double-claim check on manual Bill ID
    const existingBill = await prisma.bill.findFirst({
      where: {
        manualBillId,
        id: { not: bill.id },
        status: { in: [BillStatus.PROCESSED, BillStatus.MANUALLY_VERIFIED] },
      },
    });

    if (existingBill) {
      throw new DomainError('ERR_BILL_DOUBLE_CLAIM', 'Manual Bill ID has already been claimed and processed.', 409);
    }

    return await prisma.bill.update({
      where: { id: bill.id },
      data: {
        manualBillId,
        status: BillStatus.MANUALLY_VERIFIED,
      },
    });
  }
}
