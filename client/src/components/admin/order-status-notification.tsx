import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

interface OrderStatusNotificationProps {
  notifications: OrderStatusUpdate[];
  clearNotifications: () => void;
  onNotificationClick?: (notification: OrderStatusUpdate) => void;
}

export function OrderStatusNotification({ 
  notifications, 
  clearNotifications,
  onNotificationClick
}: OrderStatusNotificationProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const statusColors: Record<string, string> = {
    pending: "bg-orange-400",
    confirmed: "bg-blue-400",
    'in-progress': "bg-purple-400",
    prepared: "bg-yellow-400",
    'out-for-delivery': "bg-cyan-400",
    delivered: "bg-green-400",
    cancelled: "bg-red-400",
    'payment-pending': "bg-amber-400",
    'payment-completed': "bg-emerald-400"
  };
  
  // Helper to get a readable status name for display
  const getReadableStatus = (status: string) => {
    return t(`order.status.${status.replace('-', '')}`) || status;
  };
  
  // Format timestamp to localized string
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (notifications.length === 0) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center" 
            variant="destructive"
          >
            {notifications.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">{t('notifications.orderUpdates')}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={clearNotifications}
          >
            {t('notifications.clearAll')}
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification, idx) => (
            <div 
              key={`${notification.orderId}-${notification.timestamp}-${idx}`}
              className={cn(
                "p-3 hover:bg-gray-50 border-b last:border-b-0 transition-all",
                "animate-in fade-in slide-in-from-top-5 duration-300"
              )}
            >
              <Link href={`/admin/orders/${notification.orderId}`}>
                <div className="flex items-start space-x-3 cursor-pointer">
                  <div className={cn(
                    "w-2.5 h-2.5 mt-1.5 rounded-full animate-pulse",
                    statusColors[notification.status as keyof typeof statusColors] || "bg-gray-400"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {t('notifications.order')} #{notification.orderNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-gray-600">
                      {t('notifications.statusChangedFrom')} 
                      <span className="font-medium">{getReadableStatus(notification.previousStatus)}</span> 
                      {t('notifications.to')} 
                      <span className="font-medium">{getReadableStatus(notification.status)}</span>
                    </p>
                    <p className="text-xs mt-1 text-gray-500">
                      {t('notifications.updatedBy')}: {notification.updatedBy.name}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}