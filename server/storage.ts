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
import { airGourmetMenuItems } from "./menu-data";
import { db, pool } from "./db";
import { eq, desc, asc, and, sql } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Concierge Request methods
  getAllConciergeRequests(): Promise<ConciergeRequest[]>;
  getConciergeRequestsByUser(userId: number): Promise<ConciergeRequest[]>;
  getConciergeRequest(id: number): Promise<ConciergeRequest | undefined>;
  createConciergeRequest(request: InsertConciergeRequest): Promise<ConciergeRequest>;
  updateConciergeRequest(id: number, data: Partial<ConciergeRequest>): Promise<ConciergeRequest | undefined>;
  
  // Order Status History methods
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;
  createOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order>;

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

  // Order Templates methods have been removed

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
  
  // Aircraft Types methods
  getAircraftTypes(): Promise<AircraftType[]>;
  
  // Airports methods
  getAirports(): Promise<Airport[]>;
  
  // Inventory Items methods
  getInventoryItems(location?: string): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  getInventoryItemsByCategory(category: string, location?: string): Promise<InventoryItem[]>;
  getLowStockItems(location?: string): Promise<InventoryItem[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;

  // Vendors methods
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<Vendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;

  // Menu Item Ingredients methods
  getMenuItemIngredients(menuItemId: number): Promise<MenuItemIngredient[]>;
  createMenuItemIngredient(ingredient: InsertMenuItemIngredient): Promise<MenuItemIngredient>;
  updateMenuItemIngredient(id: number, ingredient: Partial<MenuItemIngredient>): Promise<MenuItemIngredient | undefined>;
  deleteMenuItemIngredient(id: number): Promise<boolean>;

  // Inventory Transactions methods
  getInventoryTransactions(inventoryItemId?: number, location?: string): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  getInventoryTransactionsByOrder(orderId: number): Promise<InventoryTransaction[]>;

  // Purchase Orders methods
  getPurchaseOrders(location?: string): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  getPurchaseOrderByNumber(orderNumber: string): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, order: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: number): Promise<boolean>;

  // Purchase Order Items methods
  getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  updatePurchaseOrderItem(id: number, item: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem | undefined>;
  deletePurchaseOrderItem(id: number): Promise<boolean>;
  
  // Order Annotations methods
  getOrderAnnotations(orderId: number): Promise<OrderAnnotation[]>;
  createOrderAnnotation(annotation: InsertOrderAnnotation): Promise<OrderAnnotation>;
  updateOrderAnnotation(id: number, annotation: Partial<OrderAnnotation>): Promise<OrderAnnotation | undefined>;
  deleteOrderAnnotation(id: number): Promise<boolean>;
  
  // Order Status History methods
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;
  createOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order>;
  
  // Session store
  sessionStore: session.Store;
}

// a simple memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  // Removed orderTemplates - not used in current schema
  private menuItems: Map<number, MenuItem>;
  private activityLogs: ActivityLog[];
  private conciergeRequests: Map<number, ConciergeRequest>;
  private airports: Map<number, Airport>;
  private aircraftTypes: Map<number, AircraftType>;
  
  // Inventory related storage
  private inventoryItems: Map<number, InventoryItem>;
  private vendors: Map<number, Vendor>;
  private menuItemIngredients: Map<number, MenuItemIngredient>;
  private inventoryTransactions: InventoryTransaction[];
  private purchaseOrders: Map<number, PurchaseOrder>;
  private purchaseOrderItems: Map<number, PurchaseOrderItem[]>;
  private orderAnnotations: Map<number, OrderAnnotation[]>;
  
  userCounter: number;
  orderCounter: number;
  orderItemCounter: number;
  templateCounter: number;
  menuItemCounter: number;
  activityLogCounter: number;
  airportCounter: number;
  aircraftTypeCounter: number;
  inventoryItemCounter: number;
  vendorCounter: number;
  menuItemIngredientCounter: number;
  inventoryTransactionCounter: number;
  purchaseOrderCounter: number;
  purchaseOrderItemCounter: number;
  orderAnnotationCounter: number;
  conciergeRequestCounter: number;
  orderStatusHistoryCounter: number;
  orderStatusHistory: Map<number, OrderStatusHistory[]>;
  sessionStore: session.Store;
  
  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    // orderTemplates removed from schema
    this.menuItems = new Map();
    this.activityLogs = [];
    this.airports = new Map();
    this.aircraftTypes = new Map();
    
    // Initialize inventory-related maps
    this.inventoryItems = new Map();
    this.vendors = new Map();
    this.menuItemIngredients = new Map();
    this.inventoryTransactions = [];
    this.purchaseOrders = new Map();
    this.purchaseOrderItems = new Map();
    this.orderAnnotations = new Map();
    this.conciergeRequests = new Map();
    this.orderStatusHistory = new Map();
    
    this.userCounter = 0;
    this.orderCounter = 0;
    this.orderItemCounter = 0;
    this.templateCounter = 0;
    this.menuItemCounter = 0;
    this.activityLogCounter = 0;
    this.airportCounter = 0;
    this.aircraftTypeCounter = 0;
    this.orderStatusHistoryCounter = 0;
    this.inventoryItemCounter = 0;
    this.vendorCounter = 0;
    this.menuItemIngredientCounter = 0;
    this.inventoryTransactionCounter = 0;
    this.purchaseOrderCounter = 0;
    this.purchaseOrderItemCounter = 0;
    this.orderAnnotationCounter = 0;
    this.conciergeRequestCounter = 0;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Add sample aircraft types
    const aircraftTypes = [
      { name: "Gulfstream G650" },
      { name: "Bombardier Global 7500" },
      { name: "Cessna Citation X" },
      { name: "Dassault Falcon 7X" },
      { name: "Embraer Legacy 650" }
    ];
    
    aircraftTypes.forEach(type => this.createAircraftType(type));
    
    // Add sample airports
    const airports = [
      { code: "LGTS", name: "Thessaloniki International Airport", location: "Thessaloniki" },
      { code: "LGMK", name: "Mykonos International Airport", location: "Mykonos" },
      { code: "LGAV", name: "Athens International Airport", location: "Athens" }
    ];
    
    airports.forEach(airport => this.createAirport(airport));
    
    // Use menu items from Air Gourmet Hellas menu
    const menuItems = airGourmetMenuItems;
    
    menuItems.forEach(item => this.createMenuItem(item));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = ++this.userCounter;
    const user: User = { 
      ...insertUser, 
      id, 
      created: new Date(),
      company: insertUser.company || null,
      phone: insertUser.phone || null,
      role: insertUser.role || "client"
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    for (const order of this.orders.values()) {
      if (order.orderNumber === orderNumber) {
        return order;
      }
    }
    return undefined;
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
  
  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.status === status);
  }
  
  async getOrdersByKitchen(kitchen: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.kitchenLocation === kitchen);
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = ++this.orderCounter;
    const orderNumber = `AGH-${new Date().getFullYear()}-${id.toString().padStart(5, '0')}`;
    
    const order: Order = {
      ...orderData,
      id,
      status: orderData.status || "pending",
      orderNumber,
      created: new Date(),
      totalPrice: orderData.totalPrice || 0,
      documents: orderData.documents || null,
      dietaryRequirements: orderData.dietaryRequirements || null,
    };
    
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { ...order, ...orderData };
    if (orderData.status) {
      updatedOrder.updated = new Date();
    }
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async deleteOrder(id: number): Promise<boolean> {
    return this.orders.delete(id);
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.orderItems.get(orderId) || [];
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = ++this.orderItemCounter;
    const newOrderItem: OrderItem = { 
      ...orderItem, 
      id,
      specialInstructions: orderItem.specialInstructions || null
    };
    
    const orderItems = this.orderItems.get(orderItem.orderId) || [];
    orderItems.push(newOrderItem);
    this.orderItems.set(orderItem.orderId, orderItems);
    
    return newOrderItem;
  }
  
  // Order template methods removed - not in current schema
  
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }
  
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.category === category);
  }
  
  async getMenuItemsByDietary(dietary: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => 
      item.dietaryOptions && item.dietaryOptions.includes(dietary)
    );
  }
  
  async getMenuItemsByKitchen(kitchen: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.kitchenLocation === kitchen);
  }
  
  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const id = ++this.menuItemCounter;
    const newMenuItem: MenuItem = { 
      ...menuItem, 
      id,
      description: menuItem.description || null,
      dietaryOptions: menuItem.dietaryOptions || null,
      available: menuItem.available === undefined ? true : menuItem.available
    };
    
    this.menuItems.set(id, newMenuItem);
    return newMenuItem;
  }
  
  async updateMenuItem(id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const menuItem = await this.getMenuItem(id);
    if (!menuItem) return undefined;
    
    const updatedMenuItem: MenuItem = { ...menuItem, ...menuItemData };
    this.menuItems.set(id, updatedMenuItem);
    return updatedMenuItem;
  }
  
  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItems.delete(id);
  }
  
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = ++this.activityLogCounter;
    const newLog: ActivityLog = { 
      ...log, 
      id, 
      created: new Date(),
      userId: log.userId || null,
      orderId: log.orderId || null,
      details: log.details || null
    };
    
    this.activityLogs.push(newLog);
    return newLog;
  }
  
  async getActivityLogs(limit: number): Promise<ActivityLog[]> {
    return this.activityLogs
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .slice(0, limit);
  }
  
  async getAircraftTypes(): Promise<AircraftType[]> {
    return Array.from(this.aircraftTypes.values());
  }
  
  async createAircraftType(aircraftType: InsertAircraftType): Promise<AircraftType> {
    const id = ++this.aircraftTypeCounter;
    const newType: AircraftType = { ...aircraftType, id };
    
    this.aircraftTypes.set(id, newType);
    return newType;
  }
  
  async getAirports(): Promise<Airport[]> {
    return Array.from(this.airports.values());
  }

  // Inventory Items methods
  async getInventoryItems(location?: string): Promise<InventoryItem[]> {
    const items = Array.from(this.inventoryItems.values());
    if (location) {
      return items.filter(item => item.location === location);
    }
    return items;
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async getInventoryItemsByCategory(category: string, location?: string): Promise<InventoryItem[]> {
    const items = Array.from(this.inventoryItems.values()).filter(item => item.category === category);
    if (location) {
      return items.filter(item => item.location === location);
    }
    return items;
  }

  async getLowStockItems(location?: string): Promise<InventoryItem[]> {
    const items = Array.from(this.inventoryItems.values())
      .filter(item => item.inStock <= item.reorderPoint);
    
    if (location) {
      return items.filter(item => item.location === location);
    }
    return items;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const id = ++this.inventoryItemCounter;
    const now = new Date();
    
    const newItem: InventoryItem = {
      ...item,
      id,
      created: now,
      updated: now,
    };
    
    this.inventoryItems.set(id, newItem);
    return newItem;
  }

  async updateInventoryItem(id: number, itemData: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;
    
    const updatedItem: InventoryItem = { 
      ...item, 
      ...itemData,
      updated: new Date() 
    };
    
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  // Vendors methods
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = ++this.vendorCounter;
    const now = new Date();
    
    const newVendor: Vendor = {
      ...vendor,
      id,
      created: now,
      updated: now,
    };
    
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async updateVendor(id: number, vendorData: Partial<Vendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor: Vendor = { 
      ...vendor, 
      ...vendorData,
      updated: new Date() 
    };
    
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }
  
  // Menu Item Ingredients methods
  async getMenuItemIngredients(menuItemId: number): Promise<MenuItemIngredient[]> {
    return Array.from(this.menuItemIngredients.values())
      .filter(ingredient => ingredient.menuItemId === menuItemId);
  }
  
  async createMenuItemIngredient(ingredient: InsertMenuItemIngredient): Promise<MenuItemIngredient> {
    const id = ++this.menuItemIngredientCounter;
    
    const newIngredient: MenuItemIngredient = {
      ...ingredient,
      id,
    };
    
    this.menuItemIngredients.set(id, newIngredient);
    return newIngredient;
  }
  
  async updateMenuItemIngredient(id: number, ingredientData: Partial<MenuItemIngredient>): Promise<MenuItemIngredient | undefined> {
    const ingredient = this.menuItemIngredients.get(id);
    if (!ingredient) return undefined;
    
    const updatedIngredient: MenuItemIngredient = { 
      ...ingredient, 
      ...ingredientData,
    };
    
    this.menuItemIngredients.set(id, updatedIngredient);
    return updatedIngredient;
  }
  
  async deleteMenuItemIngredient(id: number): Promise<boolean> {
    return this.menuItemIngredients.delete(id);
  }
  
  // Inventory Transactions methods
  async getInventoryTransactions(inventoryItemId?: number, location?: string): Promise<InventoryTransaction[]> {
    let transactions = this.inventoryTransactions;
    
    if (inventoryItemId) {
      transactions = transactions.filter(t => t.inventoryItemId === inventoryItemId);
    }
    
    if (location) {
      transactions = transactions.filter(t => t.location === location);
    }
    
    return transactions;
  }
  
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const id = ++this.inventoryTransactionCounter;
    const now = new Date();
    
    const newTransaction: InventoryTransaction = {
      ...transaction,
      id,
      created: now,
    };
    
    this.inventoryTransactions.push(newTransaction);
    
    // Update inventory item quantity
    const item = this.inventoryItems.get(transaction.inventoryItemId);
    if (item) {
      item.inStock += transaction.quantity;
      if (transaction.transactionType === 'restock') {
        item.lastRestockDate = new Date();
      }
      item.lastCheckedDate = new Date();
      this.inventoryItems.set(item.id, item);
    }
    
    return newTransaction;
  }
  
  async getInventoryTransactionsByOrder(orderId: number): Promise<InventoryTransaction[]> {
    return this.inventoryTransactions.filter(t => t.orderId === orderId);
  }
  
  // Purchase Orders methods
  async getPurchaseOrders(location?: string): Promise<PurchaseOrder[]> {
    const orders = Array.from(this.purchaseOrders.values());
    if (location) {
      return orders.filter(order => order.location === location);
    }
    return orders;
  }
  
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }
  
  async getPurchaseOrderByNumber(orderNumber: string): Promise<PurchaseOrder | undefined> {
    return Array.from(this.purchaseOrders.values())
      .find(order => order.orderNumber === orderNumber);
  }
  
  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const id = ++this.purchaseOrderCounter;
    const now = new Date();
    const orderNumber = `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${id}`;
    
    const newOrder: PurchaseOrder = {
      ...order,
      id,
      orderNumber,
      created: now,
      updated: now,
    };
    
    this.purchaseOrders.set(id, newOrder);
    return newOrder;
  }
  
  async updatePurchaseOrder(id: number, orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const order = this.purchaseOrders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: PurchaseOrder = { 
      ...order, 
      ...orderData,
      updated: new Date() 
    };
    
    this.purchaseOrders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async deletePurchaseOrder(id: number): Promise<boolean> {
    return this.purchaseOrders.delete(id);
  }
  
  // Purchase Order Items methods
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    const items = this.purchaseOrderItems.get(purchaseOrderId);
    return items || [];
  }
  
  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const id = ++this.purchaseOrderItemCounter;
    
    const newItem: PurchaseOrderItem = {
      ...item,
      id,
    };
    
    const existingItems = this.purchaseOrderItems.get(item.purchaseOrderId) || [];
    existingItems.push(newItem);
    this.purchaseOrderItems.set(item.purchaseOrderId, existingItems);
    
    // Update purchase order total cost
    const purchaseOrder = this.purchaseOrders.get(item.purchaseOrderId);
    if (purchaseOrder) {
      const currentTotal = purchaseOrder.totalCost || 0;
      const itemTotal = item.quantity * item.unitCost;
      purchaseOrder.totalCost = currentTotal + itemTotal;
      purchaseOrder.updated = new Date();
      this.purchaseOrders.set(purchaseOrder.id, purchaseOrder);
    }
    
    return newItem;
  }
  
  async updatePurchaseOrderItem(id: number, itemData: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    // Find the purchase order that contains this item
    for (const [purchaseOrderId, items] of this.purchaseOrderItems.entries()) {
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        const oldItem = items[itemIndex];
        const updatedItem: PurchaseOrderItem = { ...oldItem, ...itemData };
        items[itemIndex] = updatedItem;
        this.purchaseOrderItems.set(purchaseOrderId, items);
        
        // Update purchase order total cost if quantity or unit cost changed
        if (itemData.quantity !== undefined || itemData.unitCost !== undefined) {
          const purchaseOrder = this.purchaseOrders.get(purchaseOrderId);
          if (purchaseOrder) {
            // Recalculate total cost for all items
            let totalCost = 0;
            for (const item of items) {
              totalCost += item.quantity * item.unitCost;
            }
            purchaseOrder.totalCost = totalCost;
            purchaseOrder.updated = new Date();
            this.purchaseOrders.set(purchaseOrderId, purchaseOrder);
          }
        }
        
        return updatedItem;
      }
    }
    
    return undefined;
  }
  
  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    // Find the purchase order that contains this item
    for (const [purchaseOrderId, items] of this.purchaseOrderItems.entries()) {
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        const removedItem = items[itemIndex];
        items.splice(itemIndex, 1);
        this.purchaseOrderItems.set(purchaseOrderId, items);
        
        // Update purchase order total cost
        const purchaseOrder = this.purchaseOrders.get(purchaseOrderId);
        if (purchaseOrder) {
          const itemTotal = removedItem.quantity * removedItem.unitCost;
          purchaseOrder.totalCost = (purchaseOrder.totalCost || 0) - itemTotal;
          purchaseOrder.updated = new Date();
          this.purchaseOrders.set(purchaseOrderId, purchaseOrder);
        }
        
        return true;
      }
    }
    
    return false;
  }
  
  async createAirport(airport: InsertAirport): Promise<Airport> {
    const id = ++this.airportCounter;
    const newAirport: Airport = { ...airport, id };
    
    this.airports.set(id, newAirport);
    return newAirport;
  }

  // Order Annotations methods
  async getOrderAnnotations(orderId: number): Promise<OrderAnnotation[]> {
    return this.orderAnnotations.get(orderId) || [];
  }
  
  async createOrderAnnotation(annotation: InsertOrderAnnotation): Promise<OrderAnnotation> {
    const id = ++this.orderAnnotationCounter;
    const now = new Date();
    
    const newAnnotation: OrderAnnotation = {
      ...annotation,
      id,
      created: now,
      updated: now
    };
    
    const annotations = this.orderAnnotations.get(annotation.orderId) || [];
    annotations.push(newAnnotation);
    this.orderAnnotations.set(annotation.orderId, annotations);
    
    return newAnnotation;
  }
  
  async updateOrderAnnotation(id: number, annotationData: Partial<OrderAnnotation>): Promise<OrderAnnotation | undefined> {
    // Loop through all order annotations to find the one with matching id
    for (const [orderId, annotations] of this.orderAnnotations.entries()) {
      const index = annotations.findIndex(a => a.id === id);
      if (index !== -1) {
        const annotation = annotations[index];
        const updatedAnnotation: OrderAnnotation = { 
          ...annotation, 
          ...annotationData,
          updated: new Date() 
        };
        
        annotations[index] = updatedAnnotation;
        this.orderAnnotations.set(orderId, annotations);
        return updatedAnnotation;
      }
    }
    
    return undefined;
  }
  
  async deleteOrderAnnotation(id: number): Promise<boolean> {
    for (const [orderId, annotations] of this.orderAnnotations.entries()) {
      const index = annotations.findIndex(a => a.id === id);
      if (index !== -1) {
        annotations.splice(index, 1);
        this.orderAnnotations.set(orderId, annotations);
        return true;
      }
    }
    
    return false;
  }
  
  // Concierge Request methods
  async getAllConciergeRequests(): Promise<ConciergeRequest[]> {
    return Array.from(this.conciergeRequests.values())
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  }
  
  async getConciergeRequestsByUser(userId: number): Promise<ConciergeRequest[]> {
    return Array.from(this.conciergeRequests.values())
      .filter(request => request.userId === userId)
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  }
  
  async getConciergeRequest(id: number): Promise<ConciergeRequest | undefined> {
    return this.conciergeRequests.get(id);
  }
  
  async createConciergeRequest(request: InsertConciergeRequest): Promise<ConciergeRequest> {
    const id = ++this.conciergeRequestCounter;
    const now = new Date();
    
    const newRequest: ConciergeRequest = {
      ...request,
      id,
      status: 'pending',
      created: now,
      updated: now
    };
    
    this.conciergeRequests.set(id, newRequest);
    
    // Log activity for this concierge request
    await this.logActivity({
      action: 'concierge_request_created',
      userId: request.userId,
      details: `New concierge service request created: ${request.serviceType}`,
      resourceId: id,
      resourceType: 'concierge_request'
    });
    
    return newRequest;
  }
  
  async updateConciergeRequest(id: number, data: Partial<ConciergeRequest>): Promise<ConciergeRequest | undefined> {
    const request = this.conciergeRequests.get(id);
    
    if (!request) {
      return undefined;
    }
    
    const updatedRequest: ConciergeRequest = {
      ...request,
      ...data,
      updated: new Date()
    };
    
    this.conciergeRequests.set(id, updatedRequest);
    
    // Log activity for status changes
    if (data.status && data.status !== request.status) {
      await this.logActivity({
        action: 'concierge_request_status_updated',
        userId: data.adminUserId || request.userId,
        details: `Concierge request status changed from ${request.status} to ${data.status}`,
        resourceId: id,
        resourceType: 'concierge_request'
      });
    }
    
    return updatedRequest;
  }
  
  // Order Status History methods
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    const historyEntries = this.orderStatusHistory.get(orderId) || [];
    return [...historyEntries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
  
  async createOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const id = ++this.orderStatusHistoryCounter;
    
    const newHistory: OrderStatusHistory = {
      ...history,
      id,
      timestamp: new Date()
    };
    
    const existingHistory = this.orderStatusHistory.get(history.orderId) || [];
    existingHistory.push(newHistory);
    this.orderStatusHistory.set(history.orderId, existingHistory);
    
    return newHistory;
  }
  
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    const updatedOrder: Order = {
      ...order,
      status,
      updated: new Date()
    };
    
    this.orders.set(orderId, updatedOrder);
    
    // Log activity for the status change
    await this.logActivity({
      action: 'order_status_updated',
      userId: null,
      orderId,
      details: `Order status changed to ${status}`,
      resourceId: orderId,
      resourceType: 'order'
    });
    
    return updatedOrder;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Use memory store instead of PostgreSQL for session storage
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // Order Status History methods
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    const result = await db.select().from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(asc(orderStatusHistory.timestamp));
    return result;
  }
  
  async createOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const [newHistory] = await db.insert(orderStatusHistory)
      .values(history)
      .returning();
    return newHistory;
  }
  
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const [updatedOrder] = await db.update(orders)
      .set({ 
        status, 
        updated: new Date() 
      })
      .where(eq(orders.id, orderId))
      .returning();
      
    if (!updatedOrder) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    // Create an activity log for the status change
    await db.insert(activityLogs).values({
      action: 'order_status_updated',
      userId: null,
      orderId,
      details: `Order status changed to ${status}`,
      resourceId: orderId,
      resourceType: 'order'
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

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order || undefined;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.status, status));
  }

  async getOrdersByKitchen(kitchen: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.kitchenLocation, kitchen));
  }
  
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    // Generate order number (format: AG-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `AG-${dateStr}-${randomChars}`;

    const [order] = await db
      .insert(orders)
      .values({ ...orderData, orderNumber })
      .returning();
    
    return order;
  }

  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set(orderData)
      .where(eq(orders.id, id))
      .returning();
    
    return updatedOrder || undefined;
  }

  async deleteOrder(id: number): Promise<boolean> {
    // First delete all related order items
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    
    // Then delete the order
    const result = await db.delete(orders).where(eq(orders.id, id));
    return result.count > 0;
  }

  // Order Items methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(orderItem).returning();
    return item;
  }

  // Order Templates methods
  async getOrderTemplates(userId: number): Promise<OrderTemplate[]> {
    return await db.select().from(orderTemplates).where(eq(orderTemplates.userId, userId));
  }

  async getOrderTemplate(id: number): Promise<OrderTemplate | undefined> {
    const [template] = await db.select().from(orderTemplates).where(eq(orderTemplates.id, id));
    return template || undefined;
  }

  async createOrderTemplate(template: InsertOrderTemplate): Promise<OrderTemplate> {
    const [newTemplate] = await db.insert(orderTemplates).values(template).returning();
    return newTemplate;
  }

  async updateOrderTemplate(id: number, templateData: Partial<OrderTemplate>): Promise<OrderTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(orderTemplates)
      .set(templateData)
      .where(eq(orderTemplates.id, id))
      .returning();
    
    return updatedTemplate || undefined;
  }

  async deleteOrderTemplate(id: number): Promise<boolean> {
    const result = await db.delete(orderTemplates).where(eq(orderTemplates.id, id));
    return result.count > 0;
  }

  // Menu Items methods
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem || undefined;
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.category, category));
  }

  async getMenuItemsByDietary(dietary: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(sql`${menuItems.dietaryOptions} @> ARRAY[${dietary}]::text[]`);
  }

  async getMenuItemsByKitchen(kitchen: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.kitchenLocation, kitchen));
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [newMenuItem] = await db.insert(menuItems).values(menuItem).returning();
    return newMenuItem;
  }

  async updateMenuItem(id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set(menuItemData)
      .where(eq(menuItems.id, id))
      .returning();
    
    return updatedMenuItem || undefined;
  }
  
  async updateMenuItemPrices(id: number, thessalonikiPrice: number, mykonosPrice: number): Promise<MenuItem | undefined> {
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set({ 
        priceThessaloniki: thessalonikiPrice,
        priceMykonos: mykonosPrice
      })
      .where(eq(menuItems.id, id))
      .returning();
    
    return updatedMenuItem || undefined;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const result = await db.delete(menuItems).where(eq(menuItems.id, id));
    return result.count > 0;
  }

  // Activity Log methods
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getActivityLogs(limit: number): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.created))
      .limit(limit);
  }

  // Aircraft Types methods
  async getAircraftTypes(): Promise<AircraftType[]> {
    return await db.select().from(aircraftTypes);
  }

  // Airports methods
  async getAirports(): Promise<Airport[]> {
    return await db.select().from(airports);
  }

  // Inventory Items methods
  async getInventoryItems(location?: string): Promise<InventoryItem[]> {
    if (location) {
      return await db.select().from(inventoryItems).where(eq(inventoryItems.location, location));
    }
    return await db.select().from(inventoryItems);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async getInventoryItemsByCategory(category: string, location?: string): Promise<InventoryItem[]> {
    if (location) {
      return await db.select().from(inventoryItems).where(
        and(
          eq(inventoryItems.category, category),
          eq(inventoryItems.location, location)
        )
      );
    }
    return await db.select().from(inventoryItems).where(eq(inventoryItems.category, category));
  }

  async getLowStockItems(location?: string): Promise<InventoryItem[]> {
    let query = db.select().from(inventoryItems).where(
      sql`${inventoryItems.currentStock} < ${inventoryItems.reorderLevel}`
    );
    
    if (location) {
      query = query.where(eq(inventoryItems.location, location));
    }
    
    return await query;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db.insert(inventoryItems).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set(item)
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .returning({ id: inventoryItems.id });
    return result.length > 0;
  }

  // Vendors methods
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<Vendor>): Promise<Vendor | undefined> {
    const [updatedVendor] = await db
      .update(vendors)
      .set(vendor)
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor || undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db
      .delete(vendors)
      .where(eq(vendors.id, id))
      .returning({ id: vendors.id });
    return result.length > 0;
  }

  // Menu Item Ingredients methods
  async getMenuItemIngredients(menuItemId: number): Promise<MenuItemIngredient[]> {
    return await db
      .select()
      .from(menuItemIngredients)
      .where(eq(menuItemIngredients.menuItemId, menuItemId));
  }

  async createMenuItemIngredient(ingredient: InsertMenuItemIngredient): Promise<MenuItemIngredient> {
    const [newIngredient] = await db.insert(menuItemIngredients).values(ingredient).returning();
    return newIngredient;
  }

  async updateMenuItemIngredient(id: number, ingredient: Partial<MenuItemIngredient>): Promise<MenuItemIngredient | undefined> {
    const [updatedIngredient] = await db
      .update(menuItemIngredients)
      .set(ingredient)
      .where(eq(menuItemIngredients.id, id))
      .returning();
    return updatedIngredient || undefined;
  }

  async deleteMenuItemIngredient(id: number): Promise<boolean> {
    const result = await db
      .delete(menuItemIngredients)
      .where(eq(menuItemIngredients.id, id))
      .returning({ id: menuItemIngredients.id });
    return result.length > 0;
  }

  // Inventory Transactions methods
  async getInventoryTransactions(inventoryItemId?: number, location?: string): Promise<InventoryTransaction[]> {
    let query = db.select().from(inventoryTransactions);
    
    if (inventoryItemId) {
      query = query.where(eq(inventoryTransactions.inventoryItemId, inventoryItemId));
    }
    
    if (location) {
      query = query.where(eq(inventoryTransactions.location, location));
    }
    
    return await query.orderBy(desc(inventoryTransactions.timestamp));
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [newTransaction] = await db.insert(inventoryTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getInventoryTransactionsByOrder(orderId: number): Promise<InventoryTransaction[]> {
    return await db
      .select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.orderId, orderId))
      .orderBy(desc(inventoryTransactions.timestamp));
  }

  // Purchase Orders methods
  async getPurchaseOrders(location?: string): Promise<PurchaseOrder[]> {
    if (location) {
      return await db
        .select()
        .from(purchaseOrders)
        .where(eq(purchaseOrders.location, location))
        .orderBy(desc(purchaseOrders.createdAt));
    }
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return order || undefined;
  }

  async getPurchaseOrderByNumber(orderNumber: string): Promise<PurchaseOrder | undefined> {
    const [order] = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.orderNumber, orderNumber));
    return order || undefined;
  }

  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [newOrder] = await db.insert(purchaseOrders).values(order).returning();
    return newOrder;
  }

  async updatePurchaseOrder(id: number, order: Partial<PurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [updatedOrder] = await db
      .update(purchaseOrders)
      .set(order)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    const result = await db
      .delete(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .returning({ id: purchaseOrders.id });
    return result.length > 0;
  }

  // Purchase Order Items methods
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId));
  }

  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [newItem] = await db.insert(purchaseOrderItems).values(item).returning();
    return newItem;
  }

  async updatePurchaseOrderItem(id: number, item: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem | undefined> {
    const [updatedItem] = await db
      .update(purchaseOrderItems)
      .set(item)
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deletePurchaseOrderItem(id: number): Promise<boolean> {
    const result = await db
      .delete(purchaseOrderItems)
      .where(eq(purchaseOrderItems.id, id))
      .returning({ id: purchaseOrderItems.id });
    return result.length > 0;
  }

  // Order Annotations methods
  async getOrderAnnotations(orderId: number): Promise<OrderAnnotation[]> {
    return await db.select()
      .from(orderAnnotations)
      .where(eq(orderAnnotations.orderId, orderId))
      .orderBy(asc(orderAnnotations.created));
  }

  async createOrderAnnotation(annotation: InsertOrderAnnotation): Promise<OrderAnnotation> {
    const [result] = await db.insert(orderAnnotations)
      .values(annotation)
      .returning();
    return result;
  }

  async updateOrderAnnotation(id: number, annotationData: Partial<OrderAnnotation>): Promise<OrderAnnotation | undefined> {
    const [updatedAnnotation] = await db.update(orderAnnotations)
      .set({
        ...annotationData,
        updated: new Date()
      })
      .where(eq(orderAnnotations.id, id))
      .returning();
    return updatedAnnotation;
  }

  async deleteOrderAnnotation(id: number): Promise<boolean> {
    const result = await db
      .delete(orderAnnotations)
      .where(eq(orderAnnotations.id, id))
      .returning({ id: orderAnnotations.id });
    
    return result.length > 0;
  }
  
  // Concierge Request methods
  async getAllConciergeRequests(): Promise<ConciergeRequest[]> {
    return await db
      .select()
      .from(conciergeRequests)
      .orderBy(desc(conciergeRequests.created));
  }
  
  async getConciergeRequestsByUser(userId: number): Promise<ConciergeRequest[]> {
    return await db
      .select()
      .from(conciergeRequests)
      .where(eq(conciergeRequests.userId, userId))
      .orderBy(desc(conciergeRequests.created));
  }
  
  async getConciergeRequest(id: number): Promise<ConciergeRequest | undefined> {
    const [result] = await db
      .select()
      .from(conciergeRequests)
      .where(eq(conciergeRequests.id, id));
    
    return result;
  }
  
  async createConciergeRequest(request: InsertConciergeRequest): Promise<ConciergeRequest> {
    const [result] = await db
      .insert(conciergeRequests)
      .values({
        ...request,
        status: 'pending',
      })
      .returning();
    
    // Log activity for this concierge request
    await this.logActivity({
      action: 'concierge_request_created',
      userId: request.userId,
      details: `New concierge service request created: ${request.serviceType}`,
      resourceId: result.id,
      resourceType: 'concierge_request'
    });
    
    return result;
  }
  
  async updateConciergeRequest(id: number, data: Partial<ConciergeRequest>): Promise<ConciergeRequest | undefined> {
    // Get current request to check for status changes
    const currentRequest = await this.getConciergeRequest(id);
    if (!currentRequest) {
      return undefined;
    }
    
    const [result] = await db
      .update(conciergeRequests)
      .set({
        ...data,
        updated: new Date()
      })
      .where(eq(conciergeRequests.id, id))
      .returning();
    
    // If status was changed, log the activity
    if (data.status && data.status !== currentRequest.status) {
      await this.logActivity({
        action: 'concierge_request_status_updated',
        userId: data.adminUserId || currentRequest.userId,
        details: `Concierge request status changed from ${currentRequest.status} to ${data.status}`,
        resourceId: id,
        resourceType: 'concierge_request'
      });
    }
    
    return result;
  }
}

// Switch from memory storage to database storage
export const storage = new DatabaseStorage();