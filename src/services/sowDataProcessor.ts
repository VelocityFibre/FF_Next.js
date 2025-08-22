import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { NeonPoleData, NeonDropData, NeonFibreData } from './neonSOWService';

export class SOWDataProcessor {
  // Process uploaded file (Excel or CSV)
  async processFile(file: File, type: 'poles' | 'drops' | 'fibre'): Promise<any[]> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      return this.processCSV(file, type);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      return this.processExcel(file, type);
    } else {
      throw new Error('Unsupported file format. Please upload Excel (.xlsx, .xls) or CSV files.');
    }
  }

  // Process CSV file
  private async processCSV(file: File, _type: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parseResult = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        if (parseResult.errors.length > 0) {
          console.warn('CSV parsing warnings:', parseResult.errors);
        }
        resolve(parseResult.data);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  // Process Excel file
  private async processExcel(file: File, _type: string): Promise<any[]> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false 
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      dateNF: 'yyyy-mm-dd'
    });
    
    return data;
  }

  // Process Lawley-style poles data
  processPoles(rawData: any[]): NeonPoleData[] {
    const processedPoles: NeonPoleData[] = [];
    
    for (const row of rawData) {
      // Extract primary pole information from label_1
      const poleNumber = this.extractValue(row, ['label_1', 'label', 'pole_number', 'pole_id']);
      
      if (!poleNumber) continue;
      
      const pole: NeonPoleData = {
        pole_number: poleNumber,
        latitude: this.extractNumber(row, ['lat', 'latitude', 'y', 'coord_y']) || undefined,
        longitude: this.extractNumber(row, ['lon', 'longitude', 'lng', 'x', 'coord_x']) || undefined,
        status: this.extractValue(row, ['status', 'pole_status']) || 'planned',
        pole_type: this.extractValue(row, ['type_1', 'type', 'pole_type']),
        pole_spec: this.extractValue(row, ['spec_1', 'spec', 'specification']),
        height: this.extractValue(row, ['dim1', 'height', 'pole_height']),
        diameter: this.extractValue(row, ['dim2', 'diameter', 'pole_diameter']),
        owner: this.extractValue(row, ['cmpownr', 'owner', 'company_owner']),
        pon_no: this.extractNumber(row, ['pon_no', 'pon', 'pon_number']),
        zone_no: this.extractNumber(row, ['zone_no', 'zone', 'zone_number']),
        address: this.extractValue(row, ['address', 'location', 'pole_address']),
        municipality: this.extractValue(row, ['mun', 'municipality', 'city']),
        created_date: this.extractDate(row, ['datecrtd', 'created_date', 'date_created']),
        created_by: this.extractValue(row, ['crtdby', 'created_by', 'creator']),
        comments: this.extractValue(row, ['comments', 'notes', 'remarks']),
        raw_data: row // Store original data for reference
      };
      
      processedPoles.push(pole);
    }
    
    return processedPoles;
  }

  // Process Lawley-style drops data
  processDrops(rawData: any[]): NeonDropData[] {
    const processedDrops: NeonDropData[] = [];
    
    for (const row of rawData) {
      const dropNumber = this.extractValue(row, ['label', 'drop_number', 'drop_id', 'drop_label']);
      
      if (!dropNumber) continue;
      
      const drop: NeonDropData = {
        drop_number: dropNumber,
        pole_number: this.extractValue(row, ['strtfeat', 'start_feature', 'pole_number', 'from_pole']) || '',
        cable_type: this.extractValue(row, ['type', 'cable_type']),
        cable_spec: this.extractValue(row, ['spec', 'specification', 'cable_spec']),
        cable_length: this.extractValue(row, ['dim2', 'length', 'cable_length', 'distance']),
        cable_capacity: this.extractValue(row, ['cblcpty', 'capacity', 'cable_capacity']),
        start_point: this.extractValue(row, ['strtfeat', 'start_feature', 'from']),
        end_point: this.extractValue(row, ['endfeat', 'end_feature', 'to']),
        latitude: this.extractNumber(row, ['lat', 'latitude', 'y']),
        longitude: this.extractNumber(row, ['lon', 'longitude', 'lng', 'x']),
        address: this.extractValue(row, ['address', 'location', 'drop_address']),
        pon_no: this.extractNumber(row, ['pon_no', 'pon', 'pon_number']),
        zone_no: this.extractNumber(row, ['zone_no', 'zone', 'zone_number']),
        municipality: this.extractValue(row, ['mun', 'municipality', 'city']),
        created_date: this.extractDate(row, ['datecrtd', 'created_date', 'date_created']),
        created_by: this.extractValue(row, ['crtdby', 'created_by', 'creator']),
        raw_data: row
      };
      
      processedDrops.push(drop);
    }
    
    return processedDrops;
  }

  // Process Lawley-style fibre data
  processFibre(rawData: any[]): NeonFibreData[] {
    const processedFibre: NeonFibreData[] = [];
    
    for (const row of rawData) {
      const segmentId = this.extractValue(row, ['label', 'segment_id', 'fibre_id', 'cable_id']);
      
      if (!segmentId) continue;
      
      const fibre: NeonFibreData = {
        segment_id: segmentId,
        cable_size: this.extractValue(row, ['cable size', 'cable_size', 'size', 'capacity']) || '',
        layer: this.extractValue(row, ['layer', 'cable_layer', 'type']) || '',
        length: this.extractNumber(row, ['length', 'distance', 'cable_length']) || 0,
        pon_no: this.extractNumber(row, ['pon_no', 'pon', 'pon_number']),
        zone_no: this.extractNumber(row, ['zone_no', 'zone', 'zone_number']),
        string_completed: this.extractNumber(row, ['String Com', 'string_completed', 'completed_length']),
        date_completed: this.extractDate(row, ['Date Comp', 'date_completed', 'completion_date']),
        contractor: this.extractValue(row, ['Contractor', 'contractor', 'contractor_name']),
        is_complete: this.parseBoolean(row, ['Complete', 'is_complete', 'completed']),
        raw_data: row
      };
      
      processedFibre.push(fibre);
    }
    
    return processedFibre;
  }

  // Helper function to extract value from multiple possible column names
  private extractValue(row: Record<string, unknown>, possibleKeys: string[]): string | undefined {
    for (const key of possibleKeys) {
      // Try exact match
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return String(row[key]).trim();
      }
      
      // Try case-insensitive match
      const foundKey = Object.keys(row).find(k => 
        k.toLowerCase() === key.toLowerCase()
      );
      
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
        return String(row[foundKey]).trim();
      }
    }
    return undefined;
  }

  // Helper function to extract number
  private extractNumber(row: Record<string, unknown>, possibleKeys: string[]): number | undefined {
    const value = this.extractValue(row, possibleKeys);
    if (value) {
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  }

  // Helper function to extract date
  private extractDate(row: Record<string, unknown>, possibleKeys: string[]): string | undefined {
    const value = this.extractValue(row, possibleKeys);
    if (value) {
      try {
        // Handle various date formats
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch (e) {
        console.warn('Failed to parse date:', value);
      }
    }
    return undefined;
  }

  // Helper function to parse boolean
  private parseBoolean(row: Record<string, unknown>, possibleKeys: string[]): boolean | undefined {
    const value = this.extractValue(row, possibleKeys);
    if (value) {
      const lowerValue = value.toLowerCase();
      if (['yes', 'true', '1', 'complete', 'completed'].includes(lowerValue)) {
        return true;
      } else if (['no', 'false', '0', 'incomplete', 'pending'].includes(lowerValue)) {
        return false;
      }
    }
    return undefined;
  }

  // Validate poles data
  validatePoles(poles: NeonPoleData[]): { valid: NeonPoleData[], invalid: any[], errors: string[] } {
    const valid: NeonPoleData[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];
    const seenPoleNumbers = new Set<string>();
    
    for (const pole of poles) {
      const poleErrors: string[] = [];
      
      // Check required fields
      if (!pole.pole_number) {
        poleErrors.push('Missing pole number');
      } else if (seenPoleNumbers.has(pole.pole_number)) {
        poleErrors.push(`Duplicate pole number: ${pole.pole_number}`);
      } else {
        seenPoleNumbers.add(pole.pole_number);
      }
      
      // Validate coordinates
      if (pole.latitude !== undefined && (pole.latitude < -90 || pole.latitude > 90)) {
        poleErrors.push(`Invalid latitude: ${pole.latitude}`);
      }
      if (pole.longitude !== undefined && (pole.longitude < -180 || pole.longitude > 180)) {
        poleErrors.push(`Invalid longitude: ${pole.longitude}`);
      }
      
      if (poleErrors.length === 0) {
        valid.push(pole);
      } else {
        invalid.push({ ...pole, errors: poleErrors });
        errors.push(`Pole ${pole.pole_number}: ${poleErrors.join(', ')}`);
      }
    }
    
    return { valid, invalid, errors };
  }

  // Validate drops data
  validateDrops(drops: NeonDropData[]): { valid: NeonDropData[], invalid: any[], errors: string[] } {
    const valid: NeonDropData[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];
    const seenDropNumbers = new Set<string>();
    
    for (const drop of drops) {
      const dropErrors: string[] = [];
      
      // Check required fields
      if (!drop.drop_number) {
        dropErrors.push('Missing drop number');
      } else if (seenDropNumbers.has(drop.drop_number)) {
        dropErrors.push(`Duplicate drop number: ${drop.drop_number}`);
      } else {
        seenDropNumbers.add(drop.drop_number);
      }
      
      // Warning for missing pole assignment (not an error)
      if (!drop.pole_number) {
        console.warn(`Drop ${drop.drop_number} has no pole assignment`);
      }
      
      if (dropErrors.length === 0) {
        valid.push(drop);
      } else {
        invalid.push({ ...drop, errors: dropErrors });
        errors.push(`Drop ${drop.drop_number}: ${dropErrors.join(', ')}`);
      }
    }
    
    return { valid, invalid, errors };
  }

  // Validate fibre data
  validateFibre(fibres: NeonFibreData[]): { valid: NeonFibreData[], invalid: any[], errors: string[] } {
    const valid: NeonFibreData[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];
    const seenSegmentIds = new Set<string>();
    
    for (const fibre of fibres) {
      const fibreErrors: string[] = [];
      
      // Check required fields
      if (!fibre.segment_id) {
        fibreErrors.push('Missing segment ID');
      } else if (seenSegmentIds.has(fibre.segment_id)) {
        fibreErrors.push(`Duplicate segment ID: ${fibre.segment_id}`);
      } else {
        seenSegmentIds.add(fibre.segment_id);
      }
      
      // Validate length
      if (fibre.length !== undefined && fibre.length < 0) {
        fibreErrors.push(`Invalid length: ${fibre.length}`);
      }
      
      if (fibreErrors.length === 0) {
        valid.push(fibre);
      } else {
        invalid.push({ ...fibre, errors: fibreErrors });
        errors.push(`Segment ${fibre.segment_id}: ${fibreErrors.join(', ')}`);
      }
    }
    
    return { valid, invalid, errors };
  }
}

export const sowDataProcessor = new SOWDataProcessor();