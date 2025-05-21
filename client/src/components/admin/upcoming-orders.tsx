import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UpcomingOrders() {
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("24h");

  // Fetch upcoming orders (pending, processing, preparing)
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Format datetime from ISO string
  const formatDateTime = (dateString: string, timeString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return {
        formattedDate: format(date, "MMMM d, yyyy"),
        formattedTime: timeString
      };
    } catch (error) {
      return {
        formattedDate: dateString,
        formattedTime: timeString
      };
    }
  };

  // Filter orders based on selected filters
  const filteredOrders = orders?.filter(order => {
    // Location filter
    if (locationFilter !== "all") {
      if (order.kitchenLocation.toLowerCase() !== locationFilter) {
        return false;
      }
    }

    // Time filter
    const orderDate = new Date(order.departureDate);
    const now = new Date();
    
    switch (timeFilter) {
      case "24h":
        const tomorrow = new Date(now);
        tomorrow.setHours(tomorrow.getHours() + 24);
        return orderDate <= tomorrow;
      case "48h":
        const twoDaysLater = new Date(now);
        twoDaysLater.setHours(twoDaysLater.getHours() + 48);
        return orderDate <= twoDaysLater;
      case "7d":
        const sevenDaysLater = new Date(now);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        return orderDate <= sevenDaysLater;
      default:
        return true;
    }
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>;
      case "preparing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Preparing</Badge>;
      case "ready":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ready</Badge>;
      case "in_transit":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">In Transit</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Upcoming Orders</h2>
        <div className="flex space-x-2">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="thessaloniki">Thessaloniki</SelectItem>
              <SelectItem value="mykonos">Mykonos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Next 24 Hours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Next 24 Hours</SelectItem>
              <SelectItem value="48h">Next 48 Hours</SelectItem>
              <SelectItem value="7d">Next 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : filteredOrders && filteredOrders.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const { formattedDate, formattedTime } = formatDateTime(order.departureDate, order.departureTime);
              
              return (
                <li key={order.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-primary-600 truncate">{order.orderNumber}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button>
                            Actions
                            <svg className="-mr-1 ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Order {order.orderNumber}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Print Manifest</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {/* This would be the client name in a real app */}
                        Client #{order.userId}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {order.departureAirport}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {formattedDate}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {formattedTime}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.kitchenLocation === "Thessaloniki" 
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {order.kitchenLocation} Kitchen
                      </span>
                      <span className="ml-2">{order.aircraftType} • {order.passengerCount} PAX • {order.crewCount} CREW</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <CardContent className="py-12 text-center text-gray-500">
            No upcoming orders found matching your criteria.
          </CardContent>
        )}
      </Card>
    </div>
  );
}
