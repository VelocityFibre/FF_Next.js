/**
 * SOW Data Validator - Main Validation Orchestrator
 * Coordinates validation of SOW data using validation rules
 */

import { NeonPoleData, NeonDropData, NeonFibreData } from '../../neonSOWService';
import { ValidationResult, ValidationError, CrossValidationResult } from './validator-types';
import { SOWValidationRules } from './validation-rules';
import { log } from '@/lib/logger';

/**
 * Main SOW data validator class
 */
export class SOWValidator {
  /**
   * Validate poles data
   */
  static validatePoles(poles: NeonPoleData[]): ValidationResult<NeonPoleData> {
    const valid: NeonPoleData[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];
    const seenPoleNumbers = new Set<string>();
    
    for (const pole of poles) {
      const poleErrors: ValidationError[] = [];
      
      // Validate pole number
      const poleNumberError = SOWValidationRules.validatePoleNumber(pole.pole_number);
      if (poleNumberError) {
        poleErrors.push(poleNumberError);
      } else if (seenPoleNumbers.has(pole.pole_number)) {
        poleErrors.push({
          field: 'pole_number',
          value: pole.pole_number,
          message: `Duplicate pole number: ${pole.pole_number}`,
          severity: 'error',
          code: 'DUPLICATE_POLE_NUMBER'
        });
      } else {
        seenPoleNumbers.add(pole.pole_number);
      }
      
      // Validate coordinates
      const coordinateErrors = SOWValidationRules.validateCoordinates(pole.latitude, pole.longitude);
      poleErrors.push(...coordinateErrors);
      
      // Validate pole type
      if (pole.pole_type && !SOWValidationRules.isValidPoleType(pole.pole_type)) {
        poleErrors.push({
          field: 'pole_type',
          value: pole.pole_type,
          message: `Invalid pole type: ${pole.pole_type}`,
          severity: 'error',
          code: 'INVALID_POLE_TYPE'
        });
      }
      
      // Validate status
      if (pole.status && !SOWValidationRules.isValidPoleStatus(pole.status)) {
        poleErrors.push({
          field: 'status',
          value: pole.status,
          message: `Invalid pole status: ${pole.status}`,
          severity: 'error',
          code: 'INVALID_POLE_STATUS'
        });
      }
      
      // Validate height
      const heightValue = pole.height ? parseFloat(pole.height) : undefined;
      const heightError = SOWValidationRules.validateHeight(isNaN(heightValue as number) ? undefined : heightValue);
      if (heightError) {
        poleErrors.push(heightError);
      }
      
      // Validate address
      const addressError = SOWValidationRules.validateAddress(pole.address);
      if (addressError) {
        poleErrors.push(addressError);
      }
      
      // Validate installation date
      const dateError = SOWValidationRules.validateInstallationDate(pole.installation_date);
      if (dateError) {
        poleErrors.push(dateError);
      }
      
      // Check data quality issues
      const qualityErrors = SOWValidationRules.checkDataQuality(pole);
      poleErrors.push(...qualityErrors);
      
      if (poleErrors.length === 0) {
        valid.push(pole);
      } else {
        invalid.push({ ...pole, errors: poleErrors });
        errors.push(...poleErrors.map(e => `Pole ${pole.pole_number}: ${e.message}`));
      }
    }
    
    return { valid, invalid, errors };
  }

  /**
   * Validate drops data
   */
  static validateDrops(drops: NeonDropData[]): ValidationResult<NeonDropData> {
    const valid: NeonDropData[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];
    const seenDropNumbers = new Set<string>();
    
    for (const drop of drops) {
      const dropErrors: ValidationError[] = [];
      
      // Validate drop ID/number
      const dropIdError = SOWValidationRules.validateDropId(drop.drop_number);
      if (dropIdError) {
        dropErrors.push(dropIdError);
      } else if (seenDropNumbers.has(drop.drop_number)) {
        dropErrors.push({
          field: 'drop_number',
          value: drop.drop_number,
          message: `Duplicate drop number: ${drop.drop_number}`,
          severity: 'error',
          code: 'DUPLICATE_DROP_NUMBER'
        });
      } else {
        seenDropNumbers.add(drop.drop_number);
      }
      
      // Validate coordinates
      const coordinateErrors = SOWValidationRules.validateCoordinates(drop.latitude, drop.longitude);
      dropErrors.push(...coordinateErrors);
      
      // Validate cable length
      if (drop.cable_length) {
        const length = parseFloat(drop.cable_length);
        if (!isNaN(length)) {
          const lengthError = SOWValidationRules.validateFibreLength(length);
          if (lengthError) {
            dropErrors.push(lengthError);
          }
        }
      }
      
      // Validate service type
      const serviceError = SOWValidationRules.validateServiceType(drop.service_type);
      if (serviceError) {
        dropErrors.push(serviceError);
      }
      
      // Validate address
      const addressError = SOWValidationRules.validateAddress(drop.address);
      if (addressError) {
        dropErrors.push(addressError);
      }
      
      // Check data quality issues
      const qualityErrors = SOWValidationRules.checkDataQuality(drop);
      dropErrors.push(...qualityErrors);
      
      // Warning for missing pole assignment (not an error)
      if (!drop.pole_number) {
        log.warn(`Drop ${drop.drop_number} has no pole assignment`, undefined, 'sow-validator');
      }
      
      if (dropErrors.length === 0) {
        valid.push(drop);
      } else {
        invalid.push({ ...drop, errors: dropErrors });
        errors.push(...dropErrors.map(e => `Drop ${drop.drop_number}: ${e.message}`));
      }
    }
    
    return { valid, invalid, errors };
  }

  /**
   * Validate fibre data
   */
  static validateFibre(fibres: NeonFibreData[]): ValidationResult<NeonFibreData> {
    const valid: NeonFibreData[] = [];
    const invalid: any[] = [];
    const errors: string[] = [];
    const seenSegmentIds = new Set<string>();
    
    for (const fibre of fibres) {
      const fibreErrors: ValidationError[] = [];
      
      // Check required fields
      if (!fibre.segment_id) {
        fibreErrors.push({
          field: 'segment_id',
          value: fibre.segment_id,
          message: 'Missing segment ID',
          severity: 'error',
          code: 'MISSING_SEGMENT_ID'
        });
      } else if (seenSegmentIds.has(fibre.segment_id)) {
        fibreErrors.push({
          field: 'segment_id',
          value: fibre.segment_id,
          message: `Duplicate segment ID: ${fibre.segment_id}`,
          severity: 'error',
          code: 'DUPLICATE_SEGMENT_ID'
        });
      } else {
        seenSegmentIds.add(fibre.segment_id);
      }
      
      // Validate length
      const lengthError = SOWValidationRules.validateFibreLength(fibre.length);
      if (lengthError) {
        fibreErrors.push(lengthError);
      }
      
      // Validate string completed length
      const stringCompletedError = SOWValidationRules.validateFibreLength(fibre.string_completed);
      if (stringCompletedError) {
        fibreErrors.push({
          ...stringCompletedError,
          field: 'string_completed',
          message: stringCompletedError.message.replace('fibre length', 'string completed length')
        });
      }
      
      // Check if string completed exceeds total length
      if (fibre.length !== undefined && 
          fibre.string_completed !== undefined && 
          fibre.string_completed > fibre.length) {
        fibreErrors.push({
          field: 'string_completed',
          value: { length: fibre.length, string_completed: fibre.string_completed },
          message: `String completed (${fibre.string_completed}) exceeds total length (${fibre.length})`,
          severity: 'error',
          code: 'STRING_EXCEEDS_LENGTH'
        });
      }
      
      // Validate fibre type
      const typeError = SOWValidationRules.validateFibreType(fibre.fibre_type);
      if (typeError) {
        fibreErrors.push(typeError);
      }
      
      // Validate completion date format
      const dateError = SOWValidationRules.validateInstallationDate(fibre.date_completed);
      if (dateError) {
        fibreErrors.push({
          ...dateError,
          field: 'date_completed'
        });
      }
      
      // Check data quality issues
      const qualityErrors = SOWValidationRules.checkDataQuality(fibre);
      fibreErrors.push(...qualityErrors);
      
      if (fibreErrors.length === 0) {
        valid.push(fibre);
      } else {
        invalid.push({ ...fibre, errors: fibreErrors });
        errors.push(...fibreErrors.map(e => `Segment ${fibre.segment_id}: ${e.message}`));
      }
    }
    
    return { valid, invalid, errors };
  }

  /**
   * Validate data based on type
   */
  static validateData(data: any[], type: 'poles' | 'drops' | 'fibre'): ValidationResult<any> {
    switch (type) {
      case 'poles':
        return this.validatePoles(data as NeonPoleData[]);
      case 'drops':
        return this.validateDrops(data as NeonDropData[]);
      case 'fibre':
        return this.validateFibre(data as NeonFibreData[]);
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }

  /**
   * Cross-validate data relationships
   */
  static crossValidateData(poles: NeonPoleData[], drops: NeonDropData[]): CrossValidationResult {
    const poleNumbers = new Set(poles.map(p => p.pole_number));
    const orphanedDrops: any[] = [];
    const missingPoles: string[] = [];
    const inconsistentReferences: Array<{
      dropId: string;
      poleNumber: string;
      issue: string;
    }> = [];
    
    let validReferences = 0;
    let invalidReferences = 0;
    
    // Check for drops referencing non-existent poles
    for (const drop of drops) {
      if (drop.pole_number) {
        if (poleNumbers.has(drop.pole_number)) {
          validReferences++;
        } else {
          invalidReferences++;
          orphanedDrops.push(drop);
          if (!missingPoles.includes(drop.pole_number)) {
            missingPoles.push(drop.pole_number);
          }
          inconsistentReferences.push({
            dropId: drop.drop_number,
            poleNumber: drop.pole_number,
            issue: 'References non-existent pole'
          });
        }
      }
    }
    
    const summary = {
      totalDrops: drops.length,
      validReferences,
      invalidReferences
    };
    
    return {
      orphanedDrops,
      missingPoles,
      inconsistentReferences,
      summary
    };
  }
}