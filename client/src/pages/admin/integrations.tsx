import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Define form schema
const zapierFormSchema = z.object({
  webhookUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .min(5, { message: "Webhook URL is required" }),
  events: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You must select at least one event",
  }),
});

type ZapierFormValues = z.infer<typeof zapierFormSchema>;

export default function Integrations() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");

  // Fetch current Zapier configuration
  const { data: zapierConfig, isLoading } = useQuery({
    queryKey: ["/api/integrations/zapier"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/integrations/zapier");
        if (response.ok) {
          return await response.json();
        }
        return { webhookUrl: "", events: [] };
      } catch (error) {
        console.error("Error fetching Zapier config:", error);
        return { webhookUrl: "", events: [] };
      }
    },
  });

  // Define form
  const form = useForm<ZapierFormValues>({
    resolver: zodResolver(zapierFormSchema),
    defaultValues: {
      webhookUrl: "",
      events: [],
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (zapierConfig && !form.formState.isDirty) {
      form.reset({
        webhookUrl: zapierConfig.webhookUrl || "",
        events: zapierConfig.events || [],
      });
    }
  }, [zapierConfig, form]);

  // Define mutation for saving config
  const saveConfigMutation = useMutation({
    mutationFn: async (data: ZapierFormValues) => {
      const response = await apiRequest("POST", "/api/integrations/zapier", data);
      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Zapier integration configuration saved",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/zapier"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  // Define mutation for testing webhook
  const testWebhookMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/integrations/zapier/test", {
        webhookUrl: form.getValues("webhookUrl"),
      });
      if (!response.ok) {
        throw new Error("Failed to test webhook");
      }
      return await response.json();
    },
    onSuccess: () => {
      setTestStatus("success");
      setTimeout(() => setTestStatus("idle"), 3000);
    },
    onError: () => {
      setTestStatus("error");
      setTimeout(() => setTestStatus("idle"), 3000);
    },
  });

  // Form submit handler
  const onSubmit = (data: ZapierFormValues) => {
    saveConfigMutation.mutate(data);
  };

  // Test connection handler
  const testConnection = () => {
    if (form.getValues("webhookUrl")) {
      testWebhookMutation.mutate();
    } else {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
    }
  };

  // Available events options
  const eventsOptions = [
    { id: "order_created", label: t("integrations.zapier.eventOrderCreated") },
    { id: "order_updated", label: t("integrations.zapier.eventOrderUpdated") },
    { id: "order_cancelled", label: t("integrations.zapier.eventOrderCancelled") },
  ];

  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("integrations.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("integrations.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("integrations.zapier.title")}</CardTitle>
              <CardDescription>{t("integrations.zapier.description")}</CardDescription>
            </div>
            <Zap className="h-6 w-6 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          {testStatus === "success" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {t("integrations.zapier.testSuccess")}
              </AlertDescription>
            </Alert>
          )}

          {testStatus === "error" && (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <X className="h-4 w-4 text-red-500" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {t("integrations.zapier.testError")}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("integrations.zapier.webhookUrl")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("integrations.zapier.webhookUrlPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="events"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>{t("integrations.zapier.events")}</FormLabel>
                    </div>
                    {eventsOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="events"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.id}
                              className="flex flex-row items-start space-x-3 space-y-0 p-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={testConnection}
            disabled={
              testWebhookMutation.isPending ||
              !form.getValues("webhookUrl")
            }
          >
            {testWebhookMutation.isPending ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Testing...
              </span>
            ) : (
              t("integrations.zapier.test")
            )}
          </Button>

          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={saveConfigMutation.isPending || !form.formState.isDirty}
          >
            {saveConfigMutation.isPending ? (
              <span className="flex items-center">
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Saving...
              </span>
            ) : (
              t("integrations.zapier.save")
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}