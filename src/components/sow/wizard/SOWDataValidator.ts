/**
 * SOW Upload Data Validation Logic
 */

import { ValidationResult } from './SOWWizardTypes';

export const validateStepData = (stepType: string, data: any[]): ValidationResult => {
  if (!data || data.length === 0) {
    return { isValid: false, error: 'File is empty or invalid format' };
  }

  switch (stepType) {
    case 'poles':
      return validatePolesData(data);
    case 'drops':
      return validateDropsData(data);
    case 'fibre':
      return validateFibreData(data);
    default:
      return { isValid: false, error: 'Unknown step type' };
  }
};

const validatePolesData = (data: any[]): ValidationResult => {
  const requiredFields = ['pole_number', 'latitude', 'longitude'];
  const firstRow = data[0];
  
  const missingFields = requiredFields.filter(field => 
    !Object.keys(firstRow).some(key => key.toLowerCase().includes(field.replace('_', '').toLowerCase()))
  );

  if (missingFields.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required columns for poles: ${missingFields.join(', ')}` 
    };
  }

  const processedData = data.map(row => ({
    pole_number: findColumnValue(row, ['pole_number', 'pole number', 'pole_id', 'pole id']),
    latitude: parseFloat(findColumnValue(row, ['latitude', 'lat', 'coord_lat'])) || 0,
    longitude: parseFloat(findColumnValue(row, ['longitude', 'lng', 'long', 'coord_lng'])) || 0,
    max_drops: parseInt(findColumnValue(row, ['max_drops', 'capacity', 'max_capacity'])) || 12,
    current_drops: 0,
    status: findColumnValue(row, ['status']) || 'planned'
  })).filter(item => item.pole_number);

  return { isValid: true, processedData };
};

const validateDropsData = (data: any[]): ValidationResult => {
  const requiredFields = ['drop_number', 'pole_number', 'address'];
  const firstRow = data[0];
  
  const missingFields = requiredFields.filter(field => 
    !Object.keys(firstRow).some(key => key.toLowerCase().includes(field.replace('_', '').toLowerCase()))
  );

  if (missingFields.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required columns for drops: ${missingFields.join(', ')}` 
    };
  }

  const processedData = data.map(row => ({
    drop_number: findColumnValue(row, ['drop_number', 'drop number', 'drop_id', 'drop id']),
    pole_number: findColumnValue(row, ['pole_number', 'pole number', 'pole_id', 'pole id']),
    address: findColumnValue(row, ['address', 'installation_address', 'location']),
    status: findColumnValue(row, ['status']) || 'planned'
  })).filter(item => item.drop_number);

  return { isValid: true, processedData };
};

const validateFibreData = (data: any[]): ValidationResult => {
  const requiredFields = ['segment_id', 'from_point', 'to_point', 'distance'];
  const firstRow = data[0];
  
  const missingFields = requiredFields.filter(field => 
    !Object.keys(firstRow).some(key => key.toLowerCase().includes(field.replace('_', '').toLowerCase()))
  );

  if (missingFields.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required columns for fibre: ${missingFields.join(', ')}` 
    };
  }

  const processedData = data.map(row => ({
    segment_id: findColumnValue(row, ['segment_id', 'segment id', 'cable_id', 'cable id']),
    from_point: findColumnValue(row, ['from_point', 'from point', 'start_point', 'start point']),
    to_point: findColumnValue(row, ['to_point', 'to point', 'end_point', 'end point']),
    distance: parseFloat(findColumnValue(row, ['distance', 'length', 'cable_length', 'metres', 'meters'])) || 0,
    cable_type: findColumnValue(row, ['cable_type', 'type']) || 'standard',
    status: findColumnValue(row, ['status']) || 'planned'
  })).filter(item => item.segment_id && item.distance > 0);

  return { isValid: true, processedData };
};

const findColumnValue = (row: any, possibleColumns: string[]): string => {
  for (const col of possibleColumns) {
    const key = Object.keys(row).find(k => 
      k.toLowerCase().replace(/[_\s]/g, '') === col.toLowerCase().replace(/[_\s]/g, '')
    );
    if (key && row[key] !== undefined && row[key] !== null) {
      return String(row[key]).trim();
    }
  }
  return '';
};

export const processStepData = async (projectId: string, stepType: string, data: any[]) => {
  // Here we would normally save to Neon database
  // For now, we'll store in localStorage for demo purposes
  const storageKey = `sow_${projectId}_${stepType}`;
  localStorage.setItem(storageKey, JSON.stringify({
    projectId,
    stepType,
    data,
    uploadedAt: new Date().toISOString()
  }));
};