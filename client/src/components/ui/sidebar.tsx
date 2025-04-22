import * as React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div className={cn("w-64 flex-shrink-0 h-screen bg-white", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, children, ...props }: SidebarMenuProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  active?: boolean;
}

export function SidebarMenuItem({ 
  className, 
  href, 
  active, 
  children, 
  ...props 
}: SidebarMenuItemProps) {
  return (
    <Link href={href}>
      <a 
        className={cn(
          "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-100", 
          active && "bg-neutral-100 text-primary",
          className
        )} 
        {...props}
      >
        {children}
      </a>
    </Link>
  );
}