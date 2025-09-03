import type { NextApiRequest, NextApiResponse } from 'next';
import type { FieldTechnician } from '../../../../src/modules/field-app/types/field-app.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // TODO: Replace with actual database query
      const mockTechnicians: FieldTechnician[] = [
        {
          id: 'TECH-001',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+27 82 123 4567',
          status: 'available',
          currentTask: null,
          location: {
            lat: -26.2041,
            lng: 28.0473
          },
          skills: ['Fiber Installation', 'Cable Splicing', 'Testing'],
          rating: 4.5,
          completedTasks: 127,
          activeTaskCount: 0,
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'TECH-002',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+27 82 234 5678',
          status: 'on_task',
          currentTask: 'TASK-002',
          location: {
            lat: -33.9249,
            lng: 18.4241
          },
          skills: ['Network Testing', 'Troubleshooting', 'Maintenance'],
          rating: 4.8,
          completedTasks: 203,
          activeTaskCount: 1,
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'TECH-003',
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phone: '+27 82 345 6789',
          status: 'on_break',
          currentTask: null,
          location: {
            lat: -29.8587,
            lng: 31.0218
          },
          skills: ['Installation', 'Quality Assurance', 'Documentation'],
          rating: 4.3,
          completedTasks: 95,
          activeTaskCount: 0,
          lastActive: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          createdAt: new Date().toISOString()
        },
        {
          id: 'TECH-004',
          name: 'Sarah Williams',
          email: 'sarah.williams@example.com',
          phone: '+27 82 456 7890',
          status: 'offline',
          currentTask: null,
          location: {
            lat: -26.1076,
            lng: 28.0567
          },
          skills: ['Fiber Optics', 'Project Management', 'Safety Compliance'],
          rating: 4.9,
          completedTasks: 312,
          activeTaskCount: 0,
          lastActive: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          createdAt: new Date().toISOString()
        }
      ];

      res.status(200).json({ 
        technicians: mockTechnicians,
        total: mockTechnicians.length,
        available: mockTechnicians.filter(t => t.status === 'available').length,
        onTask: mockTechnicians.filter(t => t.status === 'on_task').length
      });
    } catch (error) {
      console.error('Error fetching technicians:', error);
      res.status(500).json({ error: 'Failed to fetch technicians' });
    }
  } else if (req.method === 'POST') {
    try {
      const newTechnician = req.body;
      // TODO: Validate and save to database
      
      res.status(201).json({ 
        message: 'Technician added successfully',
        technician: { ...newTechnician, id: `TECH-${Date.now()}` }
      });
    } catch (error) {
      console.error('Error adding technician:', error);
      res.status(500).json({ error: 'Failed to add technician' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}