import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'el';

// Define the context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'app.title': 'Air Gourmet Hellas',
    'app.slogan': 'Premium Catering for Private Aviation',
    'common.next': 'Next',
    'common.cancel': 'Cancel',
    'common.error': 'Error',
    
    // Navigation
    'nav.newOrder': 'New Order',
    'nav.orderHistory': 'Order History',
    'nav.savedTemplates': 'Saved Templates',
    'nav.account': 'Account',
    'nav.menu': 'Menu',
    'nav.help': 'Help',
    'nav.logout': 'Log out',
    'nav.settings': 'Settings',
    
    // Admin Navigation
    'admin.dashboard': 'Dashboard',
    'admin.orders': 'Orders',
    'admin.menuEditor': 'Menu Editor',
    'admin.inventory': 'Inventory',
    'admin.schedules': 'Schedules',
    'admin.reports': 'Reports',
    'admin.notifications': 'Notifications',
    'admin.integrations': 'Integrations',
    'admin.settings': 'Settings',
    
    // Admin Orders
    'admin.ordersTitle': 'Orders Management',
    'admin.ordersDescription': 'View and manage all catering orders',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.email': 'Email',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.company': 'Company',
    'auth.phone': 'Phone Number',
    'auth.loginTitle': 'Login to Your Account',
    'auth.loginDescription': 'Enter your credentials to access your account',
    'auth.usernamePlaceholder': 'Enter your username',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.loggingIn': 'Logging in...',
    'auth.noAccount': 'Don\'t have an account? ',
    'auth.browseMenu': 'Browse Our Menu',
    'auth.registerTitle': 'Create an account',
    'auth.registerDescription': 'Fill out the form below to register for Air Gourmet Hellas',
    'auth.firstNamePlaceholder': 'John',
    'auth.lastNamePlaceholder': 'Doe',
    'auth.emailPlaceholder': 'john.doe@example.com',
    'auth.companyPlaceholder': 'Atlas Aviation',
    'auth.phonePlaceholder': '+30 21 0123 4567',
    'auth.chooseUsername': 'Choose a username',
    'auth.createPassword': 'Create a password',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.createAccount': 'Create Account',
    'auth.creatingAccount': 'Creating account...',
    'auth.haveAccount': 'Already have an account? ',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.ordersToday': 'Orders Today',
    'dashboard.pendingOrders': 'Pending Orders',
    'dashboard.revenue': 'Revenue',
    
    // Menu
    'menu.title': 'Air Gourmet Hellas Menu',
    'menu.loading': 'Loading menu items...',
    'menu.errorLoading': 'Error loading menu items',
    'menu.allItems': 'All Items',
    'menu.categories.breakfast': 'Breakfast',
    'menu.categories.starters': 'Starters',
    'menu.categories.salads': 'Salads',
    'menu.categories.soups': 'Soups',
    'menu.categories.mainCourses': 'Main Courses',
    'menu.categories.desserts': 'Desserts',
    'menu.categories.beverages': 'Beverages',
    'menu.categories.specialDiet': 'Special Dietary Options',
    'menu.locations.thessaloniki': 'Thessaloniki',
    'menu.locations.mykonos': 'Mykonos',
    'airport.thessaloniki': 'Thessaloniki Airport (SKG)',
    'airport.mykonos': 'Mykonos Airport (JMK)',
    
    // Integrations
    'integrations.title': 'External Integrations',
    'integrations.description': 'Connect Air Gourmet Hellas with external services',
    'integrations.zapier.title': 'Zapier Integration',
    'integrations.zapier.description': 'Connect your Zapier workflows to automate order processing',
    'integrations.zapier.webhookUrl': 'Webhook URL',
    'integrations.zapier.webhookUrlPlaceholder': 'Enter your Zapier webhook URL',
    'integrations.zapier.events': 'Select Events',
    'integrations.zapier.eventOrderCreated': 'Order Created',
    'integrations.zapier.eventOrderUpdated': 'Order Updated',
    'integrations.zapier.eventOrderCancelled': 'Order Cancelled',
    'integrations.zapier.save': 'Save Configuration',
    'integrations.zapier.test': 'Test Connection',
    'integrations.zapier.testSuccess': 'Connection successful! Test data sent to Zapier.',
    'integrations.zapier.testError': 'Connection failed. Please check your webhook URL.',
    
    // Order Form
    'order.companyName': 'Company Name',
    'order.companyNamePlaceholder': 'Enter your company name',
    'order.companyInformation': 'Company Information',
    'order.flightDetails': 'Flight Details',
    'order.tailNumber': 'Tail Number',
    'order.registrationNumber': 'Registration Number',
    'order.registrationNumberPlaceholder': 'Enter aircraft registration number',
    'order.arrivalAirport': 'Arrival Airport',
    'order.arrivalAirportPlaceholder': 'Enter arrival airport (optional)',
    'order.flightSchedule': 'Flight Schedule',
    'order.date': 'Date',
    'order.time': 'Time',
    'order.airports': 'Airports',
    'order.departure': 'Departure',
    'order.arrival': 'Arrival',
    'order.departureAirport': 'Departure Airport',
    'order.departureAirportPlaceholder': 'Select departure airport',
    'order.passengersAndCrew': 'Passengers & Crew',
    'order.passengers': 'Passengers',
    'order.crew': 'Crew',
    'order.dietaryRequirements': 'Dietary Requirements',
    'order.reviewYourOrder': 'Review Your Order',
    'order.reviewInstructions': 'Please review your order details before submitting.',
    'order.menuSelection': 'Menu Selection',
    'order.documentUpload': 'Document Upload',
    'order.documentUploadDescription': 'Upload any necessary documents (flight plans, permits, etc.)',
    'order.uploadDocument': 'Upload Document',
    
    // Chat
    'chat.chatWithOperations': 'Chat with Operations',
    'chat.sendMessageGeneral': 'Send a message to our operations team for assistance.',
    'chat.sendMessageForOrder': 'Send a message about order #{orderNumber}.',
    'chat.messagePlaceholder': 'Type your message here...',
    'chat.send': 'Send Message',
    'chat.sending': 'Sending...',
    'chat.messageSentTitle': 'Message Sent',
    'chat.messageSentDescription': 'Our operations team will respond to you shortly.',
    'chat.messageSentToOperations': 'Your message has been sent to our operations team.',
    'chat.messageRecordedNoSlack': 'Your message has been recorded but direct notification is unavailable.',
    'chat.operationsWillReply': 'Our operations team will respond to you as soon as possible.',
    'chat.errorSending': 'Failed to send your message. Please try again.',
    'chat.emptyMessage': 'Please enter a message before sending.',
    'chat.checkingConnection': 'Checking connection status...',
    'chat.slackUnavailableTitle': 'Real-time chat currently unavailable',
    'chat.slackUnavailableMessage': 'Our real-time chat system is temporarily unavailable, but your message will still be recorded.',
    'chat.slackDisabledButRecorded': 'The operations team will still receive your message, but response may be delayed.',
    
    // Concierge Services
    'concierge.title': 'Concierge Services',
    'concierge.subtitle': 'Premium services for discerning clients',
    'concierge.requestForm': 'Concierge Request Form',
    'concierge.serviceInfo': 'Available Services',
    'concierge.serviceInfoDescription': 'Explore our premium concierge services',
    'concierge.serviceType': 'Service Type',
    'concierge.selectServiceType': 'Select a service type',
    'concierge.serviceTypeDescription': 'Choose the type of service you need',
    'concierge.newspapersMagazines': 'Newspapers and Magazines',
    'concierge.laundryIroning': 'Laundry and Ironing Services',
    'concierge.equipmentWashing': 'Equipment Washing',
    'concierge.storageSolutions': 'Storage Solutions',
    'concierge.flowerArrangements': 'Elegant Flower Arrangements',
    'concierge.cabinSupplies': 'Cabin Supplies',
    'concierge.toiletriesKitchen': 'Toiletries and Kitchen Equipment',
    'concierge.alcoholicBeverages': 'Exclusive Alcoholic Beverages and Wine Selection',
    'concierge.customRequest': 'Custom Request',
    'concierge.description': 'Service Description',
    'concierge.descriptionPlaceholder': 'Describe your requirements in detail',
    'concierge.deliveryDate': 'Service Date',
    'concierge.deliveryDateDescription': 'When do you need this service?',
    'concierge.deliveryTime': 'Service Time',
    'concierge.deliveryTimeDescription': 'What time do you need this service?',
    'concierge.deliveryLocation': 'Service Location',
    'concierge.deliveryLocationPlaceholder': 'Where do you need this service?',
    'concierge.specialInstructions': 'Special Instructions',
    'concierge.specialInstructionsPlaceholder': 'Any additional requirements or preferences',
    'concierge.urgentRequest': 'This is an urgent request',
    'concierge.submitRequest': 'Submit Request',
    'concierge.submittingRequest': 'Submitting request...',
    'concierge.requestSubmitted': 'Request Submitted',
    'concierge.requestSubmittedDescription': 'Your concierge request has been submitted. Our team will contact you shortly.',
    'concierge.requestError': 'Error submitting request',
    'concierge.contact': 'For immediate assistance, please contact our concierge team at +30 2310 123456 or concierge@airgourmethellas.com',
  },
  el: {
    // Common
    'app.title': 'Air Gourmet Hellas',
    'app.slogan': 'Υψηλής Ποιότητας Τροφοδοσία για Ιδιωτική Αεροπλοΐα',
    'common.next': 'Επόμενο',
    'common.cancel': 'Ακύρωση',
    'common.error': 'Σφάλμα',
    
    // Navigation
    'nav.newOrder': 'Νέα Παραγγελία',
    'nav.orderHistory': 'Ιστορικό Παραγγελιών',
    'nav.savedTemplates': 'Αποθηκευμένα Πρότυπα',
    'nav.account': 'Λογαριασμός',
    'nav.menu': 'Μενού',
    'nav.help': 'Βοήθεια',
    'nav.logout': 'Αποσύνδεση',
    'nav.settings': 'Ρυθμίσεις',
    
    // Admin Navigation
    'admin.dashboard': 'Πίνακας Ελέγχου',
    'admin.orders': 'Παραγγελίες',
    'admin.menuEditor': 'Επεξεργασία Μενού',
    'admin.inventory': 'Αποθέματα',
    'admin.schedules': 'Προγράμματα',
    'admin.reports': 'Αναφορές',
    'admin.notifications': 'Ειδοποιήσεις',
    'admin.integrations': 'Ενσωματώσεις',
    'admin.settings': 'Ρυθμίσεις',
    
    // Admin Orders
    'ordersTitle': 'Διαχείριση Παραγγελιών',
    'ordersDescription': 'Προβολή και διαχείριση όλων των παραγγελιών τροφοδοσίας',
    
    // Auth
    'auth.login': 'Σύνδεση',
    'auth.register': 'Εγγραφή',
    'auth.username': 'Όνομα Χρήστη',
    'auth.password': 'Κωδικός',
    'auth.confirmPassword': 'Επιβεβαίωση Κωδικού',
    'auth.email': 'Email',
    'auth.firstName': 'Όνομα',
    'auth.lastName': 'Επώνυμο',
    'auth.company': 'Εταιρεία',
    'auth.phone': 'Τηλέφωνο',
    'auth.loginTitle': 'Σύνδεση στο Λογαριασμό σας',
    'auth.loginDescription': 'Εισάγετε τα στοιχεία σας για πρόσβαση στο λογαριασμό σας',
    'auth.usernamePlaceholder': 'Εισάγετε το όνομα χρήστη',
    'auth.passwordPlaceholder': 'Εισάγετε τον κωδικό σας',
    'auth.loggingIn': 'Γίνεται σύνδεση...',
    'auth.noAccount': 'Δεν έχετε λογαριασμό; ',
    'auth.browseMenu': 'Περιήγηση στο Μενού μας',
    'auth.registerTitle': 'Δημιουργία λογαριασμού',
    'auth.registerDescription': 'Συμπληρώστε τη φόρμα για εγγραφή στο Air Gourmet Hellas',
    'auth.firstNamePlaceholder': 'Γιάννης',
    'auth.lastNamePlaceholder': 'Παπαδόπουλος',
    'auth.emailPlaceholder': 'giannis@example.com',
    'auth.companyPlaceholder': 'Atlas Aviation',
    'auth.phonePlaceholder': '+30 21 0123 4567',
    'auth.chooseUsername': 'Επιλέξτε όνομα χρήστη',
    'auth.createPassword': 'Δημιουργήστε έναν κωδικό',
    'auth.confirmPasswordPlaceholder': 'Επιβεβαιώστε τον κωδικό σας',
    'auth.createAccount': 'Δημιουργία Λογαριασμού',
    'auth.creatingAccount': 'Δημιουργία λογαριασμού...',
    'auth.haveAccount': 'Έχετε ήδη λογαριασμό; ',
    
    // Dashboard
    'dashboard.welcome': 'Καλώς Ήρθατε',
    'dashboard.ordersToday': 'Σημερινές Παραγγελίες',
    'dashboard.pendingOrders': 'Εκκρεμείς Παραγγελίες',
    'dashboard.revenue': 'Έσοδα',
    
    // Menu
    'menu.title': 'Μενού Air Gourmet Hellas',
    'menu.loading': 'Φόρτωση ειδών μενού...',
    'menu.errorLoading': 'Σφάλμα φόρτωσης ειδών μενού',
    'menu.allItems': 'Όλα τα Είδη',
    'menu.categories.breakfast': 'Πρωινό',
    'menu.categories.starters': 'Ορεκτικά',
    'menu.categories.salads': 'Σαλάτες',
    'menu.categories.soups': 'Σούπες',
    'menu.categories.mainCourses': 'Κυρίως Πιάτα',
    'menu.categories.desserts': 'Επιδόρπια',
    'menu.categories.beverages': 'Ποτά',
    'menu.categories.specialDiet': 'Ειδικές Διατροφικές Επιλογές',
    'menu.locations.thessaloniki': 'Θεσσαλονίκη',
    'menu.locations.mykonos': 'Μύκονος',
    'airport.thessaloniki': 'Αεροδρόμιο Θεσσαλονίκης (SKG)',
    'airport.mykonos': 'Αεροδρόμιο Μυκόνου (JMK)',
    
    // Order Form
    'order.companyName': 'Όνομα Εταιρείας',
    'order.companyNamePlaceholder': 'Εισάγετε το όνομα της εταιρείας σας',
    'order.companyInformation': 'Πληροφορίες Εταιρείας',
    'order.flightDetails': 'Στοιχεία Πτήσης',
    'order.tailNumber': 'Αριθμός Ουράς',
    'order.registrationNumber': 'Αριθμός Νηολογίου',
    'order.registrationNumberPlaceholder': 'Εισάγετε τον αριθμό νηολογίου του αεροσκάφους',
    'order.arrivalAirport': 'Αεροδρόμιο Άφιξης',
    'order.arrivalAirportPlaceholder': 'Εισάγετε το αεροδρόμιο άφιξης (προαιρετικό)',
    'order.flightSchedule': 'Πρόγραμμα Πτήσης',
    'order.date': 'Ημερομηνία',
    'order.time': 'Ώρα',
    'order.airports': 'Αεροδρόμια',
    'order.departure': 'Αναχώρηση',
    'order.arrival': 'Άφιξη',
    'order.departureAirport': 'Αεροδρόμιο Αναχώρησης',
    'order.departureAirportPlaceholder': 'Επιλέξτε αεροδρόμιο αναχώρησης',
    'order.passengersAndCrew': 'Επιβάτες & Πλήρωμα',
    'order.passengers': 'Επιβάτες',
    'order.crew': 'Πλήρωμα',
    'order.dietaryRequirements': 'Διατροφικές Απαιτήσεις',
    'order.reviewYourOrder': 'Έλεγχος Παραγγελίας',
    'order.reviewInstructions': 'Παρακαλούμε ελέγξτε τα στοιχεία της παραγγελίας σας πριν την υποβολή.',
    'order.menuSelection': 'Επιλογή Μενού',
    'order.documentUpload': 'Μεταφόρτωση Εγγράφου',
    'order.documentUploadDescription': 'Μεταφορτώστε τυχόν απαραίτητα έγγραφα (σχέδια πτήσης, άδειες, κλπ.)',
    'order.uploadDocument': 'Μεταφόρτωση Εγγράφου',
    
    // Chat
    'chat.chatWithOperations': 'Συνομιλία με Επιχειρήσεις',
    'chat.sendMessageGeneral': 'Στείλτε μήνυμα στην ομάδα επιχειρήσεων για βοήθεια.',
    'chat.sendMessageForOrder': 'Στείλτε μήνυμα σχετικά με την παραγγελία #{orderNumber}.',
    'chat.messagePlaceholder': 'Γράψτε το μήνυμά σας εδώ...',
    'chat.send': 'Αποστολή Μηνύματος',
    'chat.sending': 'Αποστολή...',
    'chat.messageSentTitle': 'Το Μήνυμα Εστάλη',
    'chat.messageSentDescription': 'Η ομάδα επιχειρήσεων θα σας απαντήσει σύντομα.',
    'chat.messageSentToOperations': 'Το μήνυμά σας έχει σταλεί στην ομάδα επιχειρήσεων.',
    'chat.messageRecordedNoSlack': 'Το μήνυμά σας έχει καταγραφεί αλλά η άμεση ειδοποίηση δεν είναι διαθέσιμη.',
    'chat.operationsWillReply': 'Η ομάδα επιχειρήσεων θα σας απαντήσει το συντομότερο δυνατό.',
    'chat.errorSending': 'Αποτυχία αποστολής μηνύματος. Παρακαλώ δοκιμάστε ξανά.',
    'chat.emptyMessage': 'Παρακαλώ εισάγετε ένα μήνυμα πριν την αποστολή.',
    'chat.checkingConnection': 'Έλεγχος κατάστασης σύνδεσης...',
    'chat.slackUnavailableTitle': 'Η συνομιλία σε πραγματικό χρόνο δεν είναι διαθέσιμη',
    'chat.slackUnavailableMessage': 'Το σύστημα συνομιλίας σε πραγματικό χρόνο είναι προσωρινά μη διαθέσιμο, αλλά το μήνυμά σας θα καταγραφεί.',
    'chat.slackDisabledButRecorded': 'Η ομάδα επιχειρήσεων θα λάβει το μήνυμά σας, αλλά η απάντηση μπορεί να καθυστερήσει.',
    
    // Concierge Services
    'concierge.title': 'Υπηρεσίες Concierge',
    'concierge.subtitle': 'Υπηρεσίες υψηλών προδιαγραφών για απαιτητικούς πελάτες',
    'concierge.requestForm': 'Φόρμα Αίτησης Υπηρεσιών Concierge',
    'concierge.serviceInfo': 'Διαθέσιμες Υπηρεσίες',
    'concierge.serviceInfoDescription': 'Εξερευνήστε τις premium υπηρεσίες concierge',
    'concierge.serviceType': 'Τύπος Υπηρεσίας',
    'concierge.selectServiceType': 'Επιλέξτε τύπο υπηρεσίας',
    'concierge.serviceTypeDescription': 'Επιλέξτε τον τύπο υπηρεσίας που χρειάζεστε',
    'concierge.newspapersMagazines': 'Εφημερίδες και Περιοδικά',
    'concierge.laundryIroning': 'Υπηρεσίες Πλυντηρίου και Σιδερώματος',
    'concierge.equipmentWashing': 'Πλύσιμο Εξοπλισμού',
    'concierge.storageSolutions': 'Λύσεις Αποθήκευσης',
    'concierge.flowerArrangements': 'Κομψές Ανθοσυνθέσεις',
    'concierge.cabinSupplies': 'Προμήθειες Καμπίνας',
    'concierge.toiletriesKitchen': 'Είδη Προσωπικής Υγιεινής και Εξοπλισμός Κουζίνας',
    'concierge.alcoholicBeverages': 'Αποκλειστικά Αλκοολούχα Ποτά και Επιλογές Κρασιών',
    'concierge.customRequest': 'Ειδική Αίτηση',
    'concierge.description': 'Περιγραφή Υπηρεσίας',
    'concierge.descriptionPlaceholder': 'Περιγράψτε λεπτομερώς τις απαιτήσεις σας',
    'concierge.deliveryDate': 'Ημερομηνία Υπηρεσίας',
    'concierge.deliveryDateDescription': 'Πότε χρειάζεστε αυτή την υπηρεσία;',
    'concierge.deliveryTime': 'Ώρα Υπηρεσίας',
    'concierge.deliveryTimeDescription': 'Τι ώρα χρειάζεστε αυτή την υπηρεσία;',
    'concierge.deliveryLocation': 'Τοποθεσία Υπηρεσίας',
    'concierge.deliveryLocationPlaceholder': 'Πού χρειάζεστε αυτή την υπηρεσία;',
    'concierge.specialInstructions': 'Ειδικές Οδηγίες',
    'concierge.specialInstructionsPlaceholder': 'Πρόσθετες απαιτήσεις ή προτιμήσεις',
    'concierge.urgentRequest': 'Αυτή είναι επείγουσα αίτηση',
    'concierge.submitRequest': 'Υποβολή Αίτησης',
    'concierge.submittingRequest': 'Υποβολή αίτησης...',
    'concierge.requestSubmitted': 'Η Αίτηση Υποβλήθηκε',
    'concierge.requestSubmittedDescription': 'Η αίτηση concierge έχει υποβληθεί. Η ομάδα μας θα επικοινωνήσει μαζί σας σύντομα.',
    'concierge.requestError': 'Σφάλμα υποβολής αίτησης',
    'concierge.contact': 'Για άμεση βοήθεια, επικοινωνήστε με την ομάδα concierge στο +30 2310 123456 ή στο concierge@airgourmethellas.com',
  },
};

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get the stored language preference from localStorage
    try {
      const storedLanguage = localStorage.getItem('preferredLanguage');
      return (storedLanguage === 'en' || storedLanguage === 'el') ? storedLanguage : 'en';
    } catch (e) {
      // If localStorage is not available or there's an error
      return 'en';
    }
  });

  // Update localStorage when language changes
  const updateLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    try {
      localStorage.setItem('preferredLanguage', newLanguage);
    } catch (e) {
      console.error('Could not save language preference to localStorage:', e);
    }
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook for using the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Alias for useLanguage for better naming consistency
export const useTranslation = useLanguage;