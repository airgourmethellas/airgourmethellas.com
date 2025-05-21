import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function StatsCards() {
  // Fetch orders for stats calculation
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Calculate stats from orders
  const calculateStats = () => {
    if (!orders) return { pending: 0, deliveries: 0, clients: 0 };
    
    // Count pending orders (pending, processing, preparing)
    const pending = orders.filter(order => 
      ["pending", "processing", "preparing"].includes(order.status)
    ).length;
    
    // Count today's deliveries
    const today = new Date().toISOString().split('T')[0];
    const deliveries = orders.filter(order => 
      order.departureDate === today && 
      ["ready", "in_transit", "delivered"].includes(order.status)
    ).length;
    
    // Count unique clients (in a real app, this would be more accurate)
    const uniqueClientIds = new Set(orders.map(order => order.userId));
    const clients = uniqueClientIds.size;
    
    return { pending, deliveries, clients };
  };

  const stats = calculateStats();

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Pending Orders
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.pending}
              </dd>
            </CardContent>
            <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  View all orders <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Today's Deliveries
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.deliveries}
              </dd>
            </CardContent>
            <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  View schedule <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Clients
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.clients}
              </dd>
            </CardContent>
            <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  View client list <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </CardFooter>
          </Card>
        </dl>
      )}
    </div>
  );
}
