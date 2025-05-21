import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { LogOut } from "lucide-react";
import Logo from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = () => {
    if (!user) return "";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Logo size="lg" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <span className="mr-1">{language === 'en' ? 'EN' : 'EL'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    <span className="font-medium">English</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('el')}>
                    <span className="font-medium">Ελληνικά</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="relative">
              <Button variant="ghost" size="sm">
                <span className="mr-1">{t('nav.help')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Button>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.company}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="w-full">
                    {t('nav.settings')}
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full text-blue-600">
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link href="/"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                location === "/" 
                  ? "border-primary-600 text-primary-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                {t('nav.newOrder')}
            </Link>
            <Link href="/concierge"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                location === "/concierge" 
                  ? "border-primary-600 text-primary-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                Concierge Services
            </Link>
            <Link href="/order-history"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                location === "/order-history" 
                  ? "border-primary-600 text-primary-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                {t('nav.orderHistory')}
            </Link>
            <Link href="/account"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                location === "/account" 
                  ? "border-primary-600 text-primary-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                {t('nav.account')}
            </Link>
            <Link href="/menu"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                location === "/menu" 
                  ? "border-primary-600 text-primary-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                {t('nav.menu')}
            </Link>
          </nav>
        </div>

        {/* Page Content */}
        <div className="py-6">
          {children}
        </div>
      </main>
      
      {/* Footer with GDPR links */}
      <footer className="bg-white border-t mt-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-8">
              <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-700">
                {language === 'en' ? 'Privacy Policy' : 'Πολιτική Απορρήτου'}
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-500 hover:text-gray-700">
                {language === 'en' ? 'Terms of Service' : 'Όροι Χρήσης'} 
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Air Gourmet Hellas. {language === 'en' ? 'All rights reserved.' : 'Όλα τα δικαιώματα διατηρούνται.'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
