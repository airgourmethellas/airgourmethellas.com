import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { OrderFormData } from "@/pages/client/new-order";
import { AircraftType, Airport } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

// Define the flight details schema
const flightDetailsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  tailNumber: z.string().min(1, "Tail number is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  departureAirport: z.string().min(1, "Departure airport is required"),
  arrivalAirport: z.string().optional(),
  passengerCount: z.coerce.number().min(1, "At least 1 passenger is required"),
  crewCount: z.coerce.number().min(1, "At least 1 crew member is required"),
  dietaryRequirements: z.array(z.string()).min(1, "At least one dietary requirement must be selected"),
  specialNotes: z.string().optional(),
  deliveryLocation: z.string().min(1, "Delivery location is required"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  deliveryInstructions: z.string().optional(),
  documents: z.any().optional(), // File uploads need custom handling
});

type FlightDetailsFormValues = z.infer<typeof flightDetailsSchema>;

interface FlightDetailsProps {
  formData: OrderFormData;
  onFormDataChange: (data: Partial<OrderFormData>) => void;
  onNext: () => void;
  aircraftTypes: AircraftType[];
  airports: Airport[];
}

export default function FlightDetails({ 
  formData, 
  onFormDataChange, 
  onNext,
  aircraftTypes,
  airports 
}: FlightDetailsProps) {
  const { t } = useLanguage();
  const form = useForm<FlightDetailsFormValues>({
    resolver: zodResolver(flightDetailsSchema),
    defaultValues: {
      companyName: formData.aircraftType, // Using aircraftType field for backward compatibility
      tailNumber: formData.tailNumber,
      registrationNumber: formData.registrationNumber || "",
      departureDate: formData.departureDate,
      departureTime: formData.departureTime,
      departureAirport: formData.departureAirport,
      arrivalAirport: formData.arrivalAirport,
      passengerCount: formData.passengerCount,
      crewCount: formData.crewCount,
      dietaryRequirements: formData.dietaryRequirements,
      specialNotes: formData.specialNotes,
      deliveryLocation: formData.deliveryLocation,
      deliveryTime: formData.deliveryTime,
      deliveryInstructions: formData.deliveryInstructions,
      documents: formData.documents,
    },
  });

  const dietaryOptions = [
    { id: "regular", label: "Regular" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "kosher", label: "Kosher" },
    { id: "halal", label: "Halal" },
    { id: "gluten-free", label: "Gluten-Free" },
    { id: "keto", label: "Keto" },
  ];

  // Delivery locations (based on the design)
  const deliveryLocations = [
    "FBO - Thessaloniki International",
    "FBO - Mykonos International",
    "Hangar 3 - Thessaloniki",
    "Private Terminal - Mykonos",
    "Other (Please specify in notes)",
  ];

  // Handle form submission
  function onSubmit(data: FlightDetailsFormValues) {
    // Map companyName to both fields for backward compatibility
    const formattedData = {
      ...data,
      aircraftType: data.companyName,
      companyName: data.companyName,
      registrationNumber: data.registrationNumber
    };
    
    // Handle file uploads - if a single file was uploaded, put it in an array
    let documents: File[] = [];
    if (data.documents) {
      // If it's a single file, convert to array
      if (!Array.isArray(data.documents)) {
        documents = [data.documents as File];
      } else {
        documents = data.documents as File[];
      }
    }
    
    // @ts-ignore - TypeScript doesn't know about the aircraftType field
    onFormDataChange({...formattedData, documents});
    
    // Set the kitchen location based on the departure airport (SKG=Thessaloniki or JMK=Mykonos)
    const kitchenLocation = data.departureAirport === "JMK" ? "Mykonos" : "Thessaloniki";
    onFormDataChange({ kitchenLocation });
    
    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Flight Information */}
        <div className="space-y-6">
          <div className="grid grid-cols-6 gap-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>{t('order.companyName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('order.companyNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tailNumber"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>{t('order.tailNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder="N12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>{t('order.registrationNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('order.registrationNumberPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>Departure Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departureTime"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>Departure Time (Local)</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      required
                      step="60"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>24-hour military time format (e.g., 14:00 for 2:00 PM)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departureAirport"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>{t('order.departureAirport')}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('order.departureAirportPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SKG">{t('airport.thessaloniki')}</SelectItem>
                      <SelectItem value="JMK">{t('airport.mykonos')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="arrivalAirport"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>{t('order.arrivalAirport')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('order.arrivalAirportPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Passenger Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Passenger Information</h3>
          
          <div className="grid grid-cols-6 gap-6">
            <FormField
              control={form.control}
              name="passengerCount"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>Number of Passengers</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crewCount"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>Number of Crew</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-6">
              <FormField
                control={form.control}
                name="dietaryRequirements"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Dietary Requirements</FormLabel>
                      <FormDescription>
                        Select all that apply
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {dietaryOptions.map((option) => (
                        <FormField
                          key={option.id}
                          control={form.control}
                          name="dietaryRequirements"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.id}
                                className="flex items-start space-x-2"
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
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialNotes"
              render={({ field }) => (
                <FormItem className="col-span-6">
                  <FormLabel>Special Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any allergies or special requirements"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Delivery Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Delivery Information</h3>
          
          <div className="grid grid-cols-6 gap-6">
            <FormField
              control={form.control}
              name="deliveryLocation"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>Delivery Location</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deliveryLocations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryTime"
              render={({ field }) => (
                <FormItem className="col-span-6 sm:col-span-3">
                  <FormLabel>Requested Delivery Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      required
                      step="60"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>24-hour military time format (e.g., 14:00 for 2:00 PM)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryInstructions"
              render={({ field }) => (
                <FormItem className="col-span-6">
                  <FormLabel>Delivery Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific instructions for delivery"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Document Upload Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{t('order.documentUpload')}</h3>
          
          <div className="grid grid-cols-6 gap-6">
            <FormField
              control={form.control}
              name="documents"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem className="col-span-6">
                  <FormLabel>{t('order.documentUpload')}</FormLabel>
                  <FormDescription>
                    {t('order.documentUploadDescription')}
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end py-4 mt-6 border-t border-gray-200">
          <Button type="submit" size="lg" className="px-8 py-6 text-base">
            {t('common.next')}: {t('order.menuSelection')}
          </Button>
        </div>
      </form>
    </Form>
  );
}