import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import PageTitle from '../../components/page-title';

const conciergeRequestSchema = z.object({
  requestType: z.string({
    required_error: "Please select a service type",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  deliveryDate: z.date({
    required_error: "Please select a date",
  }),
  deliveryTime: z.string({
    required_error: "Please specify a time",
  }),
  deliveryLocation: z.string({
    required_error: "Please provide a delivery location",
  }),
  specialInstructions: z.string().optional(),
  urgentRequest: z.boolean().default(false),
  acceptCancellationPolicy: z.boolean({
    required_error: "You must accept the cancellation policy",
  }).refine(val => val === true, {
    message: "You must confirm the cancellation policy to proceed",
  }),
});

type ConciergeRequestFormData = z.infer<typeof conciergeRequestSchema>;

const ConciergeServicesPage: React.FC = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const form = useForm<ConciergeRequestFormData>({
    resolver: zodResolver(conciergeRequestSchema),
    defaultValues: {
      specialInstructions: '',
      urgentRequest: false,
      acceptCancellationPolicy: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ConciergeRequestFormData) => {
      // Format the date for API submission
      const formattedData = {
        ...data,
        deliveryDate: format(data.deliveryDate, 'yyyy-MM-dd'),
      };
      
      const response = await apiRequest('POST', '/api/concierge/request', formattedData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t('concierge.requestSuccess'),
        description: t('concierge.requestSuccessDescription'),
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t('concierge.requestError'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ConciergeRequestFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8">
      <PageTitle 
        title={t('concierge.title')} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Form</CardTitle>
              <CardDescription>Fill out this form to request our premium services</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('concierge.selectServiceType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="newspapers_magazines">{t('concierge.newspapersMagazines')}</SelectItem>
                            <SelectItem value="laundry_ironing">{t('concierge.laundryIroning')}</SelectItem>
                            <SelectItem value="equipment_washing">{t('concierge.equipmentWashing')}</SelectItem>
                            <SelectItem value="storage_solutions">{t('concierge.storageSolutions')}</SelectItem>
                            <SelectItem value="flower_arrangements">{t('concierge.flowerArrangements')}</SelectItem>
                            <SelectItem value="cabin_supplies">{t('concierge.cabinSupplies')}</SelectItem>
                            <SelectItem value="toiletries_kitchen">{t('concierge.toiletriesKitchen')}</SelectItem>
                            <SelectItem value="alcoholic_beverages">{t('concierge.alcoholicBeverages')}</SelectItem>
                            <SelectItem value="custom_request">{t('concierge.customRequest')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t('concierge.serviceTypeDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('concierge.descriptionPlaceholder')}
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('concierge.descriptionHelp')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full pl-3 text-left font-normal flex justify-between items-center"
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>{t('concierge.selectDate')}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time (24-hour format)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[200px]">
                              <SelectItem value="00:00">00:00 (12:00 AM)</SelectItem>
                              <SelectItem value="00:30">00:30 (12:30 AM)</SelectItem>
                              <SelectItem value="01:00">01:00 (1:00 AM)</SelectItem>
                              <SelectItem value="01:30">01:30 (1:30 AM)</SelectItem>
                              <SelectItem value="02:00">02:00 (2:00 AM)</SelectItem>
                              <SelectItem value="02:30">02:30 (2:30 AM)</SelectItem>
                              <SelectItem value="03:00">03:00 (3:00 AM)</SelectItem>
                              <SelectItem value="03:30">03:30 (3:30 AM)</SelectItem>
                              <SelectItem value="04:00">04:00 (4:00 AM)</SelectItem>
                              <SelectItem value="04:30">04:30 (4:30 AM)</SelectItem>
                              <SelectItem value="05:00">05:00 (5:00 AM)</SelectItem>
                              <SelectItem value="05:30">05:30 (5:30 AM)</SelectItem>
                              <SelectItem value="06:00">06:00 (6:00 AM)</SelectItem>
                              <SelectItem value="06:30">06:30 (6:30 AM)</SelectItem>
                              <SelectItem value="07:00">07:00 (7:00 AM)</SelectItem>
                              <SelectItem value="07:30">07:30 (7:30 AM)</SelectItem>
                              <SelectItem value="08:00">08:00 (8:00 AM)</SelectItem>
                              <SelectItem value="08:30">08:30 (8:30 AM)</SelectItem>
                              <SelectItem value="09:00">09:00 (9:00 AM)</SelectItem>
                              <SelectItem value="09:30">09:30 (9:30 AM)</SelectItem>
                              <SelectItem value="10:00">10:00 (10:00 AM)</SelectItem>
                              <SelectItem value="10:30">10:30 (10:30 AM)</SelectItem>
                              <SelectItem value="11:00">11:00 (11:00 AM)</SelectItem>
                              <SelectItem value="11:30">11:30 (11:30 AM)</SelectItem>
                              <SelectItem value="12:00">12:00 (12:00 PM)</SelectItem>
                              <SelectItem value="12:30">12:30 (12:30 PM)</SelectItem>
                              <SelectItem value="13:00">13:00 (1:00 PM)</SelectItem>
                              <SelectItem value="13:30">13:30 (1:30 PM)</SelectItem>
                              <SelectItem value="14:00">14:00 (2:00 PM)</SelectItem>
                              <SelectItem value="14:30">14:30 (2:30 PM)</SelectItem>
                              <SelectItem value="15:00">15:00 (3:00 PM)</SelectItem>
                              <SelectItem value="15:30">15:30 (3:30 PM)</SelectItem>
                              <SelectItem value="16:00">16:00 (4:00 PM)</SelectItem>
                              <SelectItem value="16:30">16:30 (4:30 PM)</SelectItem>
                              <SelectItem value="17:00">17:00 (5:00 PM)</SelectItem>
                              <SelectItem value="17:30">17:30 (5:30 PM)</SelectItem>
                              <SelectItem value="18:00">18:00 (6:00 PM)</SelectItem>
                              <SelectItem value="18:30">18:30 (6:30 PM)</SelectItem>
                              <SelectItem value="19:00">19:00 (7:00 PM)</SelectItem>
                              <SelectItem value="19:30">19:30 (7:30 PM)</SelectItem>
                              <SelectItem value="20:00">20:00 (8:00 PM)</SelectItem>
                              <SelectItem value="20:30">20:30 (8:30 PM)</SelectItem>
                              <SelectItem value="21:00">21:00 (9:00 PM)</SelectItem>
                              <SelectItem value="21:30">21:30 (9:30 PM)</SelectItem>
                              <SelectItem value="22:00">22:00 (10:00 PM)</SelectItem>
                              <SelectItem value="22:30">22:30 (10:30 PM)</SelectItem>
                              <SelectItem value="23:00">23:00 (11:00 PM)</SelectItem>
                              <SelectItem value="23:30">23:30 (11:30 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>24-hour format (e.g., 15:30 for 3:30 PM)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deliveryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Thessaloniki">Thessaloniki (SKG)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Premium concierge services are currently only available in Thessaloniki.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('concierge.specialInstructionsPlaceholder')}
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('concierge.specialInstructionsHelp')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <FormField
                    control={form.control}
                    name="acceptCancellationPolicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Advanced Notice Confirmation
                          </FormLabel>
                          <FormDescription>
                            I am confirming that I am placing this order 24 hrs in advance, unless specifically confirmed by AirGourmet via email.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('concierge.submitting')}
                      </>
                    ) : (
                      t('concierge.submit')
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('concierge.serviceInfo')}</CardTitle>
              <CardDescription>{t('concierge.serviceInfoDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold mb-3">Our Comprehensive Service Offerings Include:</h3>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.newspapersMagazines')}</h3>
                <p className="text-sm text-muted-foreground">
                  Stay informed and entertained with your choice of publications.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.laundryIroning')}</h3>
                <p className="text-sm text-muted-foreground">
                  Impeccable garment care for a pristine appearance.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.equipmentWashing')}</h3>
                <p className="text-sm text-muted-foreground">
                  Ensuring cleanliness and hygiene for all your equipment.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.storageSolutions')}</h3>
                <p className="text-sm text-muted-foreground">
                  Safe and secure storage options for your convenience.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.flowerArrangements')}</h3>
                <p className="text-sm text-muted-foreground">
                  Enhance your space with bespoke floral designs.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.cabinSupplies')}</h3>
                <p className="text-sm text-muted-foreground">
                  All essential supplies to ensure a comfortable journey.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.toiletriesKitchen')}</h3>
                <p className="text-sm text-muted-foreground">
                  High-quality essentials for your personal and culinary needs.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.alcoholicBeverages')}</h3>
                <p className="text-sm text-muted-foreground">
                  A curated selection of exclusive alcoholic beverages and wines to suit your refined tastes.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">{t('concierge.customRequest')}</h3>
                <p className="text-sm text-muted-foreground">
                  Have additional requirements not listed above? Our concierge team specializes in fulfilling bespoke requests. Contact us with your specific needs.
                </p>
              </div>
              

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConciergeServicesPage;