/**
 * Staff Statistics Service
 * Functions for calculating staff statistics and summaries
 */

import { sql } from '@/lib/neon';
import { StaffSummary } from '@/types/staff.types';

/**
 * Get staff summary statistics
 */
export async function getStaffSummary(): Promise<StaffSummary> {
  try {
    const totalResult = await sql`SELECT COUNT(*) as count FROM staff`;
    const activeResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'ACTIVE'`;
    const inactiveResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'INACTIVE'`;
    const onLeaveResult = await sql`SELECT COUNT(*) as count FROM staff WHERE status = 'ON_LEAVE'`;
    
    // Get department breakdown
    const departmentResult = await sql`
      SELECT department, COUNT(*) as count 
      FROM staff 
      GROUP BY department
    `;
    
    const totalStaff = parseInt(totalResult[0].count);
    const activeStaff = parseInt(activeResult[0].count);
    const inactiveStaff = parseInt(inactiveResult[0].count);
    const onLeaveStaff = parseInt(onLeaveResult[0].count);
    
    // Calculate utilization rate (assuming active staff are utilized)
    const utilizationRate = totalStaff > 0 ? (activeStaff / totalStaff) * 100 : 0;
    
    // Build department breakdown
    const staffByDepartment: { [key: string]: number } = {};
    departmentResult.forEach((dept: any) => {
      staffByDepartment[dept.department] = parseInt(dept.count);
    });
    
    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      onLeaveStaff,
      availableStaff: activeStaff,
      monthlyGrowth: 0, // TODO: Calculate monthly growth
      averageProjectLoad: 0, // TODO: Calculate average project load
      staffByDepartment,
      staffByLevel: {}, // TODO: Get level breakdown
      staffBySkill: {}, // TODO: Get skill breakdown
      staffByContractType: {}, // TODO: Get contract type breakdown
      averageExperience: 0, // TODO: Calculate average experience
      utilizationRate,
      overallocatedStaff: 0, // TODO: Calculate overallocated staff
      underutilizedStaff: 0, // TODO: Calculate underutilized staff
      topPerformers: [], // TODO: Get top performers
      topSkills: [] // TODO: Get top skills
    };
  } catch (error) {
    console.error('Error fetching staff summary:', error);
    throw error;
  }
}