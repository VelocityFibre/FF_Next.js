/**
 * Contractor Query Builders for Neon PostgreSQL
 * Builds and executes database queries for contractors
 */

import { neonDb } from '@/lib/neon/connection';
import { contractors } from '@/lib/neon/schema/contractor.schema';
import { eq, and, or, like, desc, asc, count, isNotNull } from 'drizzle-orm';
import type { ContractorFilter } from '@/types/contractor.types';

/**
 * Query contractors with filters
 */
export async function queryContractorsWithFilters(filter?: ContractorFilter) {
  const conditions = [];
  
  // Always filter active contractors unless explicitly requested
  if (filter?.includeInactive !== true) {
    conditions.push(eq(contractors.isActive, true));
  }
  
  // Search by company name or contact person
  if (filter?.search) {
    conditions.push(
      or(
        like(contractors.companyName, `%${filter.search}%`),
        like(contractors.contactPerson, `%${filter.search}%`),
        like(contractors.email, `%${filter.search}%`)
      )
    );
  }
  
  // Filter by status
  if (filter?.status) {
    if (Array.isArray(filter.status)) {
      conditions.push(or(...filter.status.map(s => eq(contractors.status, s))));
    } else {
      conditions.push(eq(contractors.status, filter.status));
    }
  }
  
  // Filter by business type
  if (filter?.businessType) {
    if (Array.isArray(filter.businessType)) {
      conditions.push(or(...filter.businessType.map(bt => eq(contractors.businessType, bt))));
    } else {
      conditions.push(eq(contractors.businessType, filter.businessType));
    }
  }
  
  // Filter by province
  if (filter?.province) {
    if (Array.isArray(filter.province)) {
      conditions.push(or(...filter.province.map(p => eq(contractors.province, p))));
    } else {
      conditions.push(eq(contractors.province, filter.province));
    }
  }
  
  // Filter by compliance status
  if (filter?.complianceStatus) {
    if (Array.isArray(filter.complianceStatus)) {
      conditions.push(or(...filter.complianceStatus.map(cs => eq(contractors.complianceStatus, cs))));
    } else {
      conditions.push(eq(contractors.complianceStatus, filter.complianceStatus));
    }
  }
  
  // Filter by RAG overall rating
  if (filter?.ragOverall) {
    if (Array.isArray(filter.ragOverall)) {
      conditions.push(or(...filter.ragOverall.map(r => eq(contractors.ragOverall, r))));
    } else {
      conditions.push(eq(contractors.ragOverall, filter.ragOverall));
    }
  }
  
  // Build the base query
  let query = neonDb.select().from(contractors);
  
  // Apply all conditions
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  // Apply sorting
  if (filter?.sortBy) {
    const column = contractors[filter.sortBy as keyof typeof contractors];
    if (column) {
      query = query.orderBy(
        filter.sortOrder === 'desc' ? desc(column) : asc(column)
      );
    }
  } else {
    // Default sort by company name
    query = query.orderBy(asc(contractors.companyName));
  }
  
  // Apply pagination
  if (filter?.limit) {
    query = query.limit(filter.limit);
  }
  
  if (filter?.offset) {
    query = query.offset(filter.offset);
  }
  
  return await query;
}

/**
 * Query contractor by ID
 */
export async function queryContractorById(id: string) {
  return await neonDb
    .select()
    .from(contractors)
    .where(eq(contractors.id, id));
}

/**
 * Query active contractors for dropdowns
 */
export async function queryActiveContractors() {
  return await neonDb
    .select({
      id: contractors.id,
      companyName: contractors.companyName,
      contactPerson: contractors.contactPerson,
      status: contractors.status
    })
    .from(contractors)
    .where(
      and(
        eq(contractors.isActive, true),
        eq(contractors.status, 'approved')
      )
    )
    .orderBy(asc(contractors.companyName));
}

/**
 * Query contractor statistics
 */
export async function queryContractorStats() {
  const result = await neonDb
    .select({
      totalContractors: count(),
      activeContractors: count(contractors.isActive),
    })
    .from(contractors);
    
  return result[0];
}

/**
 * Query contractors by RAG status for performance analysis
 */
export async function queryContractorsByRAG() {
  return await neonDb
    .select({
      ragOverall: contractors.ragOverall,
      count: count()
    })
    .from(contractors)
    .where(eq(contractors.isActive, true))
    .groupBy(contractors.ragOverall);
}

/**
 * Query contractors by business type
 */
export async function queryContractorsByBusinessType() {
  return await neonDb
    .select({
      businessType: contractors.businessType,
      count: count()
    })
    .from(contractors)
    .where(eq(contractors.isActive, true))
    .groupBy(contractors.businessType);
}

/**
 * Query contractors by province
 */
export async function queryContractorsByProvince() {
  return await neonDb
    .select({
      province: contractors.province,
      count: count()
    })
    .from(contractors)
    .where(and(
      eq(contractors.isActive, true),
      isNotNull(contractors.province)
    ))
    .groupBy(contractors.province);
}