import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import PropertyToursList from "@/components/property/PropertyToursList";
import { Calendar, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ToursPage() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <Helmet>
        <title>My Property Tours | Inmobi</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Property Tours</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your scheduled property tours
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Upcoming Tours
              </CardTitle>
              <CardDescription>
                Tours pending or confirmed
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>-</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Completed Tours
              </CardTitle>
              <CardDescription>
                Tours you have attended
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>-</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Next Tour
              </CardTitle>
              <CardDescription>
                Your next scheduled tour
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="font-medium">No upcoming tours</div>
              <div className="text-muted-foreground">
                Schedule a tour to see properties
              </div>
            </CardContent>
          </Card>
        </div>
        
        <PropertyToursList type="user" />
      </div>
    </DashboardLayout>
  );
}