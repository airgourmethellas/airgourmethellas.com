import React from 'react';
import { OrderStatus, OrderStatusHistory, orderStatusLabels, orderStatusSteps } from '@shared/schema';
import { cn } from '@/lib/utils';
import { 
  ClipboardCheck, 
  ThumbsUp, 
  ChefHat, 
  Utensils, 
  Package, 
  Truck, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  statusHistory?: OrderStatusHistory[];
  isLoading?: boolean;
  className?: string;
}

// Map of status to their corresponding icons
const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-5 w-5" />,
  confirmed: <ThumbsUp className="h-5 w-5" />,
  processing: <ClipboardCheck className="h-5 w-5" />,
  preparing: <ChefHat className="h-5 w-5" />,
  ready: <Utensils className="h-5 w-5" />,
  in_transit: <Truck className="h-5 w-5" />,
  delivered: <CheckCircle className="h-5 w-5" />,
  cancelled: <XCircle className="h-5 w-5" />,
};

export function OrderStatusTimeline({ 
  currentStatus, 
  statusHistory = [], 
  isLoading = false,
  className 
}: OrderStatusTimelineProps) {
  const { t } = useLanguage();

  // Only show timeline steps that are part of the normal flow (excluding cancelled)
  const timelineSteps = orderStatusSteps;
  
  // If order is cancelled, add it to the end
  if (currentStatus === 'cancelled') {
    timelineSteps.push('cancelled');
  }
  
  // Find the current step index
  const currentStepIndex = timelineSteps.findIndex(step => step === currentStatus);
  
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <h3 className="text-lg font-medium">
          <Skeleton className="h-6 w-24" />
        </h3>
        <div className="flex flex-col space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Function to get timestamp for a status from history
  const getStatusTimestamp = (status: OrderStatus): Date | null => {
    const historyItem = statusHistory.find(item => item.status === status);
    return historyItem ? new Date(historyItem.timestamp) : null;
  };

  // Function to get performer name for a status from history
  const getStatusPerformer = (status: OrderStatus): string => {
    const historyItem = statusHistory.find(item => item.status === status);
    return historyItem?.performedByName || '';
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-lg font-medium">{t('order.statusTimeline')}</h3>
      
      <div className="relative">
        {/* Timeline connector line */}
        <div className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-border" />
        
        {/* Timeline steps */}
        <div className="space-y-6">
          {timelineSteps.map((step, index) => {
            const isPast = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFuture = index > currentStepIndex;
            const timestamp = getStatusTimestamp(step);
            const performer = getStatusPerformer(step);
            
            return (
              <div key={step} className="relative flex items-start">
                {/* Status icon/indicator */}
                <div 
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full z-10",
                    isPast ? "bg-primary text-primary-foreground" : 
                    isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" : 
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {step === 'cancelled' 
                    ? <XCircle className="h-5 w-5" />
                    : statusIcons[step]}
                </div>
                
                {/* Status content */}
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p 
                      className={cn(
                        "text-sm font-medium",
                        isPast || isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {orderStatusLabels[step]}
                    </p>
                    
                    {/* Show time if this step has been reached */}
                    {timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {format(timestamp, 'PPp')}
                      </span>
                    )}
                  </div>
                  
                  {/* Show performer if available */}
                  {performer && (
                    <p className="text-sm text-muted-foreground">
                      {t('order.statusUpdatedBy')}: {performer}
                    </p>
                  )}

                  {/* Show animated indicator for current status */}
                  {isCurrent && (
                    <span className="mt-1 inline-flex items-center text-xs text-primary">
                      <span className="animate-pulse mr-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
                      {t('order.statusCurrent')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}