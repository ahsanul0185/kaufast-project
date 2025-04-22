import React, { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Building, 
  MessageSquare, 
  Heart, 
  User,
  BarChart3,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
  Home,
  Calendar
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/use-mobile';
import Footer from './Footer';
import Navbar from './Navbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">You need to log in</h1>
          <p className="text-muted-foreground mb-6">Please log in to access this page.</p>
          <Button asChild>
            <Link href="/auth">Log In</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  const userRole = user.role || 'user';
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const avatarFallback = user.username
    ? user.username.substring(0, 2).toUpperCase()
    : 'IM';
  
  // Define links based on user role
  const navLinks = [
    { 
      href: '/dashboard', 
      icon: <LayoutDashboard className="h-4 w-4 mr-3" />, 
      label: 'Dashboard',
      roles: ['user', 'agent', 'admin'],
    },
    { 
      href: '/dashboard/properties', 
      icon: <Building className="h-4 w-4 mr-3" />, 
      label: 'My Properties',
      roles: ['agent'],
    },
    { 
      href: '/dashboard/analytics', 
      icon: <BarChart3 className="h-4 w-4 mr-3" />, 
      label: 'Analytics',
      roles: ['agent', 'admin'],
    },
    { 
      href: '/dashboard/tours', 
      icon: <Calendar className="h-4 w-4 mr-3" />, 
      label: 'My Tours',
      roles: ['user', 'agent'],
    },
    { 
      href: '/dashboard/agent-tours', 
      icon: <Calendar className="h-4 w-4 mr-3" />, 
      label: 'Tour Management',
      roles: ['agent'],
    },
    { 
      href: '/dashboard/messages', 
      icon: <MessageSquare className="h-4 w-4 mr-3" />, 
      label: 'Messages',
      roles: ['user', 'agent', 'admin'],
    },
    { 
      href: '/favorites', 
      icon: <Heart className="h-4 w-4 mr-3" />, 
      label: 'Favorites',
      roles: ['user', 'agent'],
    },
    { 
      href: '/dashboard/users', 
      icon: <Users className="h-4 w-4 mr-3" />, 
      label: 'User Management',
      roles: ['admin'],
    },
    { 
      href: '/dashboard/profile', 
      icon: <User className="h-4 w-4 mr-3" />, 
      label: 'Profile',
      roles: ['user', 'agent', 'admin'],
    },
    { 
      href: '/dashboard/security', 
      icon: <Shield className="h-4 w-4 mr-3" />, 
      label: 'Security',
      roles: ['admin'],
    },
  ];
  
  // Filter links based on user role
  const filteredLinks = navLinks.filter(link => link.roles.includes(userRole));
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 top-16 z-10 w-64 bg-white border-r transition-transform duration-300 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:static`}
        >
          <div className="flex flex-col h-full py-4">
            <div className="px-4 py-2 border-b mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar as string || ''} alt={user.username} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    {userRole}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex-1 px-3 space-y-1">
              {filteredLinks.map(link => (
                <Button
                  key={link.href}
                  variant={location === link.href ? 'secondary' : 'ghost'}
                  className={`w-full justify-start ${location === link.href ? 'bg-secondary' : ''}`}
                  asChild
                >
                  <Link href={link.href}>
                    {link.icon}
                    {link.label}
                  </Link>
                </Button>
              ))}
            </div>
            
            <div className="mt-auto px-3 pt-2 border-t">
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => logoutMutation.mutateAsync()}>
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-3" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 left-4 z-20 rounded-full w-10 h-10 shadow-md"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <ChevronLeft /> : <Menu />}
          </Button>
        )}
        
        {/* Main content */}
        <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${
          sidebarOpen && isMobile ? 'ml-64' : '0'
        }`}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}