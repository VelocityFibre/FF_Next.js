/**
 * Product-related types for suppliers
 */

export interface Product {
  id: string;
  supplierId: string;
  supplierName?: string;
  code: string;
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  category: ProductCategory;
  subCategory?: string;
  brand?: string;
  model?: string;
  unitOfMeasure: UnitOfMeasure;
  packSize?: number;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  specifications?: ProductSpecification;
  dimensions?: Dimensions;
  weight?: number; // in kg
  color?: string;
  material?: string;
  warranty?: {
    period: number; // in months
    terms: string;
  };
  pricing: {
    unitPrice: number;
    currency: Currency;
    vatInclusive: boolean;
    vatRate?: number;
    bulkPricing?: BulkPricing[];
    volumeDiscounts?: VolumeDiscount[];
    validFrom?: Date | string;
    validTo?: Date | string;
  };
  availability: ProductAvailability;
  leadTime?: number; // in days
  stockLevel?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  alternatives?: string[]; // product IDs
  relatedProducts?: string[]; // product IDs
  tags?: string[];
  images?: string[];
  documents?: string[];
  certifications?: string[];
  hazardous?: boolean;
  hazardClass?: string;
  shelfLife?: number; // in days
  storageRequirements?: string;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface ProductSpecification {
  [key: string]: string | number | boolean;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'mm' | 'cm' | 'm' | 'in' | 'ft';
}

export interface BulkPricing {
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
  discountPercentage?: number;
}

export interface VolumeDiscount {
  threshold: number;
  discountPercentage: number;
  description?: string;
}

export interface CategoryDiscount {
  category: ProductCategory;
  discountPercentage: number;
  validFrom?: Date | string;
  validTo?: Date | string;
}

export interface PriceList {
  id: string;
  supplierId: string;
  name: string;
  description?: string;
  effectiveDate: Date | string;
  expiryDate?: Date | string;
  currency: Currency;
  items: PriceListItem[];
  discounts?: {
    volume?: VolumeDiscount[];
    category?: CategoryDiscount[];
    promotional?: {
      code: string;
      description: string;
      discountPercentage: number;
      validFrom: Date | string;
      validTo: Date | string;
    }[];
  };
  terms?: string;
  notes?: string;
  status: 'draft' | 'active' | 'expired' | 'superseded';
  version?: string;
  previousVersionId?: string;
  approvedBy?: string;
  approvedDate?: Date | string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface PriceListItem {
  productId: string;
  productCode: string;
  productName: string;
  unitPrice: number;
  previousPrice?: number;
  priceChange?: number;
  priceChangePercentage?: number;
  minQuantity?: number;
  leadTime?: number;
  notes?: string;
}

// Product Form Data
export interface ProductFormData {
  supplierId: string;
  code: string;
  name: string;
  description?: string;
  category: ProductCategory;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number;
  currency: Currency;
  vatInclusive: boolean;
  availability: ProductAvailability;
  minimumOrderQuantity?: number;
  leadTime?: number;
}

// Enums
export enum ProductCategory {
  FIBER_CABLE = 'fiber_cable',
  CONNECTORS = 'connectors',
  ENCLOSURES = 'enclosures',
  TOOLS = 'tools',
  TEST_EQUIPMENT = 'test_equipment',
  SAFETY_GEAR = 'safety_gear',
  CONSUMABLES = 'consumables',
  NETWORK_EQUIPMENT = 'network_equipment',
  POWER = 'power',
  DUCTING = 'ducting',
  POLES = 'poles',
  HARDWARE = 'hardware',
  OTHER = 'other'
}

export enum ProductAvailability {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  ON_ORDER = 'on_order',
  DISCONTINUED = 'discontinued',
  SEASONAL = 'seasonal',
  CUSTOM_ORDER = 'custom_order'
}

export enum UnitOfMeasure {
  EACH = 'each',
  METER = 'meter',
  KILOMETER = 'kilometer',
  ROLL = 'roll',
  BOX = 'box',
  PACK = 'pack',
  SET = 'set',
  KILOGRAM = 'kilogram',
  TON = 'ton',
  LITER = 'liter',
  HOUR = 'hour',
  DAY = 'day',
  SQUARE_METER = 'square_meter',
  CUBIC_METER = 'cubic_meter',
  OTHER = 'other'
}