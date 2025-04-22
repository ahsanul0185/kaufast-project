import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";
import PropertyDraftButton from "@/components/property/PropertyDraftButton";
import BulkUploadForm from "@/components/dashboard/BulkUploadForm";
import ContactButton from "@/components/ui/contact-button";
import { 
  AreaChart, 
  BarChart4, 
  Building, 
  Loader2, 
  MessageSquare, 
  Plus, 
  User2, 
  Users
} from "lucide-react";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      // In a real app, we would filter by agent ID
      const res = await fetch("/api/properties?limit=6");
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    },
  });
  
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/messages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/messages/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!user,
  });

  // Analytics data (mock data for demonstration)
  const analyticsData = {
    propertyViews: {
      week: 128,
      month: 543,
      year: 6249
    },
    inquiries: {
      week: 15,
      month: 47,
      year: 312
    },
    conversions: {
      week: 3,
      month: 12,
      year: 37
    },
    revenue: {
      week: 4200,
      month: 15600,
      year: 187500
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Agent Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your properties and view important metrics
          </p>
        </div>
        <div className="flex gap-2">
          <PropertyDraftButton />
          <ContactButton variant="inline" label="Report Issue" reportType="error" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Property Views
            </CardTitle>
            <AreaChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.propertyViews[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "week" ? 12 : timeframe === "month" ? 23 : 18}%</span>
              <span className="text-xs text-muted-foreground ml-1">from previous {timeframe}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inquiries
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.inquiries[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "week" ? 8 : timeframe === "month" ? 15 : 22}%</span>
              <span className="text-xs text-muted-foreground ml-1">from previous {timeframe}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversions[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "week" ? 5 : timeframe === "month" ? 10 : 18}%</span>
              <span className="text-xs text-muted-foreground ml-1">from previous {timeframe}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.revenue[timeframe].toLocaleString()}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "week" ? 7 : timeframe === "month" ? 12 : 25}%</span>
              <span className="text-xs text-muted-foreground ml-1">from previous {timeframe}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <div className="inline-flex rounded-md bg-neutral-100">
          <Button
            variant={timeframe === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("week")}
            className={timeframe === "week" ? "bg-[#131313]" : ""}
          >
            Week
          </Button>
          <Button
            variant={timeframe === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("month")}
            className={timeframe === "month" ? "bg-[#131313]" : ""}
          >
            Month
          </Button>
          <Button
            variant={timeframe === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("year")}
            className={timeframe === "year" ? "bg-[#131313]" : ""}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="inquiries">Client Inquiries</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
        </TabsList>
        
        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingProperties ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
              </div>
            ) : properties && properties.length > 0 ? (
              properties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  variant="default"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <h3 className="text-lg font-medium mb-2">No properties listed yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start adding properties to your portfolio
                </p>
                <PropertyDraftButton />
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-4">
          <div className="rounded-md border">
            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="divide-y">
                {messages.map((message: any) => (
                  <div key={message.id} className="p-4 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium">
                      <User2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{message.senderName || "Client"}</h4>
                        <span className="text-xs text-neutral-500">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{message.content}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center text-xs text-neutral-500">
                          <Building className="mr-1 h-3 w-3" />
                          <span>{message.propertyTitle || "Property Inquiry"}</span>
                        </div>
                        <Button size="sm" variant="outline">Reply</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No inquiries yet</h3>
                <p className="text-muted-foreground">
                  Client inquiries about your properties will appear here
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Your property performance metrics for the current {timeframe}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Top Performing Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sample performance data */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded bg-neutral-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-[#131313]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">Luxury Apartment {i}</p>
                            <div className="flex items-center text-xs text-neutral-500">
                              <span>{120 + i * 30} views</span>
                              <span className="mx-1">•</span>
                              <span>{5 + i * 2} inquiries</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[150px] flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold">{Math.round((analyticsData.conversions[timeframe] / analyticsData.inquiries[timeframe]) * 100)}%</div>
                      <p className="text-sm text-neutral-500">Inquiry to sale conversion</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload" className="space-y-4">
          <BulkUploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}