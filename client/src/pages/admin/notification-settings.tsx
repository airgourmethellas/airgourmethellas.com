import React, { useState, useEffect } from "react";
import { useQuery, useMutation, UseQueryOptions } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import AdminLayout from "./admin-layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, RefreshCw } from "lucide-react";
import NotificationTester from "@/components/admin/notification-tester";

// Form schema
const emailFormSchema = z.object({
  sendgridApiKey: z.string().min(1, "API key is required"),
  fromEmail: z.string().email("Must be a valid email"),
  opsEmail: z.string().email("Must be a valid email"),
  kitchenEmailThessaloniki: z.string().email("Must be a valid email"),
  kitchenEmailMykonos: z.string().email("Must be a valid email"),
  deliveryEmail: z.string().email("Must be a valid email"),
});

const notificationSettingsSchema = z.object({
  newOrderToOps: z.boolean().default(true),
  newOrderToKitchen: z.boolean().default(true),
  orderUpdateToClient: z.boolean().default(true),
  orderUpdateToKitchen: z.boolean().default(true),
  orderCancelToKitchen: z.boolean().default(true),
  orderReadyToClient: z.boolean().default(true),
  orderReadyToDelivery: z.boolean().default(true),
  orderDeliveredToClient: z.boolean().default(true),
  orderDeliveredToOps: z.boolean().default(true),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

export default function NotificationSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("email");

  // Email settings form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      sendgridApiKey: "",
      fromEmail: "orders@airgourmet.gr",
      opsEmail: "ops@airgourmet.gr",
      kitchenEmailThessaloniki: "kitchen-thessaloniki@airgourmet.gr",
      kitchenEmailMykonos: "kitchen-mykonos@airgourmet.gr",
      deliveryEmail: "delivery@airgourmet.gr",
    },
  });

  // Notification settings form
  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      newOrderToOps: true,
      newOrderToKitchen: true,
      orderUpdateToClient: true,
      orderUpdateToKitchen: true,
      orderCancelToKitchen: true,
      orderReadyToClient: true,
      orderReadyToDelivery: true,
      orderDeliveredToClient: true,
      orderDeliveredToOps: true,
    },
  });

  // Define the shape of our API response for type safety
  interface NotificationSettingsResponse {
    email?: {
      sendgridApiKey?: string;
      fromEmail?: string;
      opsEmail?: string;
      kitchenEmailThessaloniki?: string;
      kitchenEmailMykonos?: string;
      deliveryEmail?: string;
      clientsEmail?: string;
    };
    notifications?: {
      newOrderToOps?: boolean;
      newOrderToKitchen?: boolean;
      orderUpdateToOps?: boolean;
      orderUpdateToKitchen?: boolean;
      orderUpdateToClient?: boolean;
      orderCancelledToOps?: boolean;
      orderCancelledToKitchen?: boolean;
      orderCancelledToClient?: boolean;
      orderReadyToOps?: boolean;
      orderReadyToClient?: boolean;
      orderDeliveredToOps?: boolean;
    };
  }

  // Query for current settings with proper type annotation
  const { isLoading, isError, error, data } = useQuery<NotificationSettingsResponse>({
    queryKey: ["/api/admin/notification-settings"]
  });

  // Handle data changes when the query completes successfully
  useEffect(() => {
    if (data) {
      // Update both forms with the received data
      if (data.email) {
        emailForm.reset({
          sendgridApiKey: data.email.sendgridApiKey || "",
          fromEmail: data.email.fromEmail || "orders@airgourmet.gr",
          opsEmail: data.email.opsEmail || "ops@airgourmet.gr",
          kitchenEmailThessaloniki: data.email.kitchenEmailThessaloniki || "kitchen-thessaloniki@airgourmet.gr",
          kitchenEmailMykonos: data.email.kitchenEmailMykonos || "kitchen-mykonos@airgourmet.gr",
          deliveryEmail: data.email.deliveryEmail || "delivery@airgourmet.gr",
          clientsEmail: data.email.clientsEmail || "clients@airgourmet.gr",
        });
      }
      
      if (data.notifications) {
        notificationForm.reset(data.notifications);
      }
    }
  }, [data]);

  // Mutation for saving email settings
  const emailMutation = useMutation({
    mutationFn: async (data: EmailFormValues) => {
      const response = await fetch("/api/admin/notification-settings/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save email settings");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email settings saved",
        description: "Your notification email settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notification-settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for saving notification settings
  const notificationMutation = useMutation({
    mutationFn: async (data: NotificationSettingsValues) => {
      const response = await fetch("/api/admin/notification-settings/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save notification settings");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings saved",
        description: "Your notification preferences have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notification-settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Email settings submission
  const onEmailSubmit = (data: EmailFormValues) => {
    emailMutation.mutate(data);
  };

  // Notification settings submission
  const onNotificationSubmit = (data: NotificationSettingsValues) => {
    notificationMutation.mutate(data);
  };

  // Test connection to SendGrid
  const testConnection = async () => {
    try {
      const response = await fetch("/api/admin/notification-settings/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailForm.getValues()),
      });
      
      if (!response.ok) {
        throw new Error("Failed to connect to SendGrid");
      }
      
      toast({
        title: "Connection successful",
        description: "Successfully connected to SendGrid API.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Notification Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="email">Email Configuration</TabsTrigger>
            <TabsTrigger value="notifications">Notification Preferences</TabsTrigger>
            <TabsTrigger value="testing">Test Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure the email addresses and API keys used for sending notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="sendgridApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SendGrid API Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="API Key" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input placeholder="orders@airgourmet.gr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="opsEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operations Team Email</FormLabel>
                          <FormControl>
                            <Input placeholder="ops@airgourmet.gr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="kitchenEmailThessaloniki"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thessaloniki Kitchen Email</FormLabel>
                          <FormControl>
                            <Input placeholder="kitchen-thessaloniki@airgourmet.gr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="kitchenEmailMykonos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mykonos Kitchen Email</FormLabel>
                          <FormControl>
                            <Input placeholder="kitchen-mykonos@airgourmet.gr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="deliveryEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Team Email</FormLabel>
                          <FormControl>
                            <Input placeholder="delivery@airgourmet.gr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={emailMutation.isPending}
                      >
                        {emailMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Settings
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={testConnection}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Test Connection
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose which types of notifications should be sent and to whom.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">New Orders</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="newOrderToOps"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify operations team of new orders
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="newOrderToKitchen"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify kitchen staff of new orders
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <h3 className="font-medium text-lg mt-6">Order Updates</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="orderUpdateToClient"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify clients of order updates
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="orderUpdateToKitchen"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify kitchen of order updates
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium text-lg">Cancellations</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="orderCancelToKitchen"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify kitchen of cancelled orders
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <h3 className="font-medium text-lg mt-6">Order Ready</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="orderReadyToClient"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify clients when order is ready
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="orderReadyToDelivery"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify delivery team when order is ready
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <h3 className="font-medium text-lg mt-6">Order Delivered</h3>
                        
                        <FormField
                          control={notificationForm.control}
                          name="orderDeliveredToClient"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify clients when order is delivered
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="orderDeliveredToOps"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Notify operations when order is delivered
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-6"
                      disabled={notificationMutation.isPending}
                    >
                      {notificationMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="testing">
            <NotificationTester />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}