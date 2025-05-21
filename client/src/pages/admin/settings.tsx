import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import AdminLayout from './admin-layout';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, UserPlus } from 'lucide-react';

// Form schema for general settings
const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteUrl: z.string().url('Please enter a valid URL'),
  logoUrl: z.string().optional(),
  defaultLanguage: z.enum(['en', 'el']),
  timezone: z.string(),
});

// Form schema for company info
const companyInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional(),
  website: z.string().url('Please enter a valid URL').optional(),
});

// Form schema for location settings
const locationSettingsSchema = z.object({
  thessalonikiEnabled: z.boolean(),
  mykonosEnabled: z.boolean(),
  thessalonikiAddress: z.string().optional(),
  mykonosAddress: z.string().optional(),
  thessalonikiPhone: z.string().optional(),
  mykonosPhone: z.string().optional(),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type CompanyInfoValues = z.infer<typeof companyInfoSchema>;
type LocationSettingsValues = z.infer<typeof locationSettingsSchema>;

export default function Settings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  
  // Define response types
  interface SettingsResponse {
    general?: {
      siteName: string;
      siteUrl: string;
      logoUrl: string;
      defaultLanguage: string;
      timezone: string;
    };
    company?: {
      companyName: string;
      vatNumber: string;
      address: string;
      phone: string;
      email: string;
      website: string;
    };
    locations?: {
      thessalonikiEnabled: boolean;
      mykonosEnabled: boolean;
      thessalonikiAddress: string;
      mykonosAddress: string;
      thessalonikiPhone: string;
      mykonosPhone: string;
    };
  }

  // General settings form
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: 'Air Gourmet Hellas',
      siteUrl: 'https://www.airgourmethellas.com',
      logoUrl: '',
      defaultLanguage: 'en',
      timezone: 'Europe/Athens',
    }
  });

  // Company info form
  const companyForm = useForm<CompanyInfoValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: 'Air Gourmet Hellas',
      vatNumber: '',
      address: '',
      phone: '',
      email: 'info@airgourmet.gr',
      website: 'https://www.airgourmet.gr',
    }
  });

  // Location settings form
  const locationForm = useForm<LocationSettingsValues>({
    resolver: zodResolver(locationSettingsSchema),
    defaultValues: {
      thessalonikiEnabled: true,
      mykonosEnabled: true,
      thessalonikiAddress: '',
      mykonosAddress: '',
      thessalonikiPhone: '',
      mykonosPhone: '',
    }
  });

  // Query for settings data
  const { isLoading, data } = useQuery({
    queryKey: ['/api/admin/settings']
  }) as { isLoading: boolean, data: SettingsResponse | undefined };
  
  // Handle form reset when data is loaded
  React.useEffect(() => {
    if (data?.general) {
      const generalData = {
        ...data.general,
        defaultLanguage: data.general.defaultLanguage as "en" | "el"
      };
      generalForm.reset(generalData);
    }
    if (data?.company) {
      companyForm.reset(data.company);
    }
    if (data?.locations) {
      locationForm.reset(data.locations);
    }
  }, [data, generalForm, companyForm, locationForm]);

  // Mutation for saving general settings
  const generalMutation = useMutation({
    mutationFn: async (data: GeneralSettingsValues) => {
      const response = await fetch('/api/admin/settings/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'General settings have been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for saving company info
  const companyMutation = useMutation({
    mutationFn: async (data: CompanyInfoValues) => {
      const response = await fetch('/api/admin/settings/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save company info');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Company info saved',
        description: 'Company information has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error saving company info',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for saving location settings
  const locationMutation = useMutation({
    mutationFn: async (data: LocationSettingsValues) => {
      const response = await fetch('/api/admin/settings/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save location settings');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Location settings saved',
        description: 'Location settings have been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error saving location settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handlers
  const onGeneralSubmit = (data: GeneralSettingsValues) => {
    generalMutation.mutate(data);
  };

  const onCompanySubmit = (data: CompanyInfoValues) => {
    companyMutation.mutate(data);
  };

  const onLocationSubmit = (data: LocationSettingsValues) => {
    locationMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('settingsTitle', 'Settings')}</h2>
          <p className="text-muted-foreground">
            {t('settingsDescription', 'Manage system and company settings')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t('generalSettings', 'General')}</TabsTrigger>
          <TabsTrigger value="company">{t('companyInfo', 'Company Info')}</TabsTrigger>
          <TabsTrigger value="locations">{t('locationSettings', 'Locations')}</TabsTrigger>
          <TabsTrigger value="users">{t('userManagement', 'Users')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('generalSettings', 'General Settings')}</CardTitle>
              <CardDescription>
                {t('generalSettingsDescription', 'Configure basic system settings')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('siteName', 'Site Name')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Air Gourmet Hellas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="siteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('siteUrl', 'Site URL')}</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.airgourmethellas.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('logoUrl', 'Logo URL')}</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="defaultLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('defaultLanguage', 'Default Language')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="el">Greek</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={generalForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('timezone', 'Timezone')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Europe/Athens">Europe/Athens</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={generalMutation.isPending}
                    className="mt-4"
                  >
                    {generalMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving', 'Saving...')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('saveSettings', 'Save Settings')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('companyInfo', 'Company Information')}</CardTitle>
              <CardDescription>
                {t('companyInfoDescription', 'Configure company details and contact information')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                  <FormField
                    control={companyForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('companyName', 'Company Name')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Air Gourmet Hellas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="vatNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('vatNumber', 'VAT Number')}</FormLabel>
                        <FormControl>
                          <Input placeholder="EL123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('address', 'Address')}</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 Street, City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('phone', 'Phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder="+30 123 456 7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('email', 'Email')}</FormLabel>
                        <FormControl>
                          <Input placeholder="info@airgourmet.gr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('website', 'Website')}</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.airgourmet.gr" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={companyMutation.isPending}
                    className="mt-4"
                  >
                    {companyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving', 'Saving...')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('saveInfo', 'Save Information')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('locationSettings', 'Location Settings')}</CardTitle>
              <CardDescription>
                {t('locationSettingsDescription', 'Configure operational locations')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...locationForm}>
                <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Thessaloniki (SKG)</h3>
                      
                      <FormField
                        control={locationForm.control}
                        name="thessalonikiEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>{t('locationEnabled', 'Location Enabled')}</FormLabel>
                              <FormDescription>
                                {t('locationEnabledDescription', 'Allow orders and operations for this location')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={locationForm.control}
                        name="thessalonikiAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('locationAddress', 'Address')}</FormLabel>
                            <FormControl>
                              <Input placeholder="Address in Thessaloniki" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={locationForm.control}
                        name="thessalonikiPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('locationPhone', 'Phone')}</FormLabel>
                            <FormControl>
                              <Input placeholder="+30 123 456 7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Mykonos (JMK)</h3>
                      
                      <FormField
                        control={locationForm.control}
                        name="mykonosEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>{t('locationEnabled', 'Location Enabled')}</FormLabel>
                              <FormDescription>
                                {t('locationEnabledDescription', 'Allow orders and operations for this location')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={locationForm.control}
                        name="mykonosAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('locationAddress', 'Address')}</FormLabel>
                            <FormControl>
                              <Input placeholder="Address in Mykonos" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={locationForm.control}
                        name="mykonosPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('locationPhone', 'Phone')}</FormLabel>
                            <FormControl>
                              <Input placeholder="+30 123 456 7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={locationMutation.isPending}
                    className="mt-4"
                  >
                    {locationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('saving', 'Saving...')}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('saveLocations', 'Save Locations')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('userManagement', 'User Management')}</CardTitle>
              <CardDescription>
                {t('userManagementDescription', 'Manage system users and their roles')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('addUser', 'Add User')}
                </Button>
                
                <p className="text-muted-foreground py-4">
                  {t('userManagementNotImplemented', 'User management functionality will be implemented in a future update.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}