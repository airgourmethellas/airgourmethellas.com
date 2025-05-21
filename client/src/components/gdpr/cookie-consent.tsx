import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

const translations = {
  en: {
    title: "Cookie Consent",
    description: "We use cookies to enhance your experience and analyze our traffic. You can choose which cookies you want to allow.",
    acceptAll: "Accept All",
    acceptEssential: "Essential Only",
    settings: "Cookie Settings",
    saved: "Cookie preferences saved",
    essentialCookies: "Essential Cookies",
    essentialDescription: "Necessary for the website to function properly. These cannot be disabled.",
    analyticsCookies: "Analytics Cookies",
    analyticsDescription: "Help us understand how visitors interact with our website.",
    marketingCookies: "Marketing Cookies",
    marketingDescription: "Used to track visitors across websites to display relevant advertisements.",
    functionalCookies: "Functional Cookies",
    functionalDescription: "Enable enhanced functionality and personalization.",
    save: "Save Preferences",
    privacyPolicy: "Privacy Policy",
  },
  el: {
    title: "Συγκατάθεση Cookies",
    description: "Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας και να αναλύσουμε την κίνηση. Μπορείτε να επιλέξετε ποια cookies θέλετε να επιτρέψετε.",
    acceptAll: "Αποδοχή Όλων",
    acceptEssential: "Μόνο Απαραίτητα",
    settings: "Ρυθμίσεις Cookies",
    saved: "Οι προτιμήσεις cookies αποθηκεύτηκαν",
    essentialCookies: "Απαραίτητα Cookies",
    essentialDescription: "Απαραίτητα για τη σωστή λειτουργία του ιστότοπου. Αυτά δεν μπορούν να απενεργοποιηθούν.",
    analyticsCookies: "Cookies Ανάλυσης",
    analyticsDescription: "Μας βοηθούν να κατανοήσουμε πώς αλληλεπιδρούν οι επισκέπτες με τον ιστότοπό μας.",
    marketingCookies: "Cookies Μάρκετινγκ",
    marketingDescription: "Χρησιμοποιούνται για την παρακολούθηση επισκεπτών σε ιστότοπους για την εμφάνιση σχετικών διαφημίσεων.",
    functionalCookies: "Λειτουργικά Cookies",
    functionalDescription: "Επιτρέπουν βελτιωμένη λειτουργικότητα και εξατομίκευση.",
    save: "Αποθήκευση Προτιμήσεων",
    privacyPolicy: "Πολιτική Απορρήτου",
  }
};

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

export function CookieConsent() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations];
  
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      setShowConsent(true);
    } else {
      try {
        setPreferences(JSON.parse(cookieConsent));
      } catch (error) {
        console.error("Error parsing cookie preferences", error);
        setShowConsent(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    saveCookiePreferences(allAccepted);
  };

  const handleAcceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    saveCookiePreferences(essentialOnly);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
  };

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs));
    setShowConsent(false);
    setShowSettings(false);
    
    toast({
      title: t.saved,
      duration: 3000,
    });
    
    // Here you would implement the actual cookie handling based on preferences
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-black/20 backdrop-blur-sm">
      {!showSettings ? (
        <Card className="w-full max-w-4xl mx-auto border border-border">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>
              {t.description}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              {t.settings}
            </Button>
            <Button variant="outline" onClick={handleAcceptEssential}>
              {t.acceptEssential}
            </Button>
            <Button onClick={handleAcceptAll}>
              {t.acceptAll}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="w-full max-w-4xl mx-auto border border-border">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>
              {t.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t.essentialCookies}</h4>
                  <p className="text-sm text-muted-foreground">{t.essentialDescription}</p>
                </div>
                <div>
                  <input 
                    type="checkbox" 
                    checked={preferences.essential} 
                    disabled
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t.analyticsCookies}</h4>
                  <p className="text-sm text-muted-foreground">{t.analyticsDescription}</p>
                </div>
                <div>
                  <input 
                    type="checkbox" 
                    checked={preferences.analytics} 
                    onChange={e => setPreferences({...preferences, analytics: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t.marketingCookies}</h4>
                  <p className="text-sm text-muted-foreground">{t.marketingDescription}</p>
                </div>
                <div>
                  <input 
                    type="checkbox" 
                    checked={preferences.marketing} 
                    onChange={e => setPreferences({...preferences, marketing: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{t.functionalCookies}</h4>
                  <p className="text-sm text-muted-foreground">{t.functionalDescription}</p>
                </div>
                <div>
                  <input 
                    type="checkbox" 
                    checked={preferences.functional} 
                    onChange={e => setPreferences({...preferences, functional: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              {t.acceptEssential}
            </Button>
            <Button onClick={handleSavePreferences}>
              {t.save}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}