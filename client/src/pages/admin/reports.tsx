import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { Order, MenuItem } from '@shared/schema';
import { format, subDays, startOfMonth, endOfMonth, formatISO } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Custom types for our reports
type DailyOrdersData = {
  date: string;
  Thessaloniki: number;
  Mykonos: number;
  total: number;
};

type PopularItemData = {
  name: string;
  orderCount: number;
  percentage: number;
};

type RevenueData = {
  period: string;
  revenue: number;
};

type ClientRevenueData = {
  client: string;
  revenue: number;
  orderCount: number;
};

export default function Reports() {
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'today' | 'week'>('30days');
  const [location, setLocation] = useState<'all' | 'thessaloniki' | 'mykonos'>('all');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  
  // Fetch orders for reports
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Fetch menu items for joining with order items
  const { data: menuItems, isLoading: isLoadingMenuItems } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items'],
  });

  // Handle date range filtering
  const getDateRangeFilter = () => {
    const today = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'today':
        // Start of today
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        break;
      case 'week':
        // Start of current week (Sunday)
        const day = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate = subDays(today, 7);
        break;
      case '30days':
        startDate = subDays(today, 30);
        break;
      case '90days':
        startDate = subDays(today, 90);
        break;
    }
    
    return {
      startDate: formatISO(startDate),
      endDate: formatISO(today)
    };
  };

  // Filter orders based on date range and location
  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    
    const { startDate, endDate } = getDateRangeFilter();
    return orders.filter(order => {
      const orderDate = new Date(order.created);
      const isInDateRange = orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      
      if (!isInDateRange) return false;
      
      if (location === 'all') return true;
      return order.kitchenLocation.toLowerCase() === location;
    });
  }, [orders, dateRange, location]);

  // Generate daily orders data for line chart
  const dailyOrdersData = React.useMemo(() => {
    if (!filteredOrders.length) return [];
    
    const ordersByDate: Record<string, { Thessaloniki: number; Mykonos: number; total: number }> = {};
    
    // Initialize with dates within range
    const { startDate, endDate } = getDateRangeFilter();
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      ordersByDate[dateKey] = { Thessaloniki: 0, Mykonos: 0, total: 0 };
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    
    // Count orders by date and location
    filteredOrders.forEach(order => {
      const dateKey = format(new Date(order.created), 'yyyy-MM-dd');
      if (ordersByDate[dateKey]) {
        if (order.kitchenLocation === 'Thessaloniki') {
          ordersByDate[dateKey].Thessaloniki += 1;
        } else if (order.kitchenLocation === 'Mykonos') {
          ordersByDate[dateKey].Mykonos += 1;
        }
        ordersByDate[dateKey].total += 1;
      }
    });
    
    // Convert to array format for chart
    return Object.entries(ordersByDate).map(([date, counts]) => ({
      date: format(new Date(date), 'MMM dd'),
      ...counts
    }));
  }, [filteredOrders]);

  // Generate popular items data
  const popularItemsData = React.useMemo(() => {
    if (!filteredOrders.length || !menuItems) return [];
    
    const itemCounts: Record<number, number> = {};
    let totalItems = 0;
    
    // Count each menu item occurrence
    filteredOrders.forEach(order => {
      const orderItems = order.orderItems || [];
      orderItems.forEach(item => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = 0;
        }
        itemCounts[item.menuItemId] += item.quantity;
        totalItems += item.quantity;
      });
    });
    
    // Convert to array and add item details
    const result = Object.entries(itemCounts)
      .map(([itemId, count]) => {
        const menuItem = menuItems.find(item => item.id === Number(itemId));
        return {
          name: menuItem ? menuItem.name : `Item #${itemId}`,
          orderCount: count,
          percentage: totalItems > 0 ? (count / totalItems) * 100 : 0
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10); // Top 10 items
    
    return result;
  }, [filteredOrders, menuItems]);

  // Generate monthly revenue data
  const revenueData = React.useMemo(() => {
    if (!filteredOrders.length) return [];
    
    const revenueByMonth: Record<string, number> = {};
    
    // Group by month
    filteredOrders.forEach(order => {
      const date = new Date(order.created);
      const monthKey = format(date, 'yyyy-MM');
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = 0;
      }
      revenueByMonth[monthKey] += order.totalPrice;
    });
    
    // Convert to array format for chart
    return Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({
        period: format(new Date(month), 'MMM yyyy'),
        revenue: revenue / 100 // Convert cents to euros
      }))
      .sort((a, b) => {
        const dateA = new Date(a.period);
        const dateB = new Date(b.period);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredOrders]);

  // Generate client revenue data
  const clientRevenueData = React.useMemo(() => {
    if (!filteredOrders.length) return [];
    
    const revenueByClient: Record<string, { revenue: number; orderCount: number }> = {};
    
    // Group by client
    filteredOrders.forEach(order => {
      // Use userId as fallback identifier
      const clientName = `Client #${order.userId}`;
      if (!revenueByClient[clientName]) {
        revenueByClient[clientName] = { revenue: 0, orderCount: 0 };
      }
      revenueByClient[clientName].revenue += order.totalPrice;
      revenueByClient[clientName].orderCount += 1;
    });
    
    // Convert to array format for chart, sorted by revenue
    return Object.entries(revenueByClient)
      .map(([client, data]) => ({
        client,
        revenue: data.revenue / 100, // Convert cents to euros
        orderCount: data.orderCount
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 clients
  }, [filteredOrders]);
  
  // Generate data for orders by airport
  const airportOrdersData = React.useMemo(() => {
    if (!filteredOrders.length) return [];
    
    const ordersByAirport: Record<string, number> = {};
    
    // Count orders by departure airport
    filteredOrders.forEach(order => {
      const airport = order.departureAirport;
      if (!ordersByAirport[airport]) {
        ordersByAirport[airport] = 0;
      }
      ordersByAirport[airport] += 1;
    });
    
    // Convert to array format for chart
    return Object.entries(ordersByAirport)
      .map(([airport, count]) => ({
        airport,
        orderCount: count
      }))
      .sort((a, b) => b.orderCount - a.orderCount);
  }, [filteredOrders]);
  
  // Calculate client order frequency
  const clientFrequencyData = React.useMemo(() => {
    if (!filteredOrders.length) return [];
    
    const clientOrders: Record<string, { orders: number, lastOrderDate: string }> = {};
    
    // Group orders by client
    filteredOrders.forEach(order => {
      const clientId = `Client #${order.userId}`;
      if (!clientOrders[clientId]) {
        clientOrders[clientId] = { 
          orders: 0, 
          lastOrderDate: order.created 
        };
      }
      
      clientOrders[clientId].orders += 1;
      
      // Track the latest order date
      const orderDate = new Date(order.created);
      const lastOrderDate = new Date(clientOrders[clientId].lastOrderDate);
      if (orderDate > lastOrderDate) {
        clientOrders[clientId].lastOrderDate = order.created;
      }
    });
    
    // Calculate frequency and convert to array
    const { startDate } = getDateRangeFilter();
    const rangeStartDate = new Date(startDate);
    const today = new Date();
    const daysDiff = Math.max(1, Math.ceil((today.getTime() - rangeStartDate.getTime()) / (1000 * 3600 * 24)));
    
    return Object.entries(clientOrders)
      .map(([client, data]) => ({
        client,
        totalOrders: data.orders,
        lastOrderDate: format(new Date(data.lastOrderDate), 'PPP'),
        frequency: (data.orders / daysDiff) * 7 // Orders per week
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10); // Top 10 frequent clients
  }, [filteredOrders, getDateRangeFilter]);

  // Generate color for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
  
  // Export data to CSV
  const exportToCSV = (reportType: string) => {
    // Determine which data to export based on report type
    let data: any[] = [];
    let filename = '';
    
    switch (reportType) {
      case 'daily-orders':
        data = dailyOrdersData;
        filename = 'daily_orders_report.csv';
        break;
      case 'popular-items':
        data = popularItemsData;
        filename = 'popular_items_report.csv';
        break;
      case 'revenue':
        data = revenueData;
        filename = 'revenue_report.csv';
        break;
      case 'client-performance':
        data = clientRevenueData;
        filename = 'client_performance_report.csv';
        break;
      case 'airport-orders':
        data = airportOrdersData;
        filename = 'airport_orders_report.csv';
        break;
      case 'client-frequency':
        data = clientFrequencyData;
        filename = 'client_frequency_report.csv';
        break;
      default:
        return;
    }
    
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Convert data to CSV
    const headers = Object.keys(data[0]);
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
      const row = headers.map(header => {
        let cell = item[header];
        // Handle cells with commas by wrapping in quotes
        if (typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell;
      }).join(',');
      csvContent += row + '\n';
    });
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (isLoadingOrders || isLoadingMenuItems) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Track performance metrics and generate insights
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Current Week</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={location} onValueChange={(value) => setLocation(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="thessaloniki">Thessaloniki</SelectItem>
              <SelectItem value="mykonos">Mykonos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={groupBy} onValueChange={(value) => setGroupBy(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Group By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              // Get the active tab
              const activeTab = document.querySelector('[role="tabpanel"][data-state="active"]');
              if (activeTab) {
                const tabId = activeTab.getAttribute('id')?.replace('-content', '') || 'daily-orders';
                exportToCSV(tabId);
              } else {
                exportToCSV('daily-orders');
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              During selected period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(filteredOrders.reduce((acc, order) => acc + order.totalPrice, 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {location === 'all' ? 'All locations' : location === 'thessaloniki' ? 'Thessaloniki' : 'Mykonos'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{filteredOrders.length > 0 
                ? (filteredOrders.reduce((acc, order) => acc + order.totalPrice, 0) / filteredOrders.length / 100).toFixed(2) 
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per order
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredOrders.map(order => order.userId)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active clients
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="daily-orders" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="daily-orders">Daily Orders</TabsTrigger>
          <TabsTrigger value="popular-items">Popular Items</TabsTrigger>
          <TabsTrigger value="airport-orders">Airport Analysis</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="client-performance">Client Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily-orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Day and Location</CardTitle>
              <CardDescription>
                Total number of orders placed each day
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[400px]">
                {dailyOrdersData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyOrdersData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#8884d8" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        name="Total Orders" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Thessaloniki" 
                        stroke="#82ca9d" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        name="Thessaloniki" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Mykonos" 
                        stroke="#ffc658" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        name="Mykonos" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="popular-items">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Popular Items</CardTitle>
                <CardDescription>
                  Most frequently ordered menu items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {popularItemsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={popularItemsData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={80}
                          tick={{ fontSize: 12 }} 
                        />
                        <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                        <Bar dataKey="orderCount" fill="#8884d8" name="Order Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Item Popularity Distribution</CardTitle>
                <CardDescription>
                  Percentage breakdown of popular items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {popularItemsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <Pie
                          data={popularItemsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="orderCount"
                          nameKey="name"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {popularItemsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [`${value} orders (${(props.payload.percentage).toFixed(1)}%)`, props.payload.name]} />
                        <Legend layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                Total revenue generated month by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => `€${value}`} 
                      />
                      <Tooltip formatter={(value) => [`€${value.toFixed(2)}`, 'Revenue']} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8884d8" name="Revenue (€)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="client-performance">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Clients by Revenue</CardTitle>
              <CardDescription>
                Clients who generated the most revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {clientRevenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clientRevenueData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `€${value}`} />
                      <YAxis 
                        dataKey="client" 
                        type="category" 
                        width={80}
                        tick={{ fontSize: 12 }} 
                      />
                      <Tooltip formatter={(value, name) => [name === 'revenue' ? `€${value.toFixed(2)}` : value, name === 'revenue' ? 'Revenue' : 'Order Count']} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8884d8" name="Revenue (€)" />
                      <Bar dataKey="orderCount" fill="#82ca9d" name="Order Count" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}