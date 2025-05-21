import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, ArrowUpDown, Filter, Calendar, Clock, PlusCircle } from "lucide-react";
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, addDays } from "date-fns";

// Define Order interface for the view dialog
interface Order {
  id: number;
  orderNumber: string;
  departureDate: string;
  departureTime: string;
  company: string;
  tailNumber: string;
  passengerCount: number;
  status: string;
}

// Define Schedule interface
interface Schedule {
  id: number;
  date: string;
  shift: string;
  deliveryPerson: string;
  status: string;
  location: string;
  orders: number[];
  notes: string;
}

// Status badge variant helper
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'planned':
      return 'secondary';
    case 'in_progress':
      return 'warning';
    case 'completed':
      return 'success';
    case 'delayed':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function Schedules() {
  const { t } = useLanguage();
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('today');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    shift: 'morning',
    deliveryPerson: '',
    location: 'Thessaloniki',
    notes: ''
  });
  
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [scheduleOrders, setScheduleOrders] = useState<Order[]>([]);

  // Fetch schedules data
  const { data: schedules, isLoading, refetch } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules'],
    // This will fall back to mock data if 404 since it's likely not yet implemented
    queryFn: async () => {
      try {
        const res = await fetch('/api/schedules');
        if (!res.ok) {
          if (res.status === 404) {
            console.warn('Schedules API not implemented yet, using sample data');
            // Return sample data for demonstration
            return generateSampleData();
          }
          throw new Error('Failed to fetch schedules');
        }
        return res.json();
      } catch (error) {
        console.error('Error fetching schedules:', error);
        return generateSampleData();
      }
    }
  });
  
  // Generate sample data for demonstration
  function generateSampleData(): Schedule[] {
    const today = new Date();
    return [
      {
        id: 1,
        date: format(today, 'yyyy-MM-dd'),
        shift: 'morning',
        deliveryPerson: 'George Papadopoulos',
        status: 'in_progress',
        location: 'Thessaloniki',
        orders: [101, 102, 103],
        notes: 'Regular morning delivery route'
      },
      {
        id: 2,
        date: format(today, 'yyyy-MM-dd'),
        shift: 'afternoon',
        deliveryPerson: 'Andreas Nikolaou',
        status: 'planned',
        location: 'Thessaloniki',
        orders: [104, 105],
        notes: 'Afternoon delivery route'
      },
      {
        id: 3,
        date: format(today, 'yyyy-MM-dd'),
        shift: 'morning',
        deliveryPerson: 'Dimitris Alexiou',
        status: 'completed',
        location: 'Mykonos',
        orders: [106, 107, 108],
        notes: 'Mykonos airport deliveries'
      },
      {
        id: 4,
        date: format(addDays(today, 1), 'yyyy-MM-dd'),
        shift: 'morning',
        deliveryPerson: 'George Papadopoulos',
        status: 'planned',
        location: 'Thessaloniki',
        orders: [109, 110],
        notes: 'Tomorrow morning route'
      },
      {
        id: 5,
        date: format(addDays(today, -1), 'yyyy-MM-dd'),
        shift: 'afternoon',
        deliveryPerson: 'Andreas Nikolaou',
        status: 'completed',
        location: 'Thessaloniki',
        orders: [98, 99, 100],
        notes: 'Yesterday afternoon route'
      }
    ];
  }
  
  // Generate sample order data for a given schedule
  function generateSampleOrdersData(orderIds: number[]): Order[] {
    const statuses = ['prepared', 'in_transit', 'delivered', 'confirmed'];
    const companies = ['Air France', 'Lufthansa', 'Swiss', 'FlyElite', 'Star Aviation', 'Executive Jets'];
    const today = new Date();
    
    return orderIds.map((id, index) => {
      const departureDate = format(addDays(today, Math.floor(Math.random() * 3)), 'yyyy-MM-dd');
      const hour = 8 + Math.floor(Math.random() * 12);
      const minutes = Math.floor(Math.random() * 60);
      const departureTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      return {
        id,
        orderNumber: `AGH-${1000 + id}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        tailNumber: `N${200 + Math.floor(Math.random() * 800)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        departureDate,
        departureTime,
        passengerCount: 2 + Math.floor(Math.random() * 14),
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
    });
  }

  // Handle status update for a schedule
  const handleStatusUpdate = async (scheduleId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update schedule status');
      }
      
      // Refetch schedules to update the list
      refetch();
    } catch (error) {
      console.error('Error updating schedule status:', error);
      alert('Failed to update schedule status. Please try again.');
    }
  };
  
  // Filter schedules based on criteria
  const filteredSchedules = React.useMemo(() => {
    if (!schedules) return [];
    
    let filtered = [...schedules];
    
    // Apply date range filter
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (dateRange === 'today') {
      filtered = filtered.filter(schedule => schedule.date === today);
    } else if (dateRange === 'tomorrow') {
      filtered = filtered.filter(schedule => schedule.date === tomorrow);
    } else if (dateRange === 'upcoming') {
      filtered = filtered.filter(schedule => schedule.date >= today);
    } else if (dateRange === 'past') {
      filtered = filtered.filter(schedule => schedule.date < today);
    }
    
    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.location === locationFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(schedule => 
        schedule.deliveryPerson.toLowerCase().includes(query) || 
        schedule.notes.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [schedules, dateRange, locationFilter, statusFilter, searchQuery]);

  // Handle adding new schedule
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newScheduleData = {
        ...newSchedule,
        status: 'planned'
      };
      
      // Send the new schedule to the server
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newScheduleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }
      
      // Reset form and close dialog
      setNewSchedule({
        date: format(new Date(), 'yyyy-MM-dd'),
        shift: 'morning',
        deliveryPerson: '',
        location: 'Thessaloniki',
        notes: ''
      });
      setShowAddDialog(false);
      
      // Refetch schedules to update the list
      refetch();
      
      // Show success toast instead of alert
      // If you have a toast component, use that instead
      alert('Schedule added successfully!');
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Failed to add schedule. Please try again.');
    }
  };
  
  // Handle updating existing schedule
  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editSchedule) return;
    
    try {
      // Send the updated schedule to the server
      const response = await fetch(`/api/schedules/${editSchedule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: editSchedule.date,
          shift: editSchedule.shift,
          deliveryPerson: editSchedule.deliveryPerson,
          location: editSchedule.location,
          notes: editSchedule.notes,
          status: editSchedule.status
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      
      // Close dialog and reset form
      setEditSchedule(null);
      setShowEditDialog(false);
      
      // Refetch schedules to update the list
      refetch();
      
      // Show success message
      alert('Schedule updated successfully!');
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule. Please try again.');
    }
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
          <h2 className="text-3xl font-bold tracking-tight">{t('schedulesTitle', 'Delivery Schedules')}</h2>
          <p className="text-muted-foreground">
            {t('schedulesDescription', 'Manage delivery schedules and assignments')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addSchedule', 'Add Schedule')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addNewSchedule', 'Add New Delivery Schedule')}</DialogTitle>
                <DialogDescription>
                  {t('addScheduleDescription', 'Create a new delivery schedule assignment')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSchedule}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      {t('date', 'Date')}
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newSchedule.date}
                      onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shift" className="text-right">
                      {t('shift', 'Shift')}
                    </Label>
                    <Select
                      value={newSchedule.shift}
                      onValueChange={(value) => setNewSchedule({...newSchedule, shift: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t('selectShift', 'Select Shift')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">{t('morningShift', 'Morning Shift')}</SelectItem>
                        <SelectItem value="afternoon">{t('afternoonShift', 'Afternoon Shift')}</SelectItem>
                        <SelectItem value="evening">{t('eveningShift', 'Evening Shift')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deliveryPerson" className="text-right">
                      {t('deliveryPerson', 'Delivery Person')}
                    </Label>
                    <Input
                      id="deliveryPerson"
                      value={newSchedule.deliveryPerson}
                      onChange={(e) => setNewSchedule({...newSchedule, deliveryPerson: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      {t('location', 'Location')}
                    </Label>
                    <Select
                      value={newSchedule.location}
                      onValueChange={(value) => setNewSchedule({...newSchedule, location: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t('selectLocation', 'Select Location')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Thessaloniki">Thessaloniki (SKG)</SelectItem>
                        <SelectItem value="Mykonos">Mykonos (JMK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      {t('notes', 'Notes')}
                    </Label>
                    <Input
                      id="notes"
                      value={newSchedule.notes}
                      onChange={(e) => setNewSchedule({...newSchedule, notes: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{t('createSchedule', 'Create Schedule')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Schedule Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('editSchedule', 'Edit Delivery Schedule')}</DialogTitle>
                <DialogDescription>
                  {t('editScheduleDescription', 'Update schedule details')}
                </DialogDescription>
              </DialogHeader>
              {editSchedule && (
                <form onSubmit={handleUpdateSchedule}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-date" className="text-right">
                        {t('date', 'Date')}
                      </Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editSchedule.date}
                        onChange={(e) => setEditSchedule({...editSchedule, date: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-shift" className="text-right">
                        {t('shift', 'Shift')}
                      </Label>
                      <Select
                        value={editSchedule.shift}
                        onValueChange={(value) => setEditSchedule({...editSchedule, shift: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t('selectShift', 'Select Shift')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">{t('morningShift', 'Morning Shift')}</SelectItem>
                          <SelectItem value="afternoon">{t('afternoonShift', 'Afternoon Shift')}</SelectItem>
                          <SelectItem value="evening">{t('eveningShift', 'Evening Shift')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-deliveryPerson" className="text-right">
                        {t('deliveryPerson', 'Delivery Person')}
                      </Label>
                      <Input
                        id="edit-deliveryPerson"
                        value={editSchedule.deliveryPerson}
                        onChange={(e) => setEditSchedule({...editSchedule, deliveryPerson: e.target.value})}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-location" className="text-right">
                        {t('location', 'Location')}
                      </Label>
                      <Select
                        value={editSchedule.location}
                        onValueChange={(value) => setEditSchedule({...editSchedule, location: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t('selectLocation', 'Select Location')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Thessaloniki">Thessaloniki (SKG)</SelectItem>
                          <SelectItem value="Mykonos">Mykonos (JMK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-status" className="text-right">
                        {t('status', 'Status')}
                      </Label>
                      <Select
                        value={editSchedule.status}
                        onValueChange={(value) => setEditSchedule({...editSchedule, status: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t('selectStatus', 'Select Status')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">{t('scheduleStatus.planned', 'Planned')}</SelectItem>
                          <SelectItem value="in_progress">{t('scheduleStatus.in_progress', 'In Progress')}</SelectItem>
                          <SelectItem value="completed">{t('scheduleStatus.completed', 'Completed')}</SelectItem>
                          <SelectItem value="delayed">{t('scheduleStatus.delayed', 'Delayed')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-notes" className="text-right">
                        {t('notes', 'Notes')}
                      </Label>
                      <Input
                        id="edit-notes"
                        value={editSchedule.notes}
                        onChange={(e) => setEditSchedule({...editSchedule, notes: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{t('updateSchedule', 'Update Schedule')}</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
          
          {/* View Orders Dialog */}
          <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{t('scheduleOrders', 'Schedule Orders')}</DialogTitle>
                <DialogDescription>
                  {selectedSchedule && (
                    <>
                      {t('scheduledFor', 'Scheduled for')} {selectedSchedule.date}, {selectedSchedule.shift} shift
                      <span className="font-semibold"> • </span>
                      {t('deliveryBy', 'Delivery by')} {selectedSchedule.deliveryPerson}
                      <span className="font-semibold"> • </span>
                      {selectedSchedule.location}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-auto max-h-[60vh]">
                {selectedSchedule?.orders.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    {t('noOrdersAssigned', 'No orders assigned to this schedule yet')}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.orderNumber', 'Order #')}</TableHead>
                        <TableHead>{t('common.company', 'Company')}</TableHead>
                        <TableHead>{t('common.tailNumber', 'Tail Number')}</TableHead>
                        <TableHead>{t('common.departure', 'Departure')}</TableHead>
                        <TableHead>{t('common.passengers', 'Passengers')}</TableHead>
                        <TableHead>{t('common.status', 'Status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduleOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{order.company}</TableCell>
                          <TableCell>{order.tailNumber}</TableCell>
                          <TableCell>
                            {order.departureDate} {order.departureTime}
                          </TableCell>
                          <TableCell>{order.passengerCount}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {t(`orderStatus.${order.status}`, order.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  {t('common.close', 'Close')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs value={dateRange} onValueChange={setDateRange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">{t('today', 'Today')}</TabsTrigger>
          <TabsTrigger value="tomorrow">{t('tomorrow', 'Tomorrow')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('upcoming', 'Upcoming')}</TabsTrigger>
          <TabsTrigger value="past">{t('past', 'Past')}</TabsTrigger>
          <TabsTrigger value="all">{t('all', 'All')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={dateRange} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder={t('searchSchedules', 'Search schedules...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('filters', 'Filters')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <div className="p-2">
                    <p className="font-medium text-sm mb-1">{t('location', 'Location')}</p>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allLocations', 'All Locations')}</SelectItem>
                        <SelectItem value="Thessaloniki">Thessaloniki (SKG)</SelectItem>
                        <SelectItem value="Mykonos">Mykonos (JMK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-2">
                    <p className="font-medium text-sm mb-1">{t('status', 'Status')}</p>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allStatuses', 'All Statuses')}</SelectItem>
                        <SelectItem value="planned">{t('scheduleStatus.planned', 'Planned')}</SelectItem>
                        <SelectItem value="in_progress">{t('scheduleStatus.in_progress', 'In Progress')}</SelectItem>
                        <SelectItem value="completed">{t('scheduleStatus.completed', 'Completed')}</SelectItem>
                        <SelectItem value="delayed">{t('scheduleStatus.delayed', 'Delayed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="text-muted-foreground text-sm">
              {filteredSchedules.length} {t('schedulesFound', 'schedules found')}
            </div>
          </div>
          
          {filteredSchedules.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t('date', 'Date')}
                    </TableHead>
                    <TableHead>
                      {t('shift', 'Shift')}
                    </TableHead>
                    <TableHead>
                      {t('deliveryPerson', 'Delivery Person')}
                    </TableHead>
                    <TableHead>
                      {t('location', 'Location')}
                    </TableHead>
                    <TableHead>
                      {t('orders', 'Orders')}
                    </TableHead>
                    <TableHead>
                      {t('status', 'Status')}
                    </TableHead>
                    <TableHead>
                      {t('actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          {format(new Date(schedule.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          {t(`admin.${schedule.shift}Shift`, schedule.shift.charAt(0).toUpperCase() + schedule.shift.slice(1))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {schedule.deliveryPerson}
                      </TableCell>
                      <TableCell>
                        {schedule.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {schedule.orders.length} {t('ordersCount', 'orders')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant={getStatusBadgeVariant(schedule.status)} size="sm">
                              {t(`scheduleStatus.${schedule.status}`, schedule.status.replace('_', ' '))}
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(schedule.id, 'planned')}
                              disabled={schedule.status === 'planned'}
                            >
                              {t('scheduleStatus.planned', 'Planned')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(schedule.id, 'in_progress')}
                              disabled={schedule.status === 'in_progress'}
                            >
                              {t('scheduleStatus.in_progress', 'In Progress')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(schedule.id, 'completed')}
                              disabled={schedule.status === 'completed'}
                            >
                              {t('scheduleStatus.completed', 'Completed')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(schedule.id, 'delayed')}
                              disabled={schedule.status === 'delayed'}
                            >
                              {t('scheduleStatus.delayed', 'Delayed')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                setSelectedSchedule(schedule);
                                
                                // Fetch order details for this schedule
                                try {
                                  const response = await fetch(`/api/schedules/${schedule.id}/orders`);
                                  if (response.ok) {
                                    const data = await response.json();
                                    setScheduleOrders(data);
                                  } else {
                                    // If API not yet implemented, use sample data
                                    setScheduleOrders(generateSampleOrdersData(schedule.orders));
                                  }
                                } catch (error) {
                                  console.error('Error fetching schedule orders:', error);
                                  // Fallback to sample data
                                  setScheduleOrders(generateSampleOrdersData(schedule.orders));
                                }
                                
                                setShowViewDialog(true);
                              }}
                            >
                              {t('view', 'View')}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditSchedule(schedule);
                                setShowEditDialog(true);
                              }}
                            >
                              {t('edit', 'Edit')}
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('noSchedulesFound', 'No schedules found')}</CardTitle>
                <CardDescription>
                  {t('noSchedulesDescription', 'No delivery schedules match your current filters')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createNewSchedule', 'Create new schedule')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}