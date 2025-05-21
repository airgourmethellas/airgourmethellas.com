import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";

const translations = {
  en: {
    title: "Terms of Service",
    lastUpdated: "Last Updated",
    introduction: {
      title: "Introduction",
      content: "Welcome to Air Gourmet Hellas. These Terms of Service govern your use of our services including our website, mobile applications, and ordering platform."
    },
    acceptance: {
      title: "Acceptance of Terms",
      content: "By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
    },
    eligibility: {
      title: "Eligibility",
      content: "Our services are available only to businesses and individuals who are at least 18 years old and can form legally binding contracts. By using our services, you represent and warrant that you meet the eligibility requirements."
    },
    accountResponsibility: {
      title: "Account Responsibility",
      content: "When you create an account with us, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account."
    },
    serviceDescription: {
      title: "Service Description",
      content: "Air Gourmet Hellas provides B2B catering services for private aviation. Our services include menu selection, ordering, and delivery coordination for flights departing from our designated locations."
    },
    payment: {
      title: "Payment and Billing",
      items: [
        "Payment is required at the time of order, unless you have established credit terms with us.",
        "We accept payment via credit card, bank transfer, or other methods specified on our platform.",
        "Prices are displayed in euros and may be subject to change.",
        "Cancellation fees apply based on our cancellation policy."
      ]
    },
    cancellation: {
      title: "Cancellation Policy",
      content: "Our cancellation policy is as follows:",
      items: [
        "Cancellations made 24 hours or more before scheduled delivery: No fee",
        "Cancellations made between 23-12 hours before scheduled delivery: 25% of order value",
        "Cancellations made between 12-6 hours before scheduled delivery: 50% of order value",
        "Cancellations made less than 6 hours before scheduled delivery: 100% of order value"
      ]
    },
    intellectual: {
      title: "Intellectual Property",
      content: "All content on our platform, including text, graphics, logos, and software, is the property of Air Gourmet Hellas and is protected by copyright and other intellectual property laws."
    },
    limitation: {
      title: "Limitation of Liability",
      content: "To the maximum extent permitted by law, Air Gourmet Hellas shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues."
    },
    indemnification: {
      title: "Indemnification",
      content: "You agree to indemnify and hold harmless Air Gourmet Hellas and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of our services or violation of these Terms."
    },
    modifications: {
      title: "Modifications to Terms",
      content: "We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes by posting a notice on our platform or sending an email. Your continued use of our services after such modifications constitutes your acceptance of the updated terms."
    },
    termination: {
      title: "Termination",
      content: "We may terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason."
    },
    governing: {
      title: "Governing Law",
      content: "These Terms of Service shall be governed by and construed in accordance with the laws of Greece, without regard to its conflict of law provisions."
    },
    contact: {
      title: "Contact Us",
      content: "If you have any questions about these Terms of Service, please contact us at terms@airgourmethellas.com."
    }
  },
  el: {
    title: "Όροι Χρήσης",
    lastUpdated: "Τελευταία Ενημέρωση",
    introduction: {
      title: "Εισαγωγή",
      content: "Καλώς ήρθατε στην Air Gourmet Hellas. Αυτοί οι Όροι Χρήσης διέπουν τη χρήση των υπηρεσιών μας, συμπεριλαμβανομένου του ιστότοπού μας, των εφαρμογών για κινητά και της πλατφόρμας παραγγελιών."
    },
    acceptance: {
      title: "Αποδοχή Όρων",
      content: "Με την πρόσβαση ή τη χρήση των υπηρεσιών μας, συμφωνείτε να δεσμεύεστε από αυτούς τους Όρους Χρήσης. Εάν δε συμφωνείτε με αυτούς τους όρους, παρακαλούμε μη χρησιμοποιείτε τις υπηρεσίες μας."
    },
    eligibility: {
      title: "Επιλεξιμότητα",
      content: "Οι υπηρεσίες μας είναι διαθέσιμες μόνο σε επιχειρήσεις και άτομα που είναι τουλάχιστον 18 ετών και μπορούν να συνάψουν νομικά δεσμευτικές συμβάσεις. Χρησιμοποιώντας τις υπηρεσίες μας, δηλώνετε και εγγυάστε ότι πληροίτε τις απαιτήσεις επιλεξιμότητας."
    },
    accountResponsibility: {
      title: "Ευθύνη Λογαριασμού",
      content: "Όταν δημιουργείτε έναν λογαριασμό μαζί μας, είστε υπεύθυνοι για τη διατήρηση της εμπιστευτικότητας των διαπιστευτηρίων του λογαριασμού σας και για όλες τις δραστηριότητες που πραγματοποιούνται από τον λογαριασμό σας. Συμφωνείτε να μας ειδοποιήσετε αμέσως για οποιαδήποτε μη εξουσιοδοτημένη χρήση του λογαριασμού σας."
    },
    serviceDescription: {
      title: "Περιγραφή Υπηρεσίας",
      content: "Η Air Gourmet Hellas παρέχει υπηρεσίες τροφοδοσίας B2B για ιδιωτική αεροπορία. Οι υπηρεσίες μας περιλαμβάνουν επιλογή μενού, παραγγελία και συντονισμό παράδοσης για πτήσεις που αναχωρούν από τις καθορισμένες τοποθεσίες μας."
    },
    payment: {
      title: "Πληρωμή και Χρέωση",
      items: [
        "Η πληρωμή απαιτείται κατά τη στιγμή της παραγγελίας, εκτός εάν έχετε συμφωνήσει όρους πίστωσης μαζί μας.",
        "Δεχόμαστε πληρωμή μέσω πιστωτικής κάρτας, τραπεζικής μεταφοράς ή άλλων μεθόδων που καθορίζονται στην πλατφόρμα μας.",
        "Οι τιμές εμφανίζονται σε ευρώ και μπορεί να υπόκεινται σε αλλαγές.",
        "Ισχύουν χρεώσεις ακύρωσης βάσει της πολιτικής ακύρωσης."
      ]
    },
    cancellation: {
      title: "Πολιτική Ακύρωσης",
      content: "Η πολιτική ακύρωσής μας είναι η εξής:",
      items: [
        "Ακυρώσεις που γίνονται 24 ώρες ή περισσότερο πριν την προγραμματισμένη παράδοση: Χωρίς χρέωση",
        "Ακυρώσεις που γίνονται μεταξύ 23-12 ωρών πριν την προγραμματισμένη παράδοση: 25% της αξίας παραγγελίας",
        "Ακυρώσεις που γίνονται μεταξύ 12-6 ωρών πριν την προγραμματισμένη παράδοση: 50% της αξίας παραγγελίας",
        "Ακυρώσεις που γίνονται λιγότερο από 6 ώρες πριν την προγραμματισμένη παράδοση: 100% της αξίας παραγγελίας"
      ]
    },
    intellectual: {
      title: "Πνευματική Ιδιοκτησία",
      content: "Όλο το περιεχόμενο στην πλατφόρμα μας, συμπεριλαμβανομένων των κειμένων, γραφικών, λογοτύπων και λογισμικού, είναι ιδιοκτησία της Air Gourmet Hellas και προστατεύεται από τους νόμους περί πνευματικής ιδιοκτησίας και άλλους νόμους πνευματικής ιδιοκτησίας."
    },
    limitation: {
      title: "Περιορισμός Ευθύνης",
      content: "Στο μέγιστο βαθμό που επιτρέπεται από το νόμο, η Air Gourmet Hellas δεν θα ευθύνεται για οποιεσδήποτε έμμεσες, τυχαίες, ειδικές, συνεπακόλουθες ή τιμωρητικές ζημίες, ή οποιαδήποτε απώλεια κερδών ή εσόδων."
    },
    indemnification: {
      title: "Αποζημίωση",
      content: "Συμφωνείτε να αποζημιώσετε και να διατηρήσετε αβλαβή την Air Gourmet Hellas και τους αξιωματούχους, διευθυντές, υπαλλήλους και πράκτορές της από οποιεσδήποτε αξιώσεις, ευθύνες, ζημίες, απώλειες και έξοδα που προκύπτουν από τη χρήση των υπηρεσιών μας ή την παραβίαση αυτών των Όρων."
    },
    modifications: {
      title: "Τροποποιήσεις στους Όρους",
      content: "Διατηρούμε το δικαίωμα να τροποποιήσουμε αυτούς τους Όρους Χρήσης ανά πάσα στιγμή. Θα ειδοποιούμε τους χρήστες για σημαντικές αλλαγές αναρτώντας μια ειδοποίηση στην πλατφόρμα μας ή στέλνοντας ένα email. Η συνέχιση της χρήσης των υπηρεσιών μας μετά από τέτοιες τροποποιήσεις αποτελεί αποδοχή των ενημερωμένων όρων."
    },
    termination: {
      title: "Τερματισμός",
      content: "Μπορούμε να τερματίσουμε ή να αναστείλουμε τον λογαριασμό σας και την πρόσβαση στις υπηρεσίες μας κατά την αποκλειστική μας κρίση, χωρίς ειδοποίηση, για συμπεριφορά που πιστεύουμε ότι παραβιάζει αυτούς τους Όρους ή είναι επιβλαβής για άλλους χρήστες, εμάς ή τρίτους, ή για οποιονδήποτε άλλο λόγο."
    },
    governing: {
      title: "Εφαρμοστέο Δίκαιο",
      content: "Αυτοί οι Όροι Χρήσης διέπονται και ερμηνεύονται σύμφωνα με τους νόμους της Ελλάδας, χωρίς να λαμβάνονται υπόψη οι διατάξεις περί σύγκρουσης νόμων."
    },
    contact: {
      title: "Επικοινωνήστε Μαζί μας",
      content: "Αν έχετε ερωτήσεις σχετικά με αυτούς τους Όρους Χρήσης, επικοινωνήστε μαζί μας στο terms@airgourmethellas.com."
    }
  }
};

export default function TermsOfService() {
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
            <h2>{t.acceptance.title}</h2>
            <p>{t.acceptance.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.eligibility.title}</h2>
            <p>{t.eligibility.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.accountResponsibility.title}</h2>
            <p>{t.accountResponsibility.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.serviceDescription.title}</h2>
            <p>{t.serviceDescription.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.payment.title}</h2>
            <ul>
              {t.payment.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.cancellation.title}</h2>
            <p>{t.cancellation.content}</p>
            <ul>
              {t.cancellation.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.intellectual.title}</h2>
            <p>{t.intellectual.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.limitation.title}</h2>
            <p>{t.limitation.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.indemnification.title}</h2>
            <p>{t.indemnification.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.modifications.title}</h2>
            <p>{t.modifications.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.termination.title}</h2>
            <p>{t.termination.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.governing.title}</h2>
            <p>{t.governing.content}</p>
          </section>
          
          <Separator className="my-6" />
          
          <section>
            <h2>{t.contact.title}</h2>
            <p>{t.contact.content}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}