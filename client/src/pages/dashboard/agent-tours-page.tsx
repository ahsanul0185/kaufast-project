import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import PropertyToursList from "@/components/property/PropertyToursList";
import { PropertyTourService } from "@/lib/property-tour-service";
import { User, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AgentToursPage() {
  const { user } = useAuth();
  
  // Fetch tour stats
  const { data: tours, isLoading } = useQuery({
    queryKey: ["property-tours", "agent", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await PropertyTourService.getAgentTours(user.id);
    },
    enabled: !!user?.id,
  });
  
  // Calculate stats
  const pendingTours = tours?.filter(tour => tour.status === "pending").length || 0;
  const confirmedTours = tours?.filter(tour => tour.status === "confirmed").length || 0;
  const completedTours = tours?.filter(tour => tour.status === "completed").length || 0;
  
  return (
    <DashboardLayout>
      <Helmet>
        <title>Tour Management | Inmobi</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tour Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage property tours and client appointments
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Pending Tours
              </CardTitle>
              <CardDescription>
                Require your confirmation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              <div>{isLoading ? "-" : pendingTours}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Confirmed Tours
              </CardTitle>
              <CardDescription>
                Upcoming scheduled tours
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              <div>{isLoading ? "-" : confirmedTours}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Completed Tours
              </CardTitle>
              <CardDescription>
                Tours that have taken place
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              <div>{isLoading ? "-" : completedTours}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Clients
              </CardTitle>
              <CardDescription>
                Unique clients with tours
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold flex items-center">
              <User className="h-5 w-5 mr-2 text-violet-500" />
              <div>{isLoading ? "-" : "0"}</div>
            </CardContent>
          </Card>
        </div>
        
        <PropertyToursList type="agent" />
      </div>
    </DashboardLayout>
  );
}