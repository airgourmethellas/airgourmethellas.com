import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import InventoryItems from "@/components/admin/inventory/inventory-items";
import Vendors from "@/components/admin/inventory/vendors";
import PurchaseOrders from "@/components/admin/inventory/purchase-orders";
import LowStockItems from "@/components/admin/inventory/low-stock-items";
import { useTranslation } from "@/hooks/use-language";

export default function InventoryManagement() {
  const { t } = useTranslation();
  const [activeLocation, setActiveLocation] = useState<string>("SKG"); // Default to Thessaloniki
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Only admin and kitchen staff should have access to this page
  if (user && !["admin", "kitchen"].includes(user.role)) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{t("Unauthorized Access")}</h2>
        </div>
        <p>{t("You do not have permission to access this page.")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("Inventory Management")}</h2>
        <div className="flex items-center gap-2">
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${activeLocation === "SKG" ? "bg-primary text-white" : "bg-secondary"}`} 
            onClick={() => setActiveLocation("SKG")}
          >
            {t("Thessaloniki")} (SKG)
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${activeLocation === "JMK" ? "bg-primary text-white" : "bg-secondary"}`} 
            onClick={() => setActiveLocation("JMK")}
          >
            {t("Mykonos")} (JMK)
          </button>
        </div>
      </div>
      
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-2 h-auto">
          <TabsTrigger value="inventory" className="py-2">
            {t("Inventory Items")}
          </TabsTrigger>
          <TabsTrigger value="low-stock" className="py-2">
            {t("Low Stock Items")}
          </TabsTrigger>
          <TabsTrigger value="vendors" className="py-2">
            {t("Vendors")}
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="py-2">
            {t("Purchase Orders")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Inventory Items")}</CardTitle>
              <CardDescription>
                {t("Manage your inventory items for")} {activeLocation === "SKG" ? t("Thessaloniki") : t("Mykonos")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryItems location={activeLocation} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Low Stock Items")}</CardTitle>
              <CardDescription>
                {t("Items that need to be restocked for")} {activeLocation === "SKG" ? t("Thessaloniki") : t("Mykonos")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LowStockItems location={activeLocation} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Vendors")}</CardTitle>
              <CardDescription>
                {t("Manage your suppliers and vendors")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Vendors />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchase-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Purchase Orders")}</CardTitle>
              <CardDescription>
                {t("Manage purchase orders for")} {activeLocation === "SKG" ? t("Thessaloniki") : t("Mykonos")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseOrders location={activeLocation} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}