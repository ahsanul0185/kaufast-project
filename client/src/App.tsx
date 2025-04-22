import { Route, Switch } from "wouter";
import HomePage from "@/pages/home-page";
import SearchResultsPage from "@/pages/search-results-page";
import PropertyDetailsPage from "@/pages/property-details-page";
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import AgentPropertiesPage from "@/pages/agent-properties-page";
import AgentAnalyticsPage from "@/pages/agent-analytics-page";
import MessagesPage from "@/pages/messages-page";
import ProfilePage from "@/pages/profile-page";
import VoiceSearchPage from "@/pages/voice-search-page";
import SpatialSearchPage from "@/pages/spatial-search-page";
import SubscriptionPage from "@/pages/subscription-page";
import SubscribePage from "@/pages/subscribe-page";
import SubscriptionSuccessPage from "@/pages/subscription-success-page";
import ImageEditorDemoPage from "@/pages/image-editor-demo-page";
import ToursPage from "@/pages/dashboard/tours-page";
import AgentToursPage from "@/pages/dashboard/agent-tours-page";
import { FavoritesProvider } from "@/hooks/use-favorites";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Toaster } from "@/components/ui/toaster";
import ContactButton from "@/components/ui/contact-button";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <Switch>
            {/* Public routes */}
            <Route path="/auth" component={AuthPage} />
            <Route path="/" component={HomePage} />
            <Route path="/property/:id" component={PropertyDetailsPage} />
            <Route path="/search" component={SearchResultsPage} />
            <Route path="/voice-search" component={VoiceSearchPage} />
            <Route path="/spatial-search" component={SpatialSearchPage} />
            <Route path="/image-editor-demo" component={ImageEditorDemoPage} />
            
            {/* Protected routes - accessible to all authenticated users */}
            <ProtectedRoute path="/dashboard" component={DashboardPage} />
            <ProtectedRoute path="/dashboard/properties" component={AgentPropertiesPage} />
            <ProtectedRoute path="/dashboard/analytics" component={AgentAnalyticsPage} />
            <ProtectedRoute path="/dashboard/messages" component={MessagesPage} />
            <ProtectedRoute path="/dashboard/profile" component={ProfilePage} />
            <ProtectedRoute path="/dashboard/tours" component={ToursPage} />
            <ProtectedRoute path="/dashboard/agent-tours" component={AgentToursPage} />
            
            {/* Subscription routes */}
            <ProtectedRoute path="/subscription" component={SubscriptionPage} />
            <ProtectedRoute path="/subscribe" component={SubscribePage} />
            <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
            
            {/* Fallback route */}
            <Route component={NotFound} />
          </Switch>
          <Toaster />
          <ContactButton variant="fixed" reportType="any" />
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;