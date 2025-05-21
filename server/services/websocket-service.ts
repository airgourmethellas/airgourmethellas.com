import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from '../storage';

// Extend WebSocket to include user information and heartbeat
interface WebSocketClient extends WebSocket {
  userId?: number;
  role?: string;
  isAlive: boolean;
}

// Order status update object structure
export interface OrderStatusUpdate {
  orderId: number;
  orderNumber: string;
  status: string;
  previousStatus: string;
  timestamp: string;
  updatedBy: {
    id: number;
    name: string;
  };
}

// Connected clients for broadcasting messages
const clients = new Set<WebSocketClient>();

/**
 * Set up WebSocket server
 */
export function setupWebSocketServer(httpServer: Server) {
  console.log('[WebSocket] Setting up WebSocket server on path /ws');
  
  // Create WebSocket server on the same HTTP server but with a specific path
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  // Set up a heartbeat interval to detect dead connections
  const heartbeatInterval = setInterval(() => {
    clients.forEach(client => {
      if (client.isAlive === false) {
        client.terminate();
        clients.delete(client);
        return;
      }
      
      client.isAlive = false;
      client.ping();
    });
  }, 30000);
  
  // Handle connection cleanup when server closes
  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });
  
  // Handle new WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    const client = ws as WebSocketClient;
    client.isAlive = true;
    
    // Add pong listener to mark connection as alive
    client.on('pong', () => {
      client.isAlive = true;
    });
    
    // Handle incoming messages
    client.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle authentication message
        if (data.type === 'auth') {
          client.userId = data.userId;
          client.role = data.role;
          
          // Only allow admin and kitchen staff to connect
          if (['admin', 'kitchen'].includes(data.role)) {
            clients.add(client);
            console.log(`[WebSocket] Client authenticated: ${data.userId} (${data.role})`);
            
            // Send confirmation
            client.send(JSON.stringify({
              type: 'authConfirmed',
              userId: data.userId,
              role: data.role
            }));
          } else {
            // Unauthorized role
            client.send(JSON.stringify({
              type: 'error',
              message: 'Unauthorized role'
            }));
            client.close();
          }
        }
      } catch (err) {
        console.error('[WebSocket] Error processing message:', err);
      }
    });
    
    // Handle disconnection
    client.on('close', () => {
      clients.delete(client);
    });
    
    // Handle errors
    client.on('error', (error) => {
      console.error('[WebSocket] Client error:', error);
      clients.delete(client);
    });
  });
  
  return wss;
}

/**
 * Broadcast order status update to all connected admin and kitchen staff clients
 */
export function broadcastOrderStatusUpdate(orderId: number, status: string, statusHistory: any[]) {
  const message = JSON.stringify({
    type: 'orderStatusUpdate',
    orderId,
    status,
    statusHistory,
    timestamp: new Date().toISOString()
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Get the count of connected clients
 */
export function getConnectedClientCount() {
  return clients.size;
}