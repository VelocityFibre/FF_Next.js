/**
 * WebSocket API Route
 * Handles WebSocket connections for real-time updates
 */

import { NextApiRequest } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { Socket } from 'net';
import { neon } from '@neondatabase/serverless';
import pg from 'pg';

const { Pool } = pg;

interface ExtendedSocket extends Socket {
  server: NetServer & {
    io?: SocketIOServer;
  };
}

interface ExtendedNextApiResponse {
  socket: ExtendedSocket;
}

// Database connection for LISTEN/NOTIFY
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Neon client for queries
const sql = neon(process.env.DATABASE_URL || '');

// Keep track of active subscriptions
const subscriptions = new Map<string, Set<string>>();

export default async function handler(
  req: NextApiRequest,
  res: ExtendedNextApiResponse
) {
  if (req.method !== 'GET') {
    res.socket.server.io = undefined;
    return;
  }

  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    const io = new SocketIOServer(res.socket.server as any, {
      path: '/api/ws',
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : 'http://localhost:3005',
        methods: ['GET', 'POST']
      }
    });

    res.socket.server.io = io;

    // Set up PostgreSQL LISTEN client
    const listenClient = await pool.connect();
    
    // Listen to database changes
    await listenClient.query('LISTEN project_changes');
    await listenClient.query('LISTEN client_changes');
    await listenClient.query('LISTEN staff_changes');
    await listenClient.query('LISTEN procurement_changes');
    await listenClient.query('LISTEN sow_changes');

    // Handle PostgreSQL notifications
    listenClient.on('notification', (msg) => {
      if (msg.payload) {
        try {
          const payload = JSON.parse(msg.payload);
          const event = {
            type: 'event',
            eventType: payload.operation,
            entityType: payload.table_name.replace('_changes', ''),
            entityId: payload.id,
            data: payload.data,
            timestamp: new Date().toISOString()
          };

          // Broadcast to all connected clients
          io.emit('db_change', event);

          // Emit to specific rooms
          const entityRoom = `${event.entityType}:*`;
          const specificRoom = `${event.entityType}:${event.entityId}`;
          
          io.to(entityRoom).emit('entity_change', event);
          io.to(specificRoom).emit('entity_change', event);
        } catch (error) {
          console.error('Error parsing notification payload:', error);
        }
      }
    });

    // Handle Socket.IO connections
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle subscriptions
      socket.on('subscribe', async (data) => {
        const { entityType, entityId } = data;
        const room = `${entityType}:${entityId}`;
        
        socket.join(room);
        
        if (!subscriptions.has(room)) {
          subscriptions.set(room, new Set());
        }
        subscriptions.get(room)!.add(socket.id);

        // Send current state if subscribing to specific entity
        if (entityId !== '*') {
          try {
            const result = await sql`
              SELECT * FROM ${sql(entityType === 'client' ? 'clients' : entityType === 'staff' ? 'staff' : 'projects')}
              WHERE id = ${entityId}
            `;
            
            if (result.length > 0) {
              socket.emit('initial_data', {
                entityType,
                entityId,
                data: result[0]
              });
            }
          } catch (error) {
            console.error('Error fetching initial data:', error);
          }
        }
      });

      // Handle unsubscriptions
      socket.on('unsubscribe', (data) => {
        const { entityType, entityId } = data;
        const room = `${entityType}:${entityId}`;
        
        socket.leave(room);
        
        const roomSubs = subscriptions.get(room);
        if (roomSubs) {
          roomSubs.delete(socket.id);
          if (roomSubs.size === 0) {
            subscriptions.delete(room);
          }
        }
      });

      // Handle ping/pong for heartbeat
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Clean up subscriptions
        subscriptions.forEach((subs, room) => {
          subs.delete(socket.id);
          if (subs.size === 0) {
            subscriptions.delete(room);
          }
        });
      });

      // Handle custom events (for manual triggers)
      socket.on('broadcast_change', async (data) => {
        // Verify permission (you might want to add authentication here)
        const event = {
          type: 'event',
          eventType: data.eventType,
          entityType: data.entityType,
          entityId: data.entityId,
          data: data.data,
          timestamp: new Date().toISOString()
        };

        // Broadcast to relevant rooms
        const entityRoom = `${event.entityType}:*`;
        const specificRoom = `${event.entityType}:${event.entityId}`;
        
        io.to(entityRoom).emit('entity_change', event);
        io.to(specificRoom).emit('entity_change', event);
      });
    });

    console.log('Socket.IO server initialized');
  }

  res.socket.end();
}