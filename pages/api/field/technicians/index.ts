import type { NextApiRequest, NextApiResponse } from 'next';
import type { FieldTechnician } from '../../../../src/modules/field-app/types/field-app.types';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { staff, tasks, users } from '../../../../src/lib/neon/schema/core.schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

// Initialize database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jUJCNFiG38aY@ep-mute-brook-a99vppmn-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
const neonClient = neon(connectionString);
const db = drizzle(neonClient as any);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Query staff who are field technicians
      const technicianData = await db
        .select({
          staff: staff,
          user: users,
          activeTaskCount: sql<number>`(
            SELECT COUNT(*) FROM tasks 
            WHERE tasks.assigned_to = ${staff.userId}
            AND tasks.status IN ('pending', 'in_progress')
          )::int`,
          completedTaskCount: sql<number>`(
            SELECT COUNT(*) FROM tasks 
            WHERE tasks.assigned_to = ${staff.userId}
            AND tasks.status = 'completed'
          )::int`,
          currentTaskId: sql<string>`(
            SELECT id FROM tasks 
            WHERE tasks.assigned_to = ${staff.userId}
            AND tasks.status = 'in_progress'
            ORDER BY tasks.updated_at DESC
            LIMIT 1
          )`,
        })
        .from(staff)
        .leftJoin(users, eq(staff.userId, users.id))
        .where(
          or(
            eq(staff.department, 'Field Operations'),
            eq(staff.position, 'Field Technician'),
            eq(staff.position, 'Technician')
          )
        )
        .orderBy(desc(staff.updatedAt))
        .limit(50);
      
      // Transform data to match FieldTechnician format
      const transformedTechnicians: FieldTechnician[] = technicianData.map(({ staff: s, user, activeTaskCount, completedTaskCount, currentTaskId }) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        phone: s.phone || '+27 00 000 0000',
        status: determineStatus(s.status, activeTaskCount, currentTaskId),
        currentTask: currentTaskId || null,
        location: {
          lat: -26.2041, // Default location - could be enhanced with real GPS data
          lng: 28.0473
        },
        skills: Array.isArray(s.skills) ? s.skills : [],
        rating: s.performanceRating ? Number(s.performanceRating) : 4.0,
        completedTasks: completedTaskCount || 0,
        activeTaskCount: activeTaskCount || 0,
        lastActive: user?.lastLogin?.toISOString() || s.updatedAt?.toISOString() || new Date().toISOString(),
        createdAt: s.createdAt?.toISOString() || new Date().toISOString(),
      }));
      
      // Calculate statistics
      const stats = {
        total: transformedTechnicians.length,
        available: transformedTechnicians.filter(t => t.status === 'available').length,
        onTask: transformedTechnicians.filter(t => t.status === 'on_task').length,
        onBreak: transformedTechnicians.filter(t => t.status === 'on_break').length,
        offline: transformedTechnicians.filter(t => t.status === 'offline').length,
        avgRating: transformedTechnicians.reduce((sum, t) => sum + t.rating, 0) / (transformedTechnicians.length || 1),
      };

      res.status(200).json({ 
        technicians: transformedTechnicians,
        ...stats
      });
    } catch (error) {
      console.error('Error fetching technicians:', error);
      res.status(500).json({ error: 'Failed to fetch technicians' });
    }
  } else if (req.method === 'POST') {
    try {
      const newTechnician = req.body;
      
      // Generate employee ID if not provided
      const employeeId = newTechnician.employeeId || `TECH-${Date.now().toString().slice(-8)}`;
      
      // Insert new staff member as technician
      const [insertedStaff] = await db
        .insert(staff)
        .values({
          ...newTechnician,
          employeeId,
          firstName: newTechnician.firstName || newTechnician.name?.split(' ')[0] || '',
          lastName: newTechnician.lastName || newTechnician.name?.split(' ')[1] || '',
          email: newTechnician.email,
          phone: newTechnician.phone,
          department: 'Field Operations',
          position: 'Field Technician',
          status: 'active',
          contractType: 'full-time',
        })
        .returning();
      
      res.status(201).json({ 
        message: 'Technician added successfully',
        technician: insertedStaff
      });
    } catch (error) {
      console.error('Error adding technician:', error);
      res.status(500).json({ error: 'Failed to add technician' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Helper function to determine technician status
function determineStatus(
  staffStatus: string | null,
  activeTaskCount: number,
  currentTaskId: string | null
): 'available' | 'on_task' | 'on_break' | 'offline' {
  if (staffStatus === 'inactive' || staffStatus === 'terminated') return 'offline';
  if (currentTaskId) return 'on_task';
  if (activeTaskCount > 0) return 'on_task';
  if (staffStatus === 'on_leave') return 'on_break';
  return 'available';
}