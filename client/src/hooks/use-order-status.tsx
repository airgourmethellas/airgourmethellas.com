import { useState, useEffect, useRef, useCallback } from 'react';
import { OrderStatus, OrderStatusHistory } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

interface OrderStatusState {
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useOrderStatus(orderId: number) {
  const [state, setState] = useState<OrderStatusState>({
    status: 'pending',
    statusHistory: [],
    isLoading: true,
    error: null,
    lastUpdated: null
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Initial fetch of order status
  const fetchOrderStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await fetch(`/api/orders/${orderId}/status-history`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order status: ${response.status}`);
      }
      
      const data = await response.json();
      setState({
        status: data.currentStatus,
        statusHistory: data.statusHistory || [],
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error fetching order status:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch order status' 
      }));
    }
  }, [orderId]);

  // Set up WebSocket connection for real-time updates
  const setupWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      // Determine the correct protocol (ws/wss)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        
        // Subscribe to order updates
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'subscribe',
            entity: 'order',
            id: orderId
          }));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'orderStatusUpdate' && data.orderId === orderId) {
            setState(prev => ({
              ...prev,
              status: data.status,
              statusHistory: data.statusHistory || prev.statusHistory,
              lastUpdated: new Date()
            }));
            
            // Show a toast notification for status updates
            toast({
              title: t('notifications.orderStatusUpdated'),
              description: t('notifications.statusChangedTo', { status: data.status }),
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected, scheduling reconnect...');
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          setupWebSocket();
        }, 5000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        
        // Close the connection on error to trigger the onclose handler
        wsRef.current?.close();
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      
      // Schedule reconnect attempt
      reconnectTimeoutRef.current = setTimeout(() => {
        setupWebSocket();
      }, 5000);
    }
  }, [orderId, t, toast]);

  // Manual function to update local state without WebSocket
  const updateOrderStatus = useCallback((newStatus: OrderStatus) => {
    setState(prev => ({
      ...prev,
      status: newStatus,
      lastUpdated: new Date()
    }));
  }, []);

  // Initialize data and WebSocket connection
  useEffect(() => {
    fetchOrderStatus();
    setupWebSocket();
    
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [orderId, fetchOrderStatus, setupWebSocket]);

  return {
    ...state,
    refetch: fetchOrderStatus,
    updateOrderStatus
  };
}