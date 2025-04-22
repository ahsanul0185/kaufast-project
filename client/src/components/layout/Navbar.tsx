import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  LogOut,
  Home,
  Search,
  Menu,
  X,
  Map,
  Building,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  Heart,
  Settings,
  Crown,
  Mic,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import LanguageSelector from '../ui/language-selector';

export default function Navbar() {
  const [, navigate] = useLocation();
  const { user, logoutMutation, refetchUser } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Manually invoke refetchUser without using useEffect
  // This will simply call it once when the component is rendered
  React.useEffect(() => {
    console.log("Navbar mounted - fetching user data");
    refetchUser();
  }, [refetchUser]);
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const avatarFallback = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : 'IM';

  const toggleNav = () => setNavOpen(!navOpen);
  const closeNav = () => setNavOpen(false);

  return (
    <header className="border-b sticky top-0 z-50 bg-black text-white">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        {/* Left section - navigation */}
        <nav className={`hidden md:flex items-center space-x-1`}>
          <Button variant="ghost" asChild className="text-white hover:text-black hover:bg-white">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 text-white hover:text-black hover:bg-white">
                <Search className="w-4 h-4 mr-1" />
                Search
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/search" className="cursor-pointer" onClick={closeNav}>
                  <Search className="w-4 h-4 mr-2" />
                  Property Search
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/spatial-search" className="cursor-pointer" onClick={closeNav}>
                  <Map className="w-4 h-4 mr-2" />
                  Map Search
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/voice-search" className="cursor-pointer" onClick={closeNav}>
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Search
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" asChild className="text-white hover:text-black hover:bg-white">
            <Link href="/subscription">
              <Crown className="w-4 h-4 mr-2" />
              Premium
            </Link>
          </Button>
        </nav>

        {/* Center - Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="text-xl font-bold flex items-center">
            <span className="text-white">Inmobi</span>
          </Link>
        </div>

        {/* Right section - auth and buttons */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button className="bg-white text-black hover:bg-neutral-200 hover:text-black transition-all" asChild>
                <Link href="/dashboard/properties/new">
                  <Building className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0 text-white hover:bg-white hover:text-black">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar as string || ''} alt={user.username || 'User'} />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    {user.subscriptionTier === 'premium' && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-amber-400 text-white">
                        <Crown className="h-3 w-3" />
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'agent' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/properties" className="cursor-pointer">
                        <Building className="w-4 h-4 mr-2" />
                        My Properties
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/messages" className="cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer">
                      <Heart className="w-4 h-4 mr-2" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user.subscriptionTier !== 'premium' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/subscription" className="cursor-pointer">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Premium
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button className="bg-white text-black hover:bg-neutral-200 hover:text-black transition-all" asChild>
                <Link href="/dashboard/properties/new">
                  <Building className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </Button>
              
              <Button variant="ghost" asChild className="text-white hover:text-black hover:bg-white">
                <Link href="/auth">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            </>
          )}
          
          <LanguageSelector />
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleNav}
        >
          {navOpen ? <X /> : <Menu />}
        </Button>

        {/* Mobile navigation menu */}
        {isMobile && navOpen && (
          <div className="fixed inset-0 top-16 bg-black text-white z-40 p-4">
            <div className="flex justify-center mb-6">
              <Link href="/" className="text-xl font-bold" onClick={closeNav}>
                <span className="text-white">Inmobi</span>
              </Link>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white">
                <Link href="/" className="justify-start">
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </Link>
              </Button>
              
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white">
                <Link href="/search" className="justify-start">
                  <Search className="w-5 h-5 mr-2" />
                  Property Search
                </Link>
              </Button>
              
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white">
                <Link href="/spatial-search" className="justify-start">
                  <Map className="w-5 h-5 mr-2" />
                  Map Search
                </Link>
              </Button>
              
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white">
                <Link href="/voice-search" className="justify-start">
                  <Mic className="w-5 h-5 mr-2" />
                  Voice Search
                </Link>
              </Button>
              
              <Button variant="ghost" asChild onClick={closeNav} className="text-white hover:text-black hover:bg-white">
                <Link href="/subscription" className="justify-start">
                  <Crown className="w-5 h-5 mr-2" />
                  Premium
                </Link>
              </Button>
              
              {user ? (
                <>
                  <div className="border-t border-gray-700 pt-4 mt-2">
                    <div className="flex items-center mb-4">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={user.avatar as string || ''} alt={user.username || 'User'} />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{user.username}</div>
                        <div className="text-sm text-gray-300 truncate">{user.email}</div>
                      </div>
                    </div>
                    
                    <Button className="bg-white text-black hover:bg-neutral-200 w-full mb-4" asChild onClick={closeNav}>
                      <Link href="/dashboard/properties/new">
                        <Building className="w-4 h-4 mr-2" />
                        Add Property
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-start text-white hover:text-black hover:bg-white">
                      <Link href="/dashboard">
                        <LayoutDashboard className="w-5 h-5 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    
                    {user.role === 'agent' && (
                      <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-start text-white hover:text-black hover:bg-white">
                        <Link href="/dashboard/properties">
                          <Building className="w-5 h-5 mr-2" />
                          My Properties
                        </Link>
                      </Button>
                    )}
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-start text-white hover:text-black hover:bg-white">
                      <Link href="/dashboard/messages">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Messages
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-start text-white hover:text-black hover:bg-white">
                      <Link href="/favorites">
                        <Heart className="w-5 h-5 mr-2" />
                        Favorites
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" asChild onClick={closeNav} className="w-full justify-start text-white hover:text-black hover:bg-white">
                      <Link href="/dashboard/profile">
                        <Settings className="w-5 h-5 mr-2" />
                        Settings
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-300 hover:text-red-500 hover:bg-red-900">
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </Button>
                    
                    <div className="mt-6">
                      <LanguageSelector />
                    </div>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-700 pt-4 flex flex-col gap-4">
                  <Button className="bg-white text-black hover:bg-neutral-200 w-full" asChild onClick={closeNav}>
                    <Link href="/dashboard/properties/new">
                      <Building className="w-4 h-4 mr-2" />
                      Add Property
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black" asChild onClick={closeNav}>
                    <Link href="/auth">
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                  
                  <div className="mt-4">
                    <LanguageSelector />
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}