import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import SimpleAuth from "@/pages/simple-auth";
import RestoredAuth from "@/pages/restored-auth";
import HomePage from "@/pages/home-page";
import MenuPage from "@/pages/menu-page";
import PaymentTest from "@/pages/payment-test";
import PaymentTestSimple from "@/pages/payment-test-simple";
import PaymentSuccess from "@/pages/payment-success";
import PaymentPage from "@/pages/payment";
import AuthTest from "@/pages/auth-test";
import DirectStripeTest from "@/pages/direct-stripe-test";
import StripePublicTest from "@/pages/stripe-public-test";
import EmergencyLogin from "@/pages/emergency-login";
import SimpleLogin from "@/pages/simple-login";
import FixedOrderReview from "@/pages/client/fixed-order-review";
import PriceTest from "@/pages/price-test";
import PublicPreview from "@/pages/public-preview";
import PreviewPage from "@/pages/preview-page";
import PriceFormatTest from "@/pages/price-format-test";
import InvoiceTest from "@/pages/invoice-test";
import { ProtectedRoute } from "./lib/protected-route";
import ClientLayout from "@/pages/client/client-layout";
import NewOrder from "@/pages/client/new-order";
import OrderHistory from "@/pages/client/order-history";
import OrderDetail from "@/pages/client/order-detail";
import Account from "@/pages/client/account";
import ConciergeServices from "@/pages/client/concierge-services";
import AdminLayout from "@/pages/admin/admin-layout";
import Dashboard from "@/pages/admin/dashboard";
import MenuEditor from "@/pages/admin/menu-editor";
import Reports from "@/pages/admin/reports";
import NotificationSettings from "@/pages/admin/notification-settings";
import Inventory from "@/pages/admin/inventory";
import Schedules from "@/pages/admin/schedules";
import Integrations from "@/pages/admin/integrations";
import Settings from "@/pages/admin/settings";
import Orders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/order-detail";
import { LanguageProvider } from "@/hooks/use-language";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import { CookieConsent } from "@/components/gdpr/cookie-consent";
import ErrorBoundary from "@/components/error-boundary";
import NetworkErrorPage from "@/pages/network-error";

function Router() {
  return (
    <Switch>
      {/* Error Pages */}
      <Route path="/network-error" component={NetworkErrorPage} />
      
      {/* Public Pages */}
      <Route path="/home">
        <ErrorBoundary>
          <HomePage />
        </ErrorBoundary>
      </Route>
      <Route path="/preview" component={PreviewPage} />
      <Route path="/price-format-test" component={PriceFormatTest} />
      <Route path="/invoice-test">
        <ErrorBoundary>
          <InvoiceTest />
        </ErrorBoundary>
      </Route>
      <Route path="/auth">
        <ErrorBoundary>
          <RestoredAuth />
        </ErrorBoundary>
      </Route>
      <Route path="/menu">
        <ErrorBoundary>
          <MenuPage />
        </ErrorBoundary>
      </Route>
      <Route path="/payment-test">
        <ErrorBoundary>
          <PaymentTest />
        </ErrorBoundary>
      </Route>
      
      <Route path="/payment-test-simple">
        <ErrorBoundary>
          <PaymentTestSimple />
        </ErrorBoundary>
      </Route>
      
      <Route path="/payment-success">
        <ErrorBoundary>
          <PaymentSuccess />
        </ErrorBoundary>
      </Route>
      
      <Route path="/payment">
        <ErrorBoundary>
          <PaymentPage />
        </ErrorBoundary>
      </Route>
      
      <Route path="/auth-test">
        <ErrorBoundary>
          <AuthTest />
        </ErrorBoundary>
      </Route>
      
      <Route path="/direct-stripe-test">
        <ErrorBoundary>
          <DirectStripeTest />
        </ErrorBoundary>
      </Route>
      <Route path="/stripe-public-test">
        <ErrorBoundary>
          <StripePublicTest />
        </ErrorBoundary>
      </Route>
      <Route path="/emergency-login">
        <ErrorBoundary>
          <EmergencyLogin />
        </ErrorBoundary>
      </Route>
      <Route path="/simple-login">
        <ErrorBoundary>
          <SimpleLogin />
        </ErrorBoundary>
      </Route>
      
      <Route path="/price-test">
        <ErrorBoundary>
          <PriceTest />
        </ErrorBoundary>
      </Route>
      
      {/* Public preview page that doesn't require authentication */}
      <Route path="/preview">
        <ErrorBoundary>
          <PublicPreview />
        </ErrorBoundary>
      </Route>
      
      {/* Test routes for direct fixes */}
      <Route path="/fixed-review">
        <ErrorBoundary>
          <ClientLayout>
            <FixedOrderReview />
          </ClientLayout>
        </ErrorBoundary>
      </Route>
      
      {/* Public Landing Page */}
      <Route path="/">
        <ErrorBoundary>
          <HomePage />
        </ErrorBoundary>
      </Route>

      {/* Client routes */}
      <ProtectedRoute path="/dashboard" component={() => (
        <ClientLayout>
          <NewOrder />
        </ClientLayout>
      )} />
      <ProtectedRoute path="/concierge" component={() => (
        <ClientLayout>
          <ConciergeServices />
        </ClientLayout>
      )} />
      <ProtectedRoute path="/order-history" component={() => (
        <ClientLayout>
          <OrderHistory />
        </ClientLayout>
      )} />
      <ProtectedRoute path="/order-detail/:id" component={() => (
        <ClientLayout>
          <OrderDetail />
        </ClientLayout>
      )} />
      <ProtectedRoute path="/account" component={() => (
        <ClientLayout>
          <Account />
        </ClientLayout>
      )} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={() => (
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/orders" component={() => (
        <AdminLayout>
          <Orders />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/orders/:id" component={() => (
        <AdminLayout>
          <AdminOrderDetail />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/menu" component={() => (
        <AdminLayout>
          <MenuEditor />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/reports" component={() => (
        <AdminLayout>
          <Reports />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/notifications" component={() => (
        <AdminLayout>
          <NotificationSettings />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/inventory" component={() => (
        <AdminLayout>
          <Inventory />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/schedules" component={() => (
        <AdminLayout>
          <Schedules />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/integrations" component={() => (
        <AdminLayout>
          <Integrations />
        </AdminLayout>
      )} />
      <ProtectedRoute path="/admin/settings" component={() => (
        <AdminLayout>
          <Settings />
        </AdminLayout>
      )} />
      
      {/* GDPR/Legal Pages */}
      <Route path="/privacy-policy">
        <ErrorBoundary>
          <PrivacyPolicy />
        </ErrorBoundary>
      </Route>
      <Route path="/terms-of-service">
        <ErrorBoundary>
          <TermsOfService />
        </ErrorBoundary>
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsent />
        </TooltipProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
