import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { OrderStatusUpdate } from '@/components/admin/order-status-notification';
import { useToast } from '@/hooks/use-toast';

export function useOrderStatusSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<OrderStatusUpdate[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Function to establish websocket connection
  const connectWebSocket = useCallback(() => {
    if (!user || !['admin', 'kitchen'].includes(user.role)) return;
    
    // Close existing connection if any
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    
    try {
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        
        // Send authentication message
        socket.send(JSON.stringify({
          type: 'auth',
          userId: user.id,
          role: user.role,
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'orderStatusUpdate') {
            setNotifications(prev => [data.payload, ...prev]);
            
            // Show toast notification
            toast({
              title: `Order #${data.payload.orderNumber} Updated`,
              description: `Status changed to ${data.payload.status}`,
              variant: 'default',
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };
    } catch (err) {
      console.error('Error establishing WebSocket connection:', err);
    }
  }, [user, toast]);
  
  // Connect when component mounts or user changes
  useEffect(() => {
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);
  
  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  return { notifications, clearNotifications };
}