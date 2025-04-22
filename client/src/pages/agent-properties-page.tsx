import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import { Link } from "wouter";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AddPropertyDialog from "@/components/property/AddPropertyDialog";
import BulkPropertyUpload from "@/components/property/BulkPropertyUpload";
import PremiumPropertyBadge from "@/components/property/PremiumPropertyBadge";
import { 
  Building, 
  Edit, 
  Eye, 
  Loader2, 
  MoreVertical, 
  Plus, 
  Trash, 
} from "lucide-react";

export default function AgentPropertiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch properties for the current agent
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const res = await fetch(`/api/properties?ownerId=${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
  });
  
  // Property filter based on active tab
  const filteredProperties = properties?.filter(property => {
    if (activeTab === "all") return true;
    if (activeTab === "sale") return property.listingType === "sell";
    if (activeTab === "rent") return property.listingType === "rent";
    if (activeTab === "premium") return property.isPremium;
    return true;
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Properties</h2>
            <p className="text-muted-foreground">
              Manage your property listings
            </p>
          </div>
          <Button 
            onClick={() => setIsAddPropertyOpen(true)}
            className="bg-[#131313]"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Properties</TabsTrigger>
            <TabsTrigger value="sale">For Sale</TabsTrigger>
            <TabsTrigger value="rent">For Rent</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-xl">Property Listings</CardTitle>
                <CardDescription>
                  {isLoading 
                    ? "Loading your properties..." 
                    : `${filteredProperties?.length || 0} properties found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProperties && filteredProperties.length > 0 ? (
                          filteredProperties.map((property) => (
                            <TableRow key={property.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4 text-muted-foreground" />
                                  <span>{property.title}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={property.isVerified ? "default" : "outline"}>
                                  {property.isVerified ? "Verified" : "Pending"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                ${property.price.toLocaleString()}
                                {property.listingType === "rent" && "/mo"}
                              </TableCell>
                              <TableCell>
                                {/* This would be a real view count in a production app */}
                                {Math.floor(Math.random() * 100) + 10}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={`/property/${property.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No properties found. Click "Add Property" to create a new listing.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Add Bulk Upload Option */}
            <BulkPropertyUpload />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Enhanced Add Property Dialog with Voice Input */}
      <AddPropertyDialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen} />
    </DashboardLayout>
  );
}