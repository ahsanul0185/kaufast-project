import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { Property } from "@shared/schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Heart, MessageSquare, Building, ArrowRight, Loader2 } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties", { limit: 3 }],
  });
  
  const { data: favoriteProperties, isLoading: isLoadingFavorites } = useQuery<Property[]>({
    queryKey: ["/api/favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/favorites/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch favorites');
      return res.json();
    },
    enabled: !!user && favorites.length > 0,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.fullName || user?.username}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your activity and saved properties
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" className="bg-[#131313] hover:bg-[#131313]/90">
            Browse Properties
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saved Properties
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
            <p className="text-xs text-muted-foreground">
              Properties in your favorites
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Properties viewed this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unread messages from agents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Property Alerts
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Active property alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="favorites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="favorites">Saved Properties</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingFavorites ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
              </div>
            ) : favoriteProperties && favoriteProperties.length > 0 ? (
              favoriteProperties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  variant="default"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <h3 className="text-lg font-medium mb-2">No saved properties yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start browsing and save properties you're interested in
                </p>
                <Button className="bg-[#131313]">
                  Browse Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
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
                      {message.senderName?.charAt(0) || "S"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{message.senderName || "Agent"}</h4>
                        <span className="text-xs text-neutral-500">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{message.content}</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {message.propertyTitle || "Property Inquiry"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  Messages from agents and property owners will appear here
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Properties You Might Like</CardTitle>
              <CardDescription>
                Based on your favorites and browsing history
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      variant="simple"
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">
                      No recommendations available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}