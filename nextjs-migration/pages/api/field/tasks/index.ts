import type { NextApiRequest, NextApiResponse } from 'next';
import type { FieldTask } from '../../../../src/modules/field-app/types/field-app.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // TODO: Replace with actual database query
      const mockTasks: FieldTask[] = [
        {
          id: 'TASK-001',
          title: 'Install Fiber Cable - Section A',
          description: 'Install 500m of fiber optic cable in Section A of the network',
          type: 'installation',
          priority: 'high',
          status: 'pending',
          assignedTo: 'TECH-001',
          technicianName: 'John Smith',
          location: {
            address: '123 Main St, Johannesburg',
            coordinates: { lat: -26.2041, lng: 28.0473 }
          },
          scheduledDate: new Date().toISOString(),
          estimatedDuration: 4,
          materials: [
            { name: 'Fiber Cable 12-core', quantity: '500m' },
            { name: 'Connectors SC/APC', quantity: '12 units' }
          ],
          syncStatus: 'synced',
          offline: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'TASK-002',
          title: 'Repair Junction Box - Site B',
          description: 'Repair damaged junction box and test connections',
          type: 'maintenance',
          priority: 'urgent',
          status: 'in_progress',
          assignedTo: 'TECH-002',
          technicianName: 'Jane Doe',
          location: {
            address: '456 Park Ave, Cape Town',
            coordinates: { lat: -33.9249, lng: 18.4241 }
          },
          scheduledDate: new Date().toISOString(),
          estimatedDuration: 2,
          materials: [
            { name: 'Junction Box', quantity: '1 unit' },
            { name: 'Cable Ties', quantity: '20 units' }
          ],
          syncStatus: 'synced',
          offline: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'TASK-003',
          title: 'Network Testing - Zone C',
          description: 'Perform comprehensive network testing and quality checks',
          type: 'inspection',
          priority: 'medium',
          status: 'pending',
          assignedTo: 'TECH-003',
          technicianName: 'Mike Johnson',
          location: {
            address: '789 Tech Road, Durban',
            coordinates: { lat: -29.8587, lng: 31.0218 }
          },
          scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          estimatedDuration: 3,
          materials: [],
          syncStatus: 'synced',
          offline: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      res.status(200).json({ 
        tasks: mockTasks,
        total: mockTasks.length 
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const newTask = req.body;
      // TODO: Validate and save to database
      
      res.status(201).json({ 
        message: 'Task created successfully',
        task: { ...newTask, id: `TASK-${Date.now()}` }
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}