import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property, User } from "@shared/schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart4, 
  Building, 
  Check, 
  Cog, 
  ExternalLink, 
  HelpCircle, 
  Loader2, 
  MoreHorizontal, 
  Users, 
  X 
} from "lucide-react";
import PropertyCard from "@/components/property/PropertyCard";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");
  
  // Fetch properties data
  const { data: properties, isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties", { limit: 6 }],
  });
  
  // Mock users data for demonstration
  const mockUsers = [
    { id: 1, username: "sarah_kim", fullName: "Sarah Kim", email: "sarah@example.com", role: "agent", status: "active", createdAt: "2025-01-15T08:30:00Z" },
    { id: 2, username: "michael_brown", fullName: "Michael Brown", email: "michael@example.com", role: "user", status: "active", createdAt: "2025-02-20T14:45:00Z" },
    { id: 3, username: "emma_wilson", fullName: "Emma Wilson", email: "emma@example.com", role: "agent", status: "active", createdAt: "2025-03-05T11:15:00Z" },
    { id: 4, username: "david_smith", fullName: "David Smith", email: "david@example.com", role: "user", status: "inactive", createdAt: "2025-01-30T09:20:00Z" },
    { id: 5, username: "james_davis", fullName: "James Davis", email: "james@example.com", role: "user", status: "active", createdAt: "2025-02-10T16:30:00Z" },
  ];
  
  // Mock pending approvals data
  const pendingApprovals = [
    { id: 1, type: "property", name: "Luxury Beachfront Villa", user: "Emma Wilson", date: "2025-04-20T09:45:00Z" },
    { id: 2, type: "agent", name: "John Simmons", user: "John Simmons", date: "2025-04-19T14:30:00Z" },
    { id: 3, type: "property", name: "Modern Urban Apartment", user: "Sarah Kim", date: "2025-04-18T11:20:00Z" },
  ];

  // Analytics data
  const analyticsData = {
    userCount: {
      day: 12,
      week: 68,
      month: 234
    },
    propertyCount: {
      day: 8,
      week: 42,
      month: 156
    },
    pageViews: {
      day: 1250,
      week: 8450,
      month: 32600
    },
    revenue: {
      day: 2800,
      week: 18500,
      month: 72000
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, properties, and system settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Cog className="mr-2 h-4 w-4" />
            System Settings
          </Button>
          <Button className="bg-[#131313]">
            Generate Reports
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userCount[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "day" ? 5 : timeframe === "week" ? 12 : 18}%</span>
              <span className="text-xs text-muted-foreground ml-1">from previous {timeframe}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Properties
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.propertyCount[timeframe]}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "day" ? 2 : timeframe === "week" ? 8 : 15}%</span>
              <span className="text-xs text-muted-foreground ml-1">from previous {timeframe}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Page Views
            </CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pageViews[timeframe].toLocaleString()}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "day" ? 12 : timeframe === "week" ? 22 : 18}%</span>
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
              <span className="text-xs text-emerald-500 font-medium">+{timeframe === "day" ? 7 : timeframe === "week" ? 15 : 28}%</span>
              <span className="text-xs text-muted-foreground ml-1">from previous {timeframe}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <div className="inline-flex rounded-md bg-neutral-100">
          <Button
            variant={timeframe === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("day")}
            className={timeframe === "day" ? "bg-[#131313]" : ""}
          >
            Day
          </Button>
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
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>
        
        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items Pending Approval</CardTitle>
              <CardDescription>
                Review and manage submissions waiting for admin approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.user}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-emerald-500">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500">
                                <X className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <HelpCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">No pending approvals</h3>
                  <p className="text-muted-foreground">
                    All submissions have been reviewed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 font-medium">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "outline"} className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "outline" : "destructive"} className={`capitalize ${user.status === "active" ? "text-emerald-600" : ""}`}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit user</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className={user.status === "active" ? "text-red-600" : "text-emerald-600"}>
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Recent Properties</h2>
              <Button variant="outline">View All</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingProperties ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
                </div>
              ) : properties && properties.length > 0 ? (
                properties.slice(0, 6).map(property => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    variant="default"
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <h3 className="text-lg font-medium mb-2">No properties found</h3>
                  <p className="text-muted-foreground">
                    There are no properties in the system yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}