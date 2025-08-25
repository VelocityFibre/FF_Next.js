/**
 * Validation Core
 * Main validation service combining all validation modules
 */

import { FieldValidator } from './fieldValidator';
import { BasicRules } from './basicRules';
import { FormatRules } from './formatRules';
import { DateRules } from './dateRules';
import { ValidationUtilities } from './utilities';
import type { ValidationRule } from './types';

export class ValidationCore extends FieldValidator {
  private basicRules = new BasicRules();
  private formatRules = new FormatRules();
  private dateRules = new DateRules();
  private utilities = new ValidationUtilities();

  // Basic validation rules
  required = <T>(message?: string) => this.basicRules.required<T>(message);
  length = (min?: number, max?: number, message?: string) => this.basicRules.length(min, max, message);
  numeric = (message?: string) => this.basicRules.numeric(message);
  range = (min?: number, max?: number, message?: string) => this.basicRules.range(min, max, message);
  custom = <T>(validator: (value: T) => boolean | string, name: string, message?: string) => 
    this.basicRules.custom(validator, name, message);

  // Format validation rules
  email = (message?: string) => this.formatRules.email(message);
  phone = (message?: string) => this.formatRules.phone(message);
  url = (message?: string) => this.formatRules.url(message);
  password = (message?: string) => this.formatRules.password(message);

  // Date validation rules
  date = (message?: string) => this.dateRules.date(message);
  dateRange = (min?: Date, max?: Date, message?: string) => this.dateRules.dateRange(min, max, message);
  when = <T>(condition: (data: T) => boolean, rules: ValidationRule<T>[]) => 
    this.dateRules.when(condition, rules);

  // Utility methods
  sanitize = (value: string) => this.utilities.sanitize(value);
  isEmpty = (value: unknown) => this.utilities.isEmpty(value);
  formatErrors = (errors: string[]) => this.utilities.formatErrors(errors);
}