import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType<any>;
  allowedRoles?: string[];
};

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = ["user", "agent", "admin"],
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        // Always render a component, never return null conditionally
        // This prevents the "rendered fewer hooks than expected" error
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-[#131313]" />
            </div>
          );
        }

        if (!user) {
          // If using redirect component, still render it (not just return it)
          return (
            <div>
              <Redirect to="/auth" />
            </div>
          );
        }

        // Check if user has the required role
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-gray-600 text-center mb-6">
                You don't have permission to access this page.
              </p>
              <Redirect to="/" />
            </div>
          );
        }

        // User is authenticated and has permission
        return <Component {...params} />;
      }}
    </Route>
  );
}