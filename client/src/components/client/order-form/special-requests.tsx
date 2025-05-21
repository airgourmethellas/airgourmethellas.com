import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { OrderFormData, OrderDocument } from "@/pages/client/new-order";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import OrderSummaryDisplay from "./order-summary-display";

interface SpecialRequestsProps {
  formData: OrderFormData;
  onFormDataChange: (data: Partial<OrderFormData>) => void;
  onPrev: () => void;
  onNext: () => void;
}

// Define the special requests schema
const specialRequestsSchema = z.object({
  specialNotes: z.string().optional(),
  allergyInfo: z.string().optional(),
  servicePreferences: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val, {
    message: "You must accept the terms and conditions to continue.",
  }),
});

type SpecialRequestsFormValues = z.infer<typeof specialRequestsSchema>;

export default function SpecialRequests({
  formData,
  onFormDataChange,
  onPrev,
  onNext,
}: SpecialRequestsProps) {
  // Filter out only File objects for initial state to avoid type errors
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(
    (formData.documents || []).filter((doc): doc is File => doc instanceof File)
  );
  
  // Fetch menu items for price display
  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const form = useForm<SpecialRequestsFormValues>({
    resolver: zodResolver(specialRequestsSchema),
    defaultValues: {
      specialNotes: formData.specialNotes || "",
      allergyInfo: "",
      servicePreferences: "",
      acceptTerms: false,
    },
  });

  function onSubmit(data: SpecialRequestsFormValues) {
    // Combine all notes into the specialNotes field
    const combinedNotes = [
      data.specialNotes,
      data.allergyInfo ? `Allergies: ${data.allergyInfo}` : "",
      data.servicePreferences ? `Service Preferences: ${data.servicePreferences}` : "",
    ].filter(Boolean).join("\n\n");

    onFormDataChange({
      specialNotes: combinedNotes,
      documents: uploadedFiles,
      // Set advance notice to true by default since we removed the checkbox
      advanceNoticeConfirmation: true
    });
    
    onNext();
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Requests & Additional Information</h2>
          <p className="text-gray-500 mb-6">
            Provide any additional information or special requests to ensure a perfect catering experience.
          </p>
        </div>

        <FormField
          control={form.control}
          name="specialNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>General Special Requests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests for your catering order"
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include any general information or requests for your entire order.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allergyInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergy Information</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List any allergies or dietary restrictions that we should be aware of"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Please provide detailed information about any allergies or severe dietary restrictions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="servicePreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Preferences</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any preferences for how you would like items packaged or presented"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Let us know if you have specific presentation or packaging requirements.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border border-gray-200 rounded-md p-4">
          <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Document Uploads</FormLabel>
          <p className="text-sm text-gray-500 mb-4">
            Upload any relevant documents such as specific meal plans, airline service specifications, or passenger preference lists.
          </p>

          <div className="space-y-4">
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Documents:</h4>
                <ul className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        {/* File objects have a name property */}
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, JPG (MAX. 10MB)
                  </p>
                </div>
                <Input
                  id="dropzone-file"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Order Summary Display */}
        <OrderSummaryDisplay formData={formData} menuItems={menuItems} />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Accept Terms and Conditions
                </FormLabel>
                <FormDescription>
                  I agree to the terms of service and cancellation policy.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Advanced Notice Confirmation moved to Review & Confirm page */}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            Back to Menu Selection
          </Button>
          <Button type="submit">
            Review & Confirm
          </Button>
        </div>
      </form>
    </Form>
  );
}
