import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { DataDeletionRequest } from "@/components/gdpr/data-deletion-request";

const translations = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last Updated",
    introduction: {
      title: "Introduction",
      content: "Air Gourmet Hellas ('we', 'us', or 'our') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services."
    },
    dataCollection: {
      title: "Data We Collect",
      content: "We collect information that you provide directly to us when you register for an account, place an order, or communicate with us. This may include:",
      items: [
        "Name and contact information",
        "Company details and flight information",
        "Payment information",
        "Communication preferences",
        "Order history and preferences"
      ]
    },
    dataUse: {
      title: "How We Use Your Data",
      content: "We use your personal data for the following purposes:",
      items: [
        "To provide and maintain our services",
        "To process and fulfill your orders",
        "To communicate with you about orders, products, and services",
        "To improve our services and develop new features",
        "To comply with legal obligations"
      ]
    },
    dataSecurity: {
      title: "Data Security",
      content: "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction."
    },
    dataSharing: {
      title: "Data Sharing",
      content: "We do not sell your personal information. We may share data with:",
      items: [
        "Service providers who help us deliver our services",
        "Legal authorities when required by law",
        "Business partners with your explicit consent"
      ]
    },
    yourRights: {
      title: "Your Rights",
      content: "Under the GDPR and other applicable data protection laws, you have the following rights:",
      items: [
        "Right to access your personal data",
        "Right to correct inaccurate data",
        "Right to erasure ('right to be forgotten')",
        "Right to restrict processing",
        "Right to data portability",
        "Right to object to processing"
      ]
    },
    cookies: {
      title: "Cookies",
      content: "We use cookies to enhance your experience on our website. You can manage your cookie preferences through our Cookie Settings tool."
    },
    changes: {
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date."
    },
    contact: {
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us at privacy@airgourmethellas.com.",
    },
    dataDeletion: {
      title: "Data Deletion Request",
      content: "If you wish to request deletion of your personal data, please complete the form below."
    }
  },
  el: {
    title: "Πολιτική Απορρήτου",
    lastUpdated: "Τελευταία Ενημέρωση",
    introduction: {
      title: "Εισαγωγή",
      content: "Η Air Gourmet Hellas ('εμείς', 'μας' ή 'ημών') δεσμεύεται να προστατεύει το απόρρητό σας. Αυτή η Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε τα δεδομένα σας όταν χρησιμοποιείτε τις υπηρεσίες μας."
    },
    dataCollection: {
      title: "Δεδομένα που Συλλέγουμε",
      content: "Συλλέγουμε πληροφορίες που παρέχετε άμεσα σε εμάς όταν εγγράφεστε για λογαριασμό, κάνετε παραγγελία ή επικοινωνείτε μαζί μας. Αυτά μπορεί να περιλαμβάνουν:",
      items: [
        "Όνομα και στοιχεία επικοινωνίας",
        "Στοιχεία εταιρείας και πληροφορίες πτήσης",
        "Πληροφορίες πληρωμής",
        "Προτιμήσεις επικοινωνίας",
        "Ιστορικό παραγγελιών και προτιμήσεις"
      ]
    },
    dataUse: {
      title: "Πώς Χρησιμοποιούμε τα Δεδομένα σας",
      content: "Χρησιμοποιούμε τα προσωπικά σας δεδομένα για τους ακόλουθους σκοπούς:",
      items: [
        "Για την παροχή και διατήρηση των υπηρεσιών μας",
        "Για την επεξεργασία και εκπλήρωση των παραγγελιών σας",
        "Για επικοινωνία μαζί σας σχετικά με παραγγελίες, προϊόντα και υπηρεσίες",
        "Για τη βελτίωση των υπηρεσιών μας και την ανάπτυξη νέων χαρακτηριστικών",
        "Για συμμόρφωση με νομικές υποχρεώσεις"
      ]
    },
    dataSecurity: {
      title: "Ασφάλεια Δεδομένων",
      content: "Εφαρμόζουμε κατάλληλα μέτρα ασφαλείας για την προστασία των προσωπικών σας πληροφοριών από μη εξουσιοδοτημένη πρόσβαση, αλλοίωση, αποκάλυψη ή καταστροφή."
    },
    dataSharing: {
      title: "Κοινοποίηση Δεδομένων",
      content: "Δεν πωλούμε τα προσωπικά σας δεδομένα. Μπορεί να μοιραστούμε δεδομένα με:",
      items: [
        "Παρόχους υπηρεσιών που μας βοηθούν να παρέχουμε τις υπηρεσίες μας",
        "Νομικές αρχές όταν απαιτείται από το νόμο",
        "Επιχειρηματικούς συνεργάτες με τη ρητή συγκατάθεσή σας"
      ]
    },
    yourRights: {
      title: "Τα Δικαιώματά σας",
      content: "Σύμφωνα με τον GDPR και άλλους ισχύοντες νόμους προστασίας δεδομένων, έχετε τα ακόλουθα δικαιώματα:",
      items: [
        "Δικαίωμα πρόσβασης στα προσωπικά σας δεδομένα",
        "Δικαίωμα διόρθωσης ανακριβών δεδομένων",
        "Δικαίωμα διαγραφής ('δικαίωμα στη λήθη')",
        "Δικαίωμα περιορισμού της επεξεργασίας",
        "Δικαίωμα στη φορητότητα των δεδομένων",
        "Δικαίωμα εναντίωσης στην επεξεργασία"
      ]
    },
    cookies: {
      title: "Cookies",
      content: "Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας στον ιστότοπό μας. Μπορείτε να διαχειριστείτε τις προτιμήσεις σας για τα cookies μέσω του εργαλείου Ρυθμίσεις Cookies."
    },
    changes: {
      title: "Αλλαγές σε Αυτήν την Πολιτική",
      content: "Μπορεί να ενημερώνουμε αυτήν την Πολιτική Απορρήτου κατά καιρούς. Θα σας ενημερώνουμε για τυχόν αλλαγές δημοσιεύοντας τη νέα Πολιτική Απορρήτου σε αυτή τη σελίδα και ενημερώνοντας την ημερομηνία 'Τελευταία Ενημέρωση'."
    },
    contact: {
      title: "Επικοινωνήστε Μαζί μας",
      content: "Εάν έχετε ερωτήσεις σχετικά με αυτήν την Πολιτική Απορρήτου, επικοινωνήστε μαζί μας στο privacy@airgourmethellas.com.",
    },
    dataDeletion: {
      title: "Αίτημα Διαγραφής Δεδομένων",
      content: "Αν επιθυμείτε να ζητήσετε διαγραφή των προσωπικών σας δεδομένων, συμπληρώστε την παρακάτω φόρμα."
    }
  }
};

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  
  const currentDate = new Date().toLocaleDateString(language === "el" ? "el-GR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">{t.title}</CardTitle>
          <CardDescription>
            {t.lastUpdated}: {currentDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="prose max-w-none dark:prose-invert">
          <section>
            <h2>{t.introduction.title}</h2>
            <p>{t.introduction.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.dataCollection.title}</h2>
            <p>{t.dataCollection.content}</p>
            <ul>
              {t.dataCollection.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.dataUse.title}</h2>
            <p>{t.dataUse.content}</p>
            <ul>
              {t.dataUse.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.dataSecurity.title}</h2>
            <p>{t.dataSecurity.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.dataSharing.title}</h2>
            <p>{t.dataSharing.content}</p>
            <ul>
              {t.dataSharing.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.yourRights.title}</h2>
            <p>{t.yourRights.content}</p>
            <ul>
              {t.yourRights.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.cookies.title}</h2>
            <p>{t.cookies.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.changes.title}</h2>
            <p>{t.changes.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.contact.title}</h2>
            <p>{t.contact.content}</p>
          </section>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t.dataDeletion.title}</CardTitle>
          <CardDescription>
            {t.dataDeletion.content}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataDeletionRequest />
        </CardContent>
      </Card>
    </div>
  );
}