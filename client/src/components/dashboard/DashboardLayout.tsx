import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Home, 
  User, 
  Heart, 
  MessageSquare, 
  Building, 
  BarChart2, 
  Settings, 
  Users, 
  BadgeCheck,
  Menu,
  X,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, href, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 font-normal",
          isActive ? "bg-black/10 font-medium" : "hover:bg-black/5"
        )}
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
      </Button>
    </Link>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const closeMobileNav = () => {
    setMobileNavOpen(false);
  };

  const userNavItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <Heart size={20} />,
      label: "Favorites",
      href: "/dashboard/favorites",
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      href: "/dashboard/messages",
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      href: "/dashboard/profile",
    },
  ];

  const agentNavItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <Building size={20} />,
      label: "My Properties",
      href: "/dashboard/properties",
    },
    {
      icon: <BarChart2 size={20} />,
      label: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      href: "/dashboard/messages",
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      href: "/dashboard/profile",
    },
    {
      icon: <Star size={20} />,
      label: "Subscription",
      href: "/subscription",
    },
  ];

  const adminNavItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <Users size={20} />,
      label: "Users",
      href: "/dashboard/users",
    },
    {
      icon: <Building size={20} />,
      label: "Properties",
      href: "/dashboard/properties",
    },
    {
      icon: <BadgeCheck size={20} />,
      label: "Approvals",
      href: "/dashboard/approvals",
    },
    {
      icon: <BarChart2 size={20} />,
      label: "Analytics",
      href: "/dashboard/analytics",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/dashboard/settings",
    },
    {
      icon: <Star size={20} />,
      label: "Subscription",
      href: "/subscription",
    },
  ];

  // Select the appropriate navigation items based on user role
  const navItems = user?.role === "admin" 
    ? adminNavItems 
    : user?.role === "agent" 
      ? agentNavItems 
      : userNavItems;

  const renderNavItems = (onClick?: () => void) => (
    <>
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={isActive(item.href)}
          onClick={onClick}
        />
      ))}
      <NavItem
        icon={<Home size={20} />}
        label="Back to Home"
        href="/"
        isActive={false}
        onClick={onClick}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-10 border-r border-neutral-200 bg-white">
        <div className="p-4 border-b border-neutral-200">
          <h1 className="text-xl font-bold">Inmobi</h1>
          <p className="text-sm text-neutral-500">
            {user?.role === "admin" 
              ? "Admin Portal" 
              : user?.role === "agent" 
                ? "Agent Portal" 
                : "User Dashboard"}
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {renderNavItems()}
        </nav>
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.fullName || user?.username}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Inmobi</h1>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
              <h1 className="text-xl font-bold">Inmobi</h1>
              <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                <X size={24} />
              </Button>
            </div>
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-medium">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-1.5">
              {renderNavItems(closeMobileNav)}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}