import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";

const translations = {
  en: {
    title: "Data Deletion Request",
    description: "Fill out this form to request deletion of your personal data.",
    email: "Email",
    emailDesc: "Enter the email address associated with your account",
    reason: "Reason for deletion",
    reasonDesc: "Optional explanation for why you wish to delete your data",
    requestSent: "Your data deletion request has been sent",
    requestSentDesc: "We'll process your request and contact you with confirmation.",
    submit: "Submit Request",
    error: "Error submitting request",
  },
  el: {
    title: "Αίτημα Διαγραφής Δεδομένων",
    description: "Συμπληρώστε αυτή τη φόρμα για να ζητήσετε διαγραφή των προσωπικών σας δεδομένων.",
    email: "Email",
    emailDesc: "Εισάγετε τη διεύθυνση email που σχετίζεται με το λογαριασμό σας",
    reason: "Λόγος διαγραφής",
    reasonDesc: "Προαιρετική εξήγηση για το γιατί θέλετε να διαγράψετε τα δεδομένα σας",
    requestSent: "Το αίτημα διαγραφής δεδομένων σας έχει σταλεί",
    requestSentDesc: "Θα επεξεργαστούμε το αίτημά σας και θα επικοινωνήσουμε μαζί σας για επιβεβαίωση.",
    submit: "Υποβολή Αιτήματος",
    error: "Σφάλμα κατά την υποβολή του αιτήματος",
  }
};

const formSchema = z.object({
  email: z.string().email(),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DataDeletionRequest() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations];
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      reason: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      await apiRequest("POST", "/api/gdpr/data-deletion-request", data);
      setSubmitted(true);
    } catch (error) {
      toast({
        title: t.error,
        variant: "destructive",
      });
    }
  }

  if (submitted) {
    return (
      <Alert>
        <AlertTitle>{t.requestSent}</AlertTitle>
        <AlertDescription>
          {t.requestSentDesc}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t.title}</h2>
      <p className="mb-6 text-muted-foreground">{t.description}</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.email}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormDescription>{t.emailDesc}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.reason}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormDescription>{t.reasonDesc}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            {t.submit}
          </Button>
        </form>
      </Form>
    </div>
  );
}