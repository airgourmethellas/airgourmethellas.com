import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Eye, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// For a real application, this would be calculated from the actual orders
interface KitchenStats {
  location: string;
  totalOrders: number;
  ordersCompleted: number;
  completionPercentage: number;
  nextDeadline: string;
  topItems: string[];
  colorClass: string;
}

export default function KitchenPrep() {
  // Fetch orders for kitchen preparation
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Calculate kitchen stats from orders
  const calculateKitchenStats = (): KitchenStats[] => {
    if (!orders) return [];

    // Group orders by kitchen location
    const thessalonikiOrders = orders.filter(order => order.kitchenLocation === "Thessaloniki");
    const mykonosOrders = orders.filter(order => order.kitchenLocation === "Mykonos");

    // Calculate statistics for each kitchen
    const thessalonikiStats: KitchenStats = {
      location: "Thessaloniki",
      totalOrders: thessalonikiOrders.length,
      ordersCompleted: thessalonikiOrders.filter(o => ["ready", "in_transit", "delivered"].includes(o.status)).length,
      completionPercentage: thessalonikiOrders.length ? Math.round((thessalonikiOrders.filter(o => ["ready", "in_transit", "delivered"].includes(o.status)).length / thessalonikiOrders.length) * 100) : 0,
      nextDeadline: getNextDeadline(thessalonikiOrders),
      topItems: ["Greek Yogurt Parfait (6)", "Grilled Halloumi Platter (4)", "Mediterranean Seafood (3)"],
      colorClass: "bg-blue-500"
    };

    const mykonosStats: KitchenStats = {
      location: "Mykonos",
      totalOrders: mykonosOrders.length,
      ordersCompleted: mykonosOrders.filter(o => ["ready", "in_transit", "delivered"].includes(o.status)).length,
      completionPercentage: mykonosOrders.length ? Math.round((mykonosOrders.filter(o => ["ready", "in_transit", "delivered"].includes(o.status)).length / mykonosOrders.length) * 100) : 0,
      nextDeadline: getNextDeadline(mykonosOrders),
      topItems: ["Island Seafood Platter (5)", "Greek Salad (4)", "Fresh Fruit Selection (3)"],
      colorClass: "bg-purple-500"
    };

    return [thessalonikiStats, mykonosStats];
  };

  // Helper to get the next deadline
  const getNextDeadline = (kitchenOrders: Order[]): string => {
    if (!kitchenOrders.length) return "None";
    
    // Find the earliest departure time for orders that are not yet ready
    const pendingOrders = kitchenOrders.filter(o => ["pending", "processing", "preparing"].includes(o.status));
    if (!pendingOrders.length) return "None";
    
    // Sort by departure date and time
    pendingOrders.sort((a, b) => {
      const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
      const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    const nextOrder = pendingOrders[0];
    return `${nextOrder.departureTime} (${getTimeUntil(nextOrder.departureDate, nextOrder.departureTime)})`;
  };

  // Helper to calculate time until deadline
  const getTimeUntil = (date: string, time: string): string => {
    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      
      const deadlineDate = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();
      
      const diffMs = deadlineDate.getTime() - now.getTime();
      if (diffMs <= 0) return "overdue";
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `in ${diffHours}h ${diffMinutes}m`;
    } catch (error) {
      return "unknown";
    }
  };

  const kitchenStats = calculateKitchenStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Kitchen Preparation</h2>
        <Button>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Prep Lists
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {kitchenStats.map((kitchen) => (
            <Card key={kitchen.location}>
              <CardContent className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">{kitchen.location} Kitchen</h3>
                  <Badge className={`${kitchen.location === 'Thessaloniki' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {kitchen.totalOrders} Orders Today
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                    <span>Completion Progress</span>
                    <span>{kitchen.completionPercentage}%</span>
                  </div>
                  <Progress
                    value={kitchen.completionPercentage}
                    className="h-2"
                  />
                </div>
                <div className="mt-5">
                  <div className="border-t border-gray-200 pt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Orders Prepared</dt>
                        <dd className="mt-1 text-sm text-gray-900">{kitchen.ordersCompleted}/{kitchen.totalOrders}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Next Deadline</dt>
                        <dd className="mt-1 text-sm text-gray-900">{kitchen.nextDeadline}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Top Menu Items</dt>
                        <dd className="mt-1 text-sm text-gray-900">{kitchen.topItems.join(", ")}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button>
                    Manage Tasks
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
