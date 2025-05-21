import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Basic schema for delivery schedules
const scheduleSchema = z.object({
  date: z.string(),
  shift: z.string(),
  deliveryPerson: z.string(),
  location: z.string(),
  notes: z.string().optional(),
  status: z.string().default("planned"), // 'planned', 'in_progress', 'completed', 'delayed'
});

// Get all schedules
router.get("/schedules", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // In a real implementation, this would fetch from the database
    // For now, return sample data for demonstration
    const schedules = [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        shift: 'morning',
        deliveryPerson: 'George Papadopoulos',
        status: 'in_progress',
        location: 'Thessaloniki',
        orders: [101, 102, 103],
        notes: 'Regular morning delivery route'
      },
      {
        id: 2,
        date: new Date().toISOString().split('T')[0],
        shift: 'afternoon',
        deliveryPerson: 'Andreas Nikolaou',
        status: 'planned',
        location: 'Thessaloniki',
        orders: [104, 105],
        notes: 'Afternoon delivery route'
      },
      {
        id: 3,
        date: new Date().toISOString().split('T')[0],
        shift: 'morning',
        deliveryPerson: 'Dimitris Alexiou',
        status: 'completed',
        location: 'Mykonos',
        orders: [106, 107, 108],
        notes: 'Mykonos airport deliveries'
      },
      {
        id: 4,
        date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
        shift: 'morning',
        deliveryPerson: 'George Papadopoulos',
        status: 'planned',
        location: 'Thessaloniki',
        orders: [109, 110],
        notes: 'Tomorrow morning route'
      },
      {
        id: 5,
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
        shift: 'afternoon',
        deliveryPerson: 'Andreas Nikolaou',
        status: 'completed',
        location: 'Thessaloniki',
        orders: [98, 99, 100],
        notes: 'Yesterday afternoon route'
      }
    ];
    
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve schedules: ${error.message}` });
  }
});

// Get schedule by ID
router.get("/schedules/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const id = parseInt(req.params.id);
    // In a real implementation, this would fetch from the database
    // For now, return sample data for demonstration if ID matches
    
    if (id <= 5 && id >= 1) {
      const schedules = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          shift: 'morning',
          deliveryPerson: 'George Papadopoulos',
          status: 'in_progress',
          location: 'Thessaloniki',
          orders: [101, 102, 103],
          notes: 'Regular morning delivery route'
        },
        {
          id: 2,
          date: new Date().toISOString().split('T')[0],
          shift: 'afternoon',
          deliveryPerson: 'Andreas Nikolaou',
          status: 'planned',
          location: 'Thessaloniki',
          orders: [104, 105],
          notes: 'Afternoon delivery route'
        },
        {
          id: 3,
          date: new Date().toISOString().split('T')[0],
          shift: 'morning',
          deliveryPerson: 'Dimitris Alexiou',
          status: 'completed',
          location: 'Mykonos',
          orders: [106, 107, 108],
          notes: 'Mykonos airport deliveries'
        },
        {
          id: 4,
          date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
          shift: 'morning',
          deliveryPerson: 'George Papadopoulos',
          status: 'planned',
          location: 'Thessaloniki',
          orders: [109, 110],
          notes: 'Tomorrow morning route'
        },
        {
          id: 5,
          date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
          shift: 'afternoon',
          deliveryPerson: 'Andreas Nikolaou',
          status: 'completed',
          location: 'Thessaloniki',
          orders: [98, 99, 100],
          notes: 'Yesterday afternoon route'
        }
      ];
      
      const schedule = schedules[id - 1];
      res.json(schedule);
    } else {
      res.status(404).json({ message: "Schedule not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve schedule: ${error.message}` });
  }
});

// Create new schedule
router.post("/schedules", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const scheduleData = scheduleSchema.parse(req.body);
    
    // In a real implementation, this would save to the database
    // For now, return a mock response with the data and a generated ID
    const newSchedule = {
      id: Math.floor(Math.random() * 1000) + 6,
      ...scheduleData,
      orders: []
    };
    
    // Log activity (in a real implementation)
    
    res.status(201).json(newSchedule);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid schedule data", errors: error.errors });
    }
    res.status(500).json({ message: `Failed to create schedule: ${error.message}` });
  }
});

// Update schedule
router.patch("/schedules/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const id = parseInt(req.params.id);
    
    // For demonstration, just echo back the updated data
    const updatedSchedule = {
      id,
      ...req.body,
      // In a real implementation, you would fetch the existing schedule, 
      // update only the fields that were sent in the request,
      // and then save it to the database
    };
    
    res.json(updatedSchedule);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to update schedule: ${error.message}` });
  }
});

// Delete schedule
router.delete("/schedules/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // In a real implementation, this would delete from the database
    // For now, just return a success response
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: `Failed to delete schedule: ${error.message}` });
  }
});

// Get orders for a schedule
router.get("/schedules/:id/orders", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const id = parseInt(req.params.id);
    
    // In a real implementation, this would fetch from the database
    // For now, return sample data based on the schedule ID
    const ordersMap = {
      1: [101, 102, 103],
      2: [104, 105],
      3: [106, 107, 108],
      4: [109, 110],
      5: [98, 99, 100]
    };
    
    const orderIds = id in ordersMap ? ordersMap[id as keyof typeof ordersMap] : [];
    
    // Generate detailed order information
    const statuses = ['prepared', 'in_transit', 'delivered', 'confirmed'];
    const companies = ['Air France', 'Lufthansa', 'Swiss', 'FlyElite', 'Star Aviation', 'Executive Jets'];
    const today = new Date();
    
    const orders = orderIds.map(orderId => {
      const departureDate = new Date(today);
      departureDate.setDate(today.getDate() + Math.floor(Math.random() * 3));
      const hour = 8 + Math.floor(Math.random() * 12);
      const minutes = Math.floor(Math.random() * 60);
      const departureTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      return {
        id: orderId,
        orderNumber: `AGH-${1000 + orderId}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        tailNumber: `N${200 + Math.floor(Math.random() * 800)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        departureDate: departureDate.toISOString().split('T')[0],
        departureTime,
        passengerCount: 2 + Math.floor(Math.random() * 14),
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
    });
    
    // In a real implementation, we would fetch real order data from the database
    // For now using this sample data for demonstration
    
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to retrieve schedule orders: ${error.message}` });
  }
});

// Assign order to schedule
router.post("/schedules/:id/orders", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const id = parseInt(req.params.id);
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    
    // In a real implementation, this would update the database
    // For now, just return a success response
    res.status(200).json({ message: `Order ${orderId} assigned to schedule ${id}` });
  } catch (error: any) {
    res.status(500).json({ message: `Failed to assign order to schedule: ${error.message}` });
  }
});

// Remove order from schedule
router.delete("/schedules/:id/orders/:orderId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const id = parseInt(req.params.id);
    const orderId = parseInt(req.params.orderId);
    
    // In a real implementation, this would update the database
    // For now, just return a success response
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: `Failed to remove order from schedule: ${error.message}` });
  }
});

export default router;