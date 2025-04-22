import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Mic, MapPin, Search, Home as HomeIcon } from "lucide-react";

export default function Hero() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let url = `/search?query=${encodeURIComponent(searchQuery)}`;
    if (activeTab !== "all") {
      url += `&propertyType=${activeTab}`;
    }
    navigate(url);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16">
      {/* Main background image with property */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Luxury property background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Title section - white text on dark background */}
        <div className="mb-10 text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Guiding your path<br />to a new home
          </h1>
          
          <div className="flex flex-col md:flex-row justify-between md:items-end">
            <p className="text-lg text-gray-100 max-w-md mb-4 md:mb-0">
              With expert guidance and a deep understanding of the real estate landscape, 
              we make your journey to a new home seamless and stress-free.
            </p>
            <p className="text-sm text-gray-300">©2024 INMOBI RESIDENCE. ALL RIGHT RESERVED</p>
          </div>
        </div>
        
        {/* Search bar across the screen */}
        <div className="relative">
          {/* Search form and filters */}
          <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-grow relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    type="text" 
                    placeholder="Enter city, neighborhood, address..." 
                    className="w-full p-3 pl-10 border border-gray-200 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="px-4 py-2 rounded-lg h-auto"
                    title="Voice search"
                    onClick={() => navigate('/voice-search')}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button 
                    type="submit" 
                    className="px-10 py-2 bg-black text-white hover:bg-white hover:text-black border border-black transition-all flex items-center justify-center rounded-lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Find
                  </Button>
                </div>
              </div>
              
              {/* Property type buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={activeTab === "all" ? "default" : "outline"} 
                  onClick={() => setActiveTab("all")}
                  className={`flex items-center justify-center py-2 px-6 rounded-full ${activeTab === "all" ? "bg-black text-white" : "bg-white text-black border border-gray-300"} hover:bg-black hover:text-white transition-all`}
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  All
                </Button>
                <Button 
                  variant={activeTab === "apartment" ? "default" : "outline"}
                  onClick={() => setActiveTab("apartment")}
                  className={`flex items-center justify-center py-2 px-6 rounded-full ${activeTab === "apartment" ? "bg-black text-white" : "bg-white text-black border border-gray-300"} hover:bg-black hover:text-white transition-all`}
                >
                  Apartments
                </Button>
                <Button 
                  variant={activeTab === "villa" ? "default" : "outline"}
                  onClick={() => setActiveTab("villa")}
                  className={`flex items-center justify-center py-2 px-6 rounded-full ${activeTab === "villa" ? "bg-black text-white" : "bg-white text-black border border-gray-300"} hover:bg-black hover:text-white transition-all`}
                >
                  Villas
                </Button>
                <Button 
                  variant={activeTab === "townhouse" ? "default" : "outline"}
                  onClick={() => setActiveTab("townhouse")}
                  className={`flex items-center justify-center py-2 px-6 rounded-full ${activeTab === "townhouse" ? "bg-black text-white" : "bg-white text-black border border-gray-300"} hover:bg-black hover:text-white transition-all`}
                >
                  Townhouses
                </Button>
                <Button 
                  variant={activeTab === "offplan" ? "default" : "outline"}
                  onClick={() => setActiveTab("offplan")}
                  className={`flex items-center justify-center py-2 px-6 rounded-full ${activeTab === "offplan" ? "bg-black text-white" : "bg-white text-black border border-gray-300"} hover:bg-black hover:text-white transition-all`}
                >
                  Off-plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
