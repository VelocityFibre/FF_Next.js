/**
 * Staff Import Parsers
 * Utility functions for parsing import data
 */

import { Skill } from '@/types/staff/enums.types';

/**
 * Parse date from various formats
 */
export function parseDate(dateValue: any): Date | undefined {
  if (!dateValue) return undefined;
  
  // If already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a number (Excel serial date)
  if (typeof dateValue === 'number') {
    // Excel dates start from 1900-01-01
    const excelEpoch = new Date(1900, 0, 1);
    const msPerDay = 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + (dateValue - 2) * msPerDay);
  }
  
  // If it's a string
  if (typeof dateValue === 'string') {
    // Try parsing YYYY/MM/DD format (from your CSV)
    const yyyymmdd = dateValue.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (yyyymmdd) {
      const [, year, month, day] = yyyymmdd;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try parsing DD/MM/YYYY format
    const ddmmyyyy = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try parsing YYYY-MM-DD format
    const yyyymmdd2 = dateValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmdd2) {
      const [, year, month, day] = yyyymmdd2;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try standard date parsing
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return undefined;
}

/**
 * Parse enum value from string
 */
export function parseEnum<T>(value: string | undefined, enumValues: string[], defaultValue: T): T {
  if (!value) return defaultValue;
  
  const upperValue = value.toUpperCase().replace(/\s+/g, '_');
  
  for (const enumValue of enumValues) {
    if (enumValue.toUpperCase().replace(/\s+/g, '_') === upperValue) {
      return enumValue as T;
    }
  }
  
  return defaultValue;
}

/**
 * Parse skills from comma-separated string
 */
export function parseSkills(skillsString: string | undefined): Skill[] {
  if (!skillsString) return [];
  
  const skills: Skill[] = [];
  const skillsList = skillsString.split(',').map(s => s.trim());
  
  for (const skill of skillsList) {
    if (skill) {
      // Try to find matching skill enum value
      const matchingSkill = Object.values(Skill).find(
        enumSkill => enumSkill.toLowerCase().replace(/_/g, ' ') === skill.toLowerCase() ||
                     enumSkill.toLowerCase() === skill.toLowerCase()
      );
      
      if (matchingSkill) {
        skills.push(matchingSkill);
      }
    }
  }
  
  return skills;
}