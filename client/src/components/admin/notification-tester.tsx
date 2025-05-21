import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

const testEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const testOrderSchema = z.object({
  orderId: z.string().min(1, "Please enter an order ID"),
  notificationType: z.enum([
    "NEW_ORDER", 
    "ORDER_UPDATED", 
    "ORDER_CANCELLED", 
    "ORDER_READY", 
    "ORDER_DELIVERED"
  ]),
  recipientType: z.enum(["client", "internal"]),
});

type TestEmailValues = z.infer<typeof testEmailSchema>;
type TestOrderValues = z.infer<typeof testOrderSchema>;

export default function NotificationTester() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("email");
  
  // Form for testing a direct email
  const emailForm = useForm<TestEmailValues>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      email: "",
    },
  });
  
  // Form for testing an order notification
  const orderForm = useForm<TestOrderValues>({
    resolver: zodResolver(testOrderSchema),
    defaultValues: {
      orderId: "",
      notificationType: "NEW_ORDER",
      recipientType: "client",
    },
  });
  
  // Mutation for testing direct email
  const testEmailMutation = useMutation({
    mutationFn: async (data: TestEmailValues) => {
      const response = await fetch("/api/test-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send test email");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "A test email has been sent successfully.",
      });
      emailForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for testing order notification
  const testOrderMutation = useMutation({
    mutationFn: async (data: TestOrderValues) => {
      const response = await fetch("/api/test-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: data.orderId,
          type: data.notificationType,
          recipientType: data.recipientType,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send order notification");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "The order notification has been sent successfully.",
      });
      orderForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle email form submission
  const onEmailSubmit = (data: TestEmailValues) => {
    testEmailMutation.mutate(data);
  };
  
  // Handle order form submission
  const onOrderSubmit = (data: TestOrderValues) => {
    testOrderMutation.mutate(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Test Notifications</CardTitle>
        <CardDescription>
          Send test notifications to verify the email and notification system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="email">Test Email</TabsTrigger>
            <TabsTrigger value="order">Test Order Notification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@airgourmet.gr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={testEmailMutation.isPending}
                >
                  {testEmailMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="order" className="space-y-4">
            <Form {...orderForm}>
              <form onSubmit={orderForm.handleSubmit(onOrderSubmit)} className="space-y-4">
                <FormField
                  control={orderForm.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID</FormLabel>
                      <FormControl>
                        <Input placeholder="1" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="notificationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a notification type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NEW_ORDER">New Order</SelectItem>
                          <SelectItem value="ORDER_UPDATED">Order Updated</SelectItem>
                          <SelectItem value="ORDER_CANCELLED">Order Cancelled</SelectItem>
                          <SelectItem value="ORDER_READY">Order Ready</SelectItem>
                          <SelectItem value="ORDER_DELIVERED">Order Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="recipientType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Recipient Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="client" id="client" />
                            <label htmlFor="client" className="text-sm font-medium leading-none">
                              Client-facing
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="internal" id="internal" />
                            <label htmlFor="internal" className="text-sm font-medium leading-none">
                              Internal Team
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={testOrderMutation.isPending}
                >
                  {testOrderMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Notification
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}