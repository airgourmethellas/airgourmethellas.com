import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

const translations = {
  en: {
    title: "Data Processing Consent",
    description: "Please review and confirm your consent for us to process your personal data according to our privacy policy. You can withdraw your consent at any time.",
    requiredConsent: "Required Consent",
    processingData: "I consent to Air Gourmet Hellas processing my personal data to provide catering services, as described in the Privacy Policy.",
    requiredMessage: "You must provide consent to use our services",
    marketingConsent: "Marketing Consent (Optional)",
    marketingEmail: "I would like to receive emails about new menu items, promotions, and news from Air Gourmet Hellas.",
    marketingSMS: "I would like to receive SMS notifications about my orders and services from Air Gourmet Hellas.",
    consentSaved: "Your consent preferences have been saved.",
    confirmConsent: "Confirm Consent",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    readAccept: "I have read and accept the",
    and: "and",
  },
  el: {
    title: "Συγκατάθεση Επεξεργασίας Δεδομένων",
    description: "Παρακαλούμε ελέγξτε και επιβεβαιώστε τη συγκατάθεσή σας για την επεξεργασία των προσωπικών σας δεδομένων σύμφωνα με την πολιτική απορρήτου μας. Μπορείτε να αποσύρετε τη συγκατάθεσή σας οποιαδήποτε στιγμή.",
    requiredConsent: "Απαιτούμενη Συγκατάθεση",
    processingData: "Συναινώ στην επεξεργασία των προσωπικών μου δεδομένων από την Air Gourmet Hellas για την παροχή υπηρεσιών τροφοδοσίας, όπως περιγράφεται στην Πολιτική Απορρήτου.",
    requiredMessage: "Πρέπει να παρέχετε συγκατάθεση για να χρησιμοποιήσετε τις υπηρεσίες μας",
    marketingConsent: "Συγκατάθεση Μάρκετινγκ (Προαιρετικό)",
    marketingEmail: "Θα ήθελα να λαμβάνω emails για νέα είδη μενού, προσφορές και νέα από την Air Gourmet Hellas.",
    marketingSMS: "Θα ήθελα να λαμβάνω ειδοποιήσεις SMS σχετικά με τις παραγγελίες και τις υπηρεσίες μου από την Air Gourmet Hellas.",
    consentSaved: "Οι προτιμήσεις συγκατάθεσής σας έχουν αποθηκευτεί.",
    confirmConsent: "Επιβεβαίωση Συγκατάθεσης",
    privacyPolicy: "Πολιτική Απορρήτου",
    termsOfService: "Όροι Χρήσης",
    readAccept: "Έχω διαβάσει και αποδέχομαι την",
    and: "και τους",
  }
};

const formSchema = z.object({
  processingConsent: z.boolean().refine(val => val === true, {
    message: "You must provide consent to use our services",
  }),
  termsAndPrivacy: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and privacy policy",
  }),
  marketingEmail: z.boolean().optional(),
  marketingSMS: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ConsentFormProps {
  onComplete?: (consentData: FormValues) => void;
  isRegistration?: boolean;
}

export function ConsentForm({ onComplete, isRegistration = false }: ConsentFormProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations];
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      processingConsent: false,
      termsAndPrivacy: false,
      marketingEmail: false,
      marketingSMS: false,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      // Save consent to local storage
      localStorage.setItem("user-consent", JSON.stringify({
        processingConsent: data.processingConsent,
        marketingEmail: data.marketingEmail,
        marketingSMS: data.marketingSMS,
        consentDate: new Date().toISOString(),
      }));
      
      // Display success toast
      toast({
        title: t.consentSaved,
        duration: 3000,
      });
      
      setSubmitted(true);
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete(data);
      }
    } catch (error) {
      console.error("Error saving consent", error);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t.requiredConsent}</h3>
              
              <FormField
                control={form.control}
                name="processingConsent"
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
                        {t.processingData}
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="termsAndPrivacy"
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
                        {t.readAccept} <Link to="/privacy-policy" className="text-primary hover:underline">{t.privacyPolicy}</Link> {t.and} <Link to="/terms-of-service" className="text-primary hover:underline">{t.termsOfService}</Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t.marketingConsent}</h3>
              
              <FormField
                control={form.control}
                name="marketingEmail"
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
                        {t.marketingEmail}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="marketingSMS"
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
                        {t.marketingSMS}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full">
              {t.confirmConsent}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}