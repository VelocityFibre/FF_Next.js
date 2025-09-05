import type { NextApiRequest, NextApiResponse } from 'next';
import type { FieldTask } from '../../../../src/modules/field-app/types/field-app.types';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { tasks, users, projects } from '../../../../src/lib/neon/schema/core.schema';
import { eq, and, desc, sql, or, isNull } from 'drizzle-orm';

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
      const { technicianId, status, priority } = req.query;
      
      // Build query conditions
      const conditions = [];
      if (technicianId) conditions.push(eq(tasks.assignedTo, technicianId as string));
      if (status) conditions.push(eq(tasks.status, status as string));
      if (priority) conditions.push(eq(tasks.priority, priority as string));
      
      // Query real tasks from database with user and project joins
      const taskData = await db
        .select({
          task: tasks,
          assignedUser: users,
          project: projects,
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.assignedTo, users.id))
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(tasks.priority), desc(tasks.createdAt))
        .limit(100);
      
      // Transform data to match FieldTask format
      const transformedTasks: FieldTask[] = taskData.map(({ task, assignedUser, project }) => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        type: task.category as 'installation' | 'maintenance' | 'inspection' || 'installation',
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
        status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled' || 'pending',
        assignedTo: task.assignedTo || '',
        technicianName: assignedUser ? `${assignedUser.firstName || ''} ${assignedUser.lastName || ''}`.trim() : 'Unassigned',
        location: {
          address: project?.location || 'No address specified',
          coordinates: project?.latitude && project?.longitude ? {
            lat: Number(project.latitude),
            lng: Number(project.longitude)
          } : { lat: -26.2041, lng: 28.0473 } // Default to Johannesburg
        },
        scheduledDate: task.startDate?.toISOString() || task.dueDate?.toISOString() || new Date().toISOString(),
        estimatedDuration: task.estimatedHours ? Number(task.estimatedHours) : 4,
        materials: Array.isArray(task.metadata) ? task.metadata : [],
        syncStatus: 'synced' as const,
        offline: false,
        createdAt: task.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: task.updatedAt?.toISOString() || new Date().toISOString(),
      }));
      
      // Add statistics
      const stats = {
        totalTasks: transformedTasks.length,
        pendingTasks: transformedTasks.filter(t => t.status === 'pending').length,
        inProgressTasks: transformedTasks.filter(t => t.status === 'in_progress').length,
        completedTasks: transformedTasks.filter(t => t.status === 'completed').length,
        highPriorityTasks: transformedTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      };

      res.status(200).json({ 
        tasks: transformedTasks,
        total: transformedTasks.length,
        stats 
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const newTask = req.body;
      
      // Generate task code if not provided
      const taskCode = newTask.taskCode || `TASK-${Date.now().toString().slice(-8)}`;
      
      // Insert new task into database
      const [insertedTask] = await db
        .insert(tasks)
        .values({
          ...newTask,
          taskCode,
          title: newTask.title,
          description: newTask.description || '',
          status: newTask.status || 'pending',
          priority: newTask.priority || 'medium',
        })
        .returning();
      
      res.status(201).json({ 
        message: 'Task created successfully',
        task: insertedTask
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}