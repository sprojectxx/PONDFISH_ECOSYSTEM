export type FreshnessState = 'GREEN' | 'GREY' | 'YELLOW' | 'RED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder?: number;
  active?: boolean;
}

export interface FishItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  unitPrice: number;
  physicalAvailable: boolean;
  onlineBookable: boolean;
  freshnessState: FreshnessState;
  categoryId: string;
  category?: Category;
}

export interface DiscountOffer {
  id: string;
  discountCode: string;
  title?: string;
  description?: string;
  discountPercent?: number;
  flatDiscountAmount?: number;
  startsAt: string;
  expiresAt: string;
  active: boolean;
  fishId?: string;
  fish?: FishItem;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
