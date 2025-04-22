
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface FavoritesContextType {
  favorites: number[];
  isFavorite: (propertyId: number) => boolean;
  toggleFavorite: (propertyId: number) => Promise<void>;
  removeFavorite: (propertyId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        if (user) {
          const response = await apiRequest("GET", `/api/favorites/${user.id}`);
          const favoriteProperties = await response.json();
          setFavorites(favoriteProperties.map((prop: any) => prop.id));
        } else {
          const storedFavorites = localStorage.getItem("favorites");
          if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
          }
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadFavorites();
  }, [user]);

  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, isInitialized, user]);

  const isFavorite = (propertyId: number): boolean => {
    return favorites.includes(propertyId);
  };

  const toggleFavorite = async (propertyId: number): Promise<void> => {
    try {
      if (isFavorite(propertyId)) {
        await removeFavorite(propertyId);
      } else {
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please log in to save favorites.",
            variant: "destructive",
          });
          return;
        }
        
        await apiRequest("POST", "/api/favorites", {
          userId: user.id,
          propertyId,
        });
        
        setFavorites((prev) => [...prev, propertyId]);
        toast({
          title: "Added to favorites",
          description: "Property has been added to your favorites.",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFavorite = async (propertyId: number): Promise<void> => {
    try {
      if (!user) {
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
        return;
      }
      
      await apiRequest("DELETE", `/api/favorites/${user.id}/${propertyId}`);
      
      setFavorites((prev) => prev.filter((id) => id !== propertyId));
      toast({
        title: "Removed from favorites",
        description: "Property has been removed from your favorites.",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
