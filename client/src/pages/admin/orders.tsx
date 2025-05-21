import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Loader2, Eye, ArrowUpDown, Filter, Calendar, Clock, UserIcon, Plane } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'processing':
      return 'warning';
    case 'preparing':
      return 'info';
    case 'ready':
      return 'success';
    case 'in_transit':
      return 'purple';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function Orders() {
  const { t } = useLanguage();
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'created', 
    direction: 'desc' 
  });
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch orders data
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });
  
  // Get unique user IDs from orders for filtering
  const getUniqueUserIds = () => {
    if (!orders) return [];
    
    const userIds = new Set<number>();
    orders.forEach(order => {
      userIds.add(order.userId);
    });
    
    return Array.from(userIds);
  };
  
  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prevSortConfig => ({
      key,
      direction: prevSortConfig.key === key && prevSortConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort orders
  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    
    let filtered = [...orders];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(order => order.kitchenLocation === locationFilter);
    }
    
    // Apply tab filter
    if (activeTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(order => order.departureDate === today);
    } else if (activeTab === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(order => order.departureDate > today);
    } else if (activeTab === 'past') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(order => order.departureDate < today);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(query) || 
        String(order.userId).includes(query) ||
        order.tailNumber?.toLowerCase().includes(query) ||
        order.departureAirport?.toLowerCase().includes(query) ||
        (order.arrivalAirport && order.arrivalAirport.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue;
      
      switch (sortConfig.key) {
        case 'created':
          compareValue = new Date(a.created).getTime() - new Date(b.created).getTime();
          break;
        case 'departureDate':
          compareValue = new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
          break;
        case 'departureTime':
          compareValue = a.departureTime.localeCompare(b.departureTime);
          break;
        case 'orderNumber':
          compareValue = a.orderNumber.localeCompare(b.orderNumber);
          break;
        case 'totalPrice':
          compareValue = a.totalPrice - b.totalPrice;
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        default:
          compareValue = 0;
      }
      
      return sortConfig.direction === 'asc' ? compareValue : -compareValue;
    });
    
    return filtered;
  }, [orders, statusFilter, locationFilter, searchQuery, sortConfig, activeTab]);

  // View order detail handler
  const handleViewOrder = (orderId: number) => {
    // Navigate to order detail page
    window.location.href = `/admin/orders/${orderId}`;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('admin.ordersTitle')}</h2>
          <p className="text-muted-foreground">
            {t('admin.ordersDescription')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="default">
            {t('exportOrders')}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('allOrders')}</TabsTrigger>
          <TabsTrigger value="today">{t('todayOrders')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('upcomingOrders')}</TabsTrigger>
          <TabsTrigger value="past">{t('pastOrders')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder={t('searchOrders')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('filters')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <div className="p-2">
                    <p className="font-medium text-sm mb-1">{t('location')}</p>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allLocations')}</SelectItem>
                        <SelectItem value="Thessaloniki">Thessaloniki (SKG)</SelectItem>
                        <SelectItem value="Mykonos">Mykonos (JMK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-2">
                    <p className="font-medium text-sm mb-1">{t('status')}</p>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allStatuses')}</SelectItem>
                        <SelectItem value="pending">{t('orderStatus.pending')}</SelectItem>
                        <SelectItem value="processing">{t('orderStatus.processing')}</SelectItem>
                        <SelectItem value="preparing">{t('orderStatus.preparing')}</SelectItem>
                        <SelectItem value="ready">{t('orderStatus.ready')}</SelectItem>
                        <SelectItem value="in_transit">{t('orderStatus.in_transit')}</SelectItem>
                        <SelectItem value="delivered">{t('orderStatus.delivered')}</SelectItem>
                        <SelectItem value="cancelled">{t('orderStatus.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="text-muted-foreground text-sm">
              {filteredOrders.length} {t('ordersFound')}
            </div>
          </div>
          
          {filteredOrders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('orderNumber')} className="cursor-pointer w-[160px]">
                      <div className="flex items-center">
                        {t('orderNumber')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      {t('client')}
                    </TableHead>
                    <TableHead onClick={() => handleSort('departureDate')} className="cursor-pointer">
                      <div className="flex items-center">
                        {t('departureDate')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      {t('flightDetails')}
                    </TableHead>
                    <TableHead onClick={() => handleSort('totalPrice')} className="cursor-pointer">
                      <div className="flex items-center">
                        {t('total')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                      <div className="flex items-center">
                        {t('status')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      {t('actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {/* Fetch user information from userId */}
                        User #{order.userId}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {format(new Date(order.departureDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            {order.departureTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{order.tailNumber}</span>
                          <span className="text-muted-foreground">
                            {order.departureAirport} → {order.arrivalAirport || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(order.totalPrice / 100)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {t(`orderStatus.${order.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleViewOrder(order.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('noOrdersFound')}</CardTitle>
                <CardDescription>
                  {t('noOrdersDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{t('tryAdjustingFilters')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}