/**
 * Complete Railway deployment fix
 * Resolves all TypeScript compilation errors for successful deployment
 */

import { 
  users, User, InsertUser, 
  orders, Order, InsertOrder, 
  orderItems, OrderItem, InsertOrderItem, 
  activityLogs, ActivityLog, InsertActivityLog, 
  menuItems, MenuItem, InsertMenuItem, 
  airports, Airport, InsertAirport, 
  aircraftTypes, AircraftType, InsertAircraftType,
  inventoryItems, InventoryItem, InsertInventoryItem,
  vendors, Vendor, InsertVendor,
  menuItemIngredients, MenuItemIngredient, InsertMenuItemIngredient,
  inventoryTransactions, InventoryTransaction, InsertInventoryTransaction,
  purchaseOrders, PurchaseOrder, InsertPurchaseOrder,
  purchaseOrderItems, PurchaseOrderItem, InsertPurchaseOrderItem,
  orderAnnotations, OrderAnnotation, InsertOrderAnnotation,
  conciergeRequests, ConciergeRequest, InsertConciergeRequest,
  orderStatusHistory, OrderStatusHistory, InsertOrderStatusHistory, OrderStatus
} from "@shared/schema";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { db, pool } from "./db";
import { eq, desc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrdersByKitchen(kitchen: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;

  // Order Items methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Menu Items methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItemsByDietary(dietary: string): Promise<MenuItem[]>;
  getMenuItemsByKitchen(kitchen: string): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<MenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;

  // Activity Log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit: number): Promise<ActivityLog[]>;

  // Airport methods
  getAirports(): Promise<Airport[]>;
  getAirport(id: number): Promise<Airport | undefined>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  updateAirport(id: number, airport: Partial<Airport>): Promise<Airport | undefined>;
  deleteAirport(id: number): Promise<boolean>;

  // Aircraft Type methods
  getAircraftTypes(): Promise<AircraftType[]>;
  getAircraftType(id: number): Promise<AircraftType | undefined>;
  createAircraftType(aircraftType: InsertAircraftType): Promise<AircraftType>;
  updateAircraftType(id: number, aircraftType: Partial<AircraftType>): Promise<AircraftType | undefined>;
  deleteAircraftType(id: number): Promise<boolean>;

  // Inventory methods
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;

  // Vendor methods
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<Vendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;

  // Order Status History methods
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;
  createOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order>;

  // Concierge Request methods
  getAllConciergeRequests(): Promise<ConciergeRequest[]>;
  getConciergeRequestsByUser(userId: number): Promise<ConciergeRequest[]>;
  getConciergeRequest(id: number): Promise<ConciergeRequest | undefined>;
  createConciergeRequest(request: InsertConciergeRequest): Promise<ConciergeRequest>;
  updateConciergeRequest(id: number, data: Partial<ConciergeRequest>): Promise<ConciergeRequest | undefined>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Order methods with proper type handling
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.created));
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.created));
  }

  async getOrdersByKitchen(kitchen: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.deliveryLocation, kitchen)).orderBy(desc(orders.created));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.created));
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    // Railway-compatible order creation with proper type conversion
    const railwayOrderData = {
      userId: orderData.userId,
      deliveryTime: orderData.deliveryTime,
      deliveryLocation: orderData.deliveryLocation,
      aircraftType: orderData.aircraftType,
      handlerCompany: orderData.handlerCompany,
      departureDate: orderData.departureDate,
      departureTime: orderData.departureTime,
      departureAirport: orderData.departureAirport,
      passengerCount: orderData.passengerCount,
      crewCount: orderData.crewCount,
      flightDuration: orderData.flightDuration,
      cateringType: orderData.cateringType,
      specialNotes: orderData.specialNotes || null,
      specialDietaryRequirements: orderData.specialDietaryRequirements || null,
      paymentMethod: orderData.paymentMethod || null,
      totalPrice: orderData.totalPrice || 0,
      arrivalAirport: orderData.arrivalAirport || null,
      dietaryRequirements: orderData.dietaryRequirements || null,
      documents: orderData.documents || null
    };

    const [order] = await db
      .insert(orders)
      .values(railwayOrderData)
      .returning();
    return order;
  }

  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...orderData,
        updated: new Date()
      })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Order Items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(orderItemData)
      .returning();
    return orderItem;
  }

  // Menu Items methods
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem;
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.category, category));
  }

  async getMenuItemsByDietary(dietary: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }

  async getMenuItemsByKitchen(kitchen: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }

  async createMenuItem(menuItemData: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db
      .insert(menuItems)
      .values(menuItemData)
      .returning();
    return menuItem;
  }

  async updateMenuItem(id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set(menuItemData)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedMenuItem;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const result = await db.delete(menuItems).where(eq(menuItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Activity Log methods
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(logData)
      .returning();
    return log;
  }

  async getActivityLogs(limit: number): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.created)).limit(limit);
  }

  // Airport methods
  async getAirports(): Promise<Airport[]> {
    return await db.select().from(airports);
  }

  async getAirport(id: number): Promise<Airport | undefined> {
    const [airport] = await db.select().from(airports).where(eq(airports.id, id));
    return airport;
  }

  async createAirport(airportData: InsertAirport): Promise<Airport> {
    const [airport] = await db
      .insert(airports)
      .values(airportData)
      .returning();
    return airport;
  }

  async updateAirport(id: number, airportData: Partial<Airport>): Promise<Airport | undefined> {
    const [updatedAirport] = await db
      .update(airports)
      .set(airportData)
      .where(eq(airports.id, id))
      .returning();
    return updatedAirport;
  }

  async deleteAirport(id: number): Promise<boolean> {
    const result = await db.delete(airports).where(eq(airports.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Aircraft Type methods
  async getAircraftTypes(): Promise<AircraftType[]> {
    return await db.select().from(aircraftTypes);
  }

  async getAircraftType(id: number): Promise<AircraftType | undefined> {
    const [aircraftType] = await db.select().from(aircraftTypes).where(eq(aircraftTypes.id, id));
    return aircraftType;
  }

  async createAircraftType(aircraftTypeData: InsertAircraftType): Promise<AircraftType> {
    const [aircraftType] = await db
      .insert(aircraftTypes)
      .values(aircraftTypeData)
      .returning();
    return aircraftType;
  }

  async updateAircraftType(id: number, aircraftTypeData: Partial<AircraftType>): Promise<AircraftType | undefined> {
    const [updatedAircraftType] = await db
      .update(aircraftTypes)
      .set(aircraftTypeData)
      .where(eq(aircraftTypes.id, id))
      .returning();
    return updatedAircraftType;
  }

  async deleteAircraftType(id: number): Promise<boolean> {
    const result = await db.delete(aircraftTypes).where(eq(aircraftTypes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Inventory methods
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values(itemData)
      .returning();
    return item;
  }

  async updateInventoryItem(id: number, itemData: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set(itemData)
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(vendorData)
      .returning();
    return vendor;
  }

  async updateVendor(id: number, vendorData: Partial<Vendor>): Promise<Vendor | undefined> {
    const [updatedVendor] = await db
      .update(vendors)
      .set(vendorData)
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Order Status History methods
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return await db.select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.timestamp));
  }

  async createOrderStatusHistory(historyData: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const [history] = await db
      .insert(orderStatusHistory)
      .values(historyData)
      .returning();
    return history;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updated: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();

    // Create status history entry
    await this.createOrderStatusHistory({
      orderId,
      status,
      notes: null,
      performedBy: null,
      performedByName: null
    });

    return updatedOrder;
  }

  // Concierge Request methods
  async getAllConciergeRequests(): Promise<ConciergeRequest[]> {
    return await db.select().from(conciergeRequests).orderBy(desc(conciergeRequests.created));
  }
  
  async getConciergeRequestsByUser(userId: number): Promise<ConciergeRequest[]> {
    return await db.select()
      .from(conciergeRequests)
      .where(eq(conciergeRequests.userId, userId))
      .orderBy(desc(conciergeRequests.created));
  }
  
  async getConciergeRequest(id: number): Promise<ConciergeRequest | undefined> {
    const [request] = await db.select()
      .from(conciergeRequests)
      .where(eq(conciergeRequests.id, id));
    return request;
  }
  
  async createConciergeRequest(request: InsertConciergeRequest): Promise<ConciergeRequest> {
    const [newRequest] = await db.insert(conciergeRequests)
      .values(request)
      .returning();
    return newRequest;
  }
  
  async updateConciergeRequest(id: number, data: Partial<ConciergeRequest>): Promise<ConciergeRequest | undefined> {
    const [updatedRequest] = await db.update(conciergeRequests)
      .set({
        ...data,
        updated: new Date()
      })
      .where(eq(conciergeRequests.id, id))
      .returning();
    return updatedRequest;
  }
}

export const storage = new DatabaseStorage();