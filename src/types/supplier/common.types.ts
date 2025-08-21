/**
 * Common types shared across supplier modules
 */

export enum Currency {
  ZAR = 'ZAR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  OTHER = 'OTHER'
}

export enum PaymentTerms {
  CASH = 'cash',
  NET_7 = 'net_7',
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  COD = 'cod',
  PREPAID = 'prepaid',
  CUSTOM = 'custom'
}

export enum UnitOfMeasure {
  EACH = 'each',
  PIECE = 'piece',
  METER = 'meter',
  KILOMETER = 'kilometer',
  KILOGRAM = 'kilogram',
  TON = 'ton',
  LITER = 'liter',
  BOX = 'box',
  PACK = 'pack',
  ROLL = 'roll',
  SET = 'set',
  PAIR = 'pair',
  DOZEN = 'dozen',
  HOUR = 'hour',
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
  SQUARE_METER = 'square_meter',
  CUBIC_METER = 'cubic_meter',
  OTHER = 'other'
}

export enum ProductCategory {
  FIBER_CABLE = 'fiber_cable',
  CONNECTORS = 'connectors',
  ENCLOSURES = 'enclosures',
  SPLICING = 'splicing',
  TESTING = 'testing',
  TOOLS = 'tools',
  TEST_EQUIPMENT = 'test_equipment',
  SAFETY = 'safety',
  SAFETY_GEAR = 'safety_gear',
  CONSUMABLES = 'consumables',
  ELECTRONICS = 'electronics',
  NETWORK_EQUIPMENT = 'network_equipment',
  SOFTWARE = 'software',
  SERVICES = 'services',
  POWER = 'power',
  DUCTING = 'ducting',
  POLES = 'poles',
  POLES_INFRASTRUCTURE = 'poles_infrastructure', // Added for SuppliersPage
  HARDWARE = 'hardware',
  SPLICING_EQUIPMENT = 'splicing_equipment', // Added for SuppliersPage
  TESTING_TOOLS = 'testing_tools', // Added for SuppliersPage
  SAFETY_EQUIPMENT = 'safety_equipment', // Added for SuppliersPage
  OTHER = 'other'
}