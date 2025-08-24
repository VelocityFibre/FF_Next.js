/**
 * Formatter Core
 * Main formatter service combining all formatting modules
 */

import { NumberFormatter } from './numberFormatter';
import { DateFormatter } from './dateFormatter';
import { TextFormatter } from './textFormatter';
import { PhoneFormatter } from './phoneFormatter';
import type {
  CurrencyOptions,
  DateFormatOptions,
  NumberFormatOptions,
  AddressComponents,
  StatusType,
  PhoneFormat,
} from './types';

export class FormatterCore {
  private numberFormatter = new NumberFormatter();
  private dateFormatter = new DateFormatter();
  private textFormatter = new TextFormatter();
  private phoneFormatter = new PhoneFormatter();

  // Number formatting methods
  currency = (amount: number, options?: CurrencyOptions) => 
    this.numberFormatter.currency(amount, options);

  number = (value: number, options?: NumberFormatOptions) => 
    this.numberFormatter.number(value, options);

  percentage = (value: number, decimals?: number) => 
    this.numberFormatter.percentage(value, decimals);

  fileSize = (bytes: number) => 
    this.numberFormatter.fileSize(bytes);

  // Date formatting methods
  date = (date: Date | string, options?: DateFormatOptions) => 
    this.dateFormatter.date(date, options);

  time = (date: Date | string, includeSeconds?: boolean) => 
    this.dateFormatter.time(date, includeSeconds);

  relativeTime = (date: Date | string) => 
    this.dateFormatter.relativeTime(date);

  duration = (seconds: number) => 
    this.dateFormatter.duration(seconds);

  // Text formatting methods
  fullName = (firstName?: string, lastName?: string, middleName?: string) => 
    this.textFormatter.fullName(firstName, lastName, middleName);

  initials = (firstName?: string, lastName?: string) => 
    this.textFormatter.initials(firstName, lastName);

  truncate = (text: string, maxLength: number, suffix?: string) => 
    this.textFormatter.truncate(text, maxLength, suffix);

  capitalize = (text: string) => 
    this.textFormatter.capitalize(text);

  camelToTitle = (text: string) => 
    this.textFormatter.camelToTitle(text);

  cleanText = (text: string) => 
    this.textFormatter.cleanText(text);

  address = (address: AddressComponents) => 
    this.textFormatter.address(address);

  status = (status: string, type?: StatusType) => 
    this.textFormatter.status(status, type);

  json = (obj: unknown, indent?: number) => 
    this.textFormatter.json(obj, indent);

  url = (url: string) => 
    this.textFormatter.url(url);

  // Phone formatting methods
  phone = (phoneNumber: string, format?: PhoneFormat) => 
    this.phoneFormatter.phone(phoneNumber, format);
}