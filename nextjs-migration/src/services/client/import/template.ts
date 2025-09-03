import * as XLSX from 'xlsx';

/**
 * Get import template as Blob
 */
export function getImportTemplate(): Blob {
  const templateData = [
    {
      name: 'Example Client',
      code: 'CLI001',
      email: 'client@example.com',
      phone: '+27123456789',
      status: 'ACTIVE',
      category: 'BUSINESS',
      priority: 'HIGH',
      website: 'https://example.com',
      'registration Number': 'REG123456',
      'vat Number': 'VAT123456',
      'tax Number': 'TAX123456',
      'physical Address': '123 Main Street',
      'physical City': 'Johannesburg',
      'physical Province': 'Gauteng',
      'physical Postal Code': '2000',
      'physical Country': 'South Africa',
      'postal Address': 'PO Box 123',
      'postal City': 'Johannesburg',
      'postal Province': 'Gauteng',
      'postal Postal Code': '2001',
      'postal Country': 'South Africa',
      'billing Address': '123 Main Street',
      'billing City': 'Johannesburg',
      'billing Province': 'Gauteng',
      'billing Postal Code': '2000',
      'billing Country': 'South Africa',
      'contact First Name': 'John',
      'contact Last Name': 'Doe',
      'contact Email': 'john@example.com',
      'contact Phone': '+27123456789',
      'contact Position': 'Manager',
      'contact Preferred Method': 'EMAIL',
      'payment Terms': 'NET_30',
      'credit Limit': '100000',
      'credit Rating': 'GOOD',
      services: 'INSTALLATION,MAINTENANCE',
      tags: 'premium,vip',
      notes: 'Important client'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}