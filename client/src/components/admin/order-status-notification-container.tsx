import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useOrderStatusSocket } from '@/hooks/use-order-status-socket';
import { OrderStatusNotification } from './order-status-notification';

export function OrderStatusNotificationContainer() {
  const { notifications, clearNotifications } = useOrderStatusSocket();
  const [, navigate] = useLocation();
  
  // Navigate to order details when notification is clicked
  const handleNotificationClick = (orderId: number) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  return (
    <OrderStatusNotification 
      notifications={notifications} 
      clearNotifications={clearNotifications}
      onNotificationClick={(notification) => handleNotificationClick(notification.orderId)}
    />
  );
}