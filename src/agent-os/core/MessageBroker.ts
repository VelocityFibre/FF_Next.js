/**
 * Message Broker - Inter-agent communication system
 * Handles message routing, queuing, and delivery between agents
 */

import { EventEmitter } from 'events';
import { CoordinationMessage, MessagePriority } from '../types/agent.types';
import { Logger } from '../utils/logger';

interface MessageQueue {
  agentId: string;
  messages: QueuedMessage[];
  processing: boolean;
  lastActivity: Date;
}

interface QueuedMessage {
  message: CoordinationMessage;
  retries: number;
  nextRetry?: Date;
  acknowledged: boolean;
}

export class MessageBroker extends EventEmitter {
  private queues: Map<string, MessageQueue> = new Map();
  private messageHandlers: Map<string, Set<(message: CoordinationMessage) => Promise<void>>> = new Map();
  private logger: Logger;
  private isRunning: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.logger = new Logger('MessageBroker');
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Message Broker...');
    
    this.isRunning = true;
    this.startMessageProcessing();
    
    this.logger.info('Message Broker initialized');
  }

  /**
   * Register an agent to receive messages
   */
  registerAgent(agentId: string): void {
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, {
        agentId,
        messages: [],
        processing: false,
        lastActivity: new Date()
      });
      
      this.logger.info(`Registered agent queue: ${agentId}`);
    }
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.queues.delete(agentId);
    this.messageHandlers.delete(agentId);
    
    this.logger.info(`Unregistered agent: ${agentId}`);
  }

  /**
   * Subscribe to messages for a specific agent
   */
  subscribe(agentId: string, handler: (message: CoordinationMessage) => Promise<void>): void {
    if (!this.messageHandlers.has(agentId)) {
      this.messageHandlers.set(agentId, new Set());
    }
    
    this.messageHandlers.get(agentId)!.add(handler);
    this.registerAgent(agentId);
    
    this.logger.debug(`Added message handler for agent: ${agentId}`);
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribe(agentId: string, handler: (message: CoordinationMessage) => Promise<void>): void {
    const handlers = this.messageHandlers.get(agentId);
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.messageHandlers.delete(agentId);
      }
    }
  }

  /**
   * Send a message to a specific agent
   */
  async sendMessage(fromAgentId: string, toAgentId: string, message: CoordinationMessage): Promise<void> {
    // Ensure the message has the correct routing info
    message.fromAgentId = fromAgentId;
    message.toAgentId = toAgentId;
    message.timestamp = new Date();

    if (!message.id) {
      message.id = this.generateMessageId();
    }

    const queue = this.queues.get(toAgentId);
    if (!queue) {
      this.logger.error(`No queue found for agent: ${toAgentId}`);
      throw new Error(`Agent not registered: ${toAgentId}`);
    }

    const queuedMessage: QueuedMessage = {
      message,
      retries: 0,
      acknowledged: false
    };

    // Insert message based on priority
    this.insertMessageByPriority(queue.messages, queuedMessage);

    this.logger.debug(`Queued message ${message.id} for agent ${toAgentId}`);
    this.emit('message:queued', { message, toAgentId });
  }

  /**
   * Broadcast a message to all registered agents
   */
  async broadcastMessage(fromAgentId: string, message: CoordinationMessage): Promise<void> {
    message.fromAgentId = fromAgentId;
    message.timestamp = new Date();

    if (!message.id) {
      message.id = this.generateMessageId();
    }

    const agentIds = Array.from(this.queues.keys()).filter(id => id !== fromAgentId);
    
    const promises = agentIds.map(agentId => {
      const broadcastMessage = { ...message, toAgentId: agentId };
      return this.sendMessage(fromAgentId, agentId, broadcastMessage);
    });

    await Promise.all(promises);
    
    this.logger.info(`Broadcast message ${message.id} to ${agentIds.length} agents`);
    this.emit('message:broadcast', { message, recipients: agentIds });
  }

  /**
   * Get pending messages for an agent
   */
  getPendingMessages(agentId: string): CoordinationMessage[] {
    const queue = this.queues.get(agentId);
    if (!queue) return [];

    return queue.messages
      .filter(qm => !qm.acknowledged)
      .map(qm => qm.message);
  }

  /**
   * Acknowledge message receipt
   */
  acknowledgeMessage(agentId: string, messageId: string): void {
    const queue = this.queues.get(agentId);
    if (!queue) return;

    const queuedMessage = queue.messages.find(qm => qm.message.id === messageId);
    if (queuedMessage) {
      queuedMessage.acknowledged = true;
      
      this.logger.debug(`Message ${messageId} acknowledged by ${agentId}`);
      this.emit('message:acknowledged', { messageId, agentId });
    }
  }

  /**
   * Get broker statistics
   */
  getStatistics(): {
    totalQueues: number;
    totalMessages: number;
    messagesPerAgent: Record<string, number>;
    processingRate: number;
  } {
    const totalMessages = Array.from(this.queues.values())
      .reduce((sum, queue) => sum + queue.messages.length, 0);

    const messagesPerAgent: Record<string, number> = {};
    for (const [agentId, queue] of this.queues) {
      messagesPerAgent[agentId] = queue.messages.length;
    }

    return {
      totalQueues: this.queues.size,
      totalMessages,
      messagesPerAgent,
      processingRate: 0 // TODO: Calculate actual processing rate
    };
  }

  /**
   * Shutdown the message broker
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Message Broker...');
    
    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Wait for any ongoing message processing to complete
    const processingQueues = Array.from(this.queues.values())
      .filter(queue => queue.processing);

    if (processingQueues.length > 0) {
      this.logger.info(`Waiting for ${processingQueues.length} queues to finish processing...`);
      // Give time for processing to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.queues.clear();
    this.messageHandlers.clear();

    this.logger.info('Message Broker shutdown complete');
  }

  // Private methods

  private startMessageProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processQueues();
    }, 1000); // Process every second
  }

  private async processQueues(): Promise<void> {
    if (!this.isRunning) return;

    for (const queue of this.queues.values()) {
      if (queue.processing) continue;

      const pendingMessage = queue.messages.find(qm => 
        !qm.acknowledged && (!qm.nextRetry || qm.nextRetry <= new Date())
      );

      if (pendingMessage) {
        await this.processMessage(queue, pendingMessage);
      }
    }
  }

  private async processMessage(queue: MessageQueue, queuedMessage: QueuedMessage): Promise<void> {
    queue.processing = true;
    queue.lastActivity = new Date();

    try {
      const handlers = this.messageHandlers.get(queue.agentId);
      if (handlers && handlers.size > 0) {
        // Execute all handlers for this agent
        const promises = Array.from(handlers).map(handler => 
          handler(queuedMessage.message).catch(error => {
            this.logger.error(`Handler error for message ${queuedMessage.message.id}:`, error);
            throw error;
          })
        );

        await Promise.all(promises);
        
        // Mark as acknowledged if processing succeeded
        queuedMessage.acknowledged = true;
        
        this.logger.debug(`Processed message ${queuedMessage.message.id} for ${queue.agentId}`);
        this.emit('message:processed', { message: queuedMessage.message, agentId: queue.agentId });

      } else {
        // No handlers registered, schedule retry
        this.scheduleRetry(queuedMessage);
      }

    } catch (error) {
      this.logger.error(`Failed to process message ${queuedMessage.message.id}:`, error);
      this.scheduleRetry(queuedMessage);
      
      this.emit('message:failed', { 
        message: queuedMessage.message, 
        agentId: queue.agentId, 
        error 
      });
    } finally {
      queue.processing = false;
    }
  }

  private scheduleRetry(queuedMessage: QueuedMessage): void {
    queuedMessage.retries++;
    
    const maxRetries = 3; // Default retry policy
    if (queuedMessage.retries >= maxRetries) {
      this.logger.warn(`Message ${queuedMessage.message.id} exceeded max retries, removing from queue`);
      // Remove from queue or mark as dead letter
      queuedMessage.acknowledged = true; // Prevent further processing
      return;
    }

    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, queuedMessage.retries), 30000);
    queuedMessage.nextRetry = new Date(Date.now() + delay);

    this.logger.debug(`Scheduled retry ${queuedMessage.retries} for message ${queuedMessage.message.id} in ${delay}ms`);
  }

  private insertMessageByPriority(messages: QueuedMessage[], newMessage: QueuedMessage): void {
    const priority = newMessage.message.priority || MessagePriority.NORMAL;
    
    // Find insertion point based on priority
    let insertIndex = messages.length;
    for (let i = 0; i < messages.length; i++) {
      const existingPriority = messages[i].message.priority || MessagePriority.NORMAL;
      if (priority > existingPriority) {
        insertIndex = i;
        break;
      }
    }

    messages.splice(insertIndex, 0, newMessage);
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
}