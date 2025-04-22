import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PremiumFeatureWrapper from "@/components/subscription/PremiumFeatureWrapper";
import { 
  AreaChart, 
  BarChart2,
  LineChart, 
  Loader2,
  PieChart,
  TrendingUp
} from "lucide-react";

export default function AgentAnalyticsPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track the performance of your property listings
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">482</div>
                  <p className="text-xs text-muted-foreground">
                    +34% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    +18% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8%</div>
                  <p className="text-xs text-muted-foreground">
                    +1.2% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>
                    Property views and inquiries over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <AreaChart className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Analytics charts will be implemented soon
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Top Performing Properties</CardTitle>
                  <CardDescription>
                    Properties with highest engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <BarChart2 className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Analytics charts will be implemented soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Properties Analytics</CardTitle>
                <CardDescription>
                  Coming soon
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Loader2 className="h-16 w-16 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    This section is under development and will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="visits" className="space-y-4">
            <PremiumFeatureWrapper 
              feature="Detailed Visit Analytics"
              description="Track all visits to your properties with detailed insights and visitor demographics."
            >
              <Card>
                <CardHeader>
                  <CardTitle>Visits Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive visitor analytics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-16 w-16 mx-auto animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading visitor analytics...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </PremiumFeatureWrapper>
          </TabsContent>
          
          <TabsContent value="inquiries" className="space-y-4">
            <PremiumFeatureWrapper 
              feature="Inquiry Insights"
              description="Get detailed analytics on user inquiries and conversion rates for your properties."
            >
              <Card>
                <CardHeader>
                  <CardTitle>Inquiries Analytics</CardTitle>
                  <CardDescription>
                    Detailed breakdown of all property inquiries
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-16 w-16 mx-auto animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading inquiry analytics...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </PremiumFeatureWrapper>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}