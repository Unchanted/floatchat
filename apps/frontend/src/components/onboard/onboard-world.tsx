"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { indianOceanBuoys, type Buoy } from "./data/buoys";
import { Button } from "../../../../../packages/ui/src/components/button";
import { MapPin, Waves, Navigation } from "lucide-react";

// Using a lightweight world TopoJSON from Natural Earth
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function OnboardWorld() {
  const router = useRouter();
  const [hoveredBuoy, setHoveredBuoy] = useState<Buoy | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedBuoy, setSelectedBuoy] = useState<Buoy | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleBuoyMouseEnter = (buoy: Buoy) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredBuoy(buoy);
    }, 300); // 300ms delay to prevent flickering
    setHoverTimeout(timeout);
  };

  const handleBuoyMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setHoveredBuoy(null);
  };

  const handleBuoyClick = (buoy: Buoy) => {
    console.log("Buoy clicked:", buoy.name);
    setSelectedBuoy(buoy);
    setTimeout(() => {
      console.log("Redirecting to /welcome...");
      router.push("/welcome");
    }, 800);
  };

  const handleBuoyKeyDown = (event: React.KeyboardEvent, buoy: Buoy) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleBuoyClick(buoy);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-black/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Full Screen World Map */}
      <div className={`absolute inset-0 transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 180,
            center: [75, 0],
          }}
          className="w-full h-full"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#ffffff",
                      stroke: "#d1d5db",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#f9fafb",
                      stroke: "#9ca3af",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    pressed: {
                      fill: "#f3f4f6",
                      stroke: "#6b7280",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Enhanced Buoy Markers */}
          {indianOceanBuoys.map((buoy, index) => (
            <Marker
              key={buoy.id}
              coordinates={buoy.coordinates}
            >
              <g>
                {/* Invisible larger clickable area */}
                <circle
                  r={25}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Large area clicked for buoy:", buoy.name);
                    handleBuoyClick(buoy);
                  }}
                  onKeyDown={(e) => handleBuoyKeyDown(e, buoy)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Navigate to ${buoy.name} in ${buoy.region}`}
                />
                
                {/* Multiple pulse rings for depth */}
                <circle
                  r={20}
                  fill="url(#blackGradient)"
                  fillOpacity={hoveredBuoy?.id === buoy.id ? 0.2 : 0.1}
                  className="animate-ping transition-all duration-300 pointer-events-none"
                  style={{ animationDelay: `${index * 300}ms`, animationDuration: '3s' }}
                />
                <circle
                  r={15}
                  fill="url(#blackGradient)"
                  fillOpacity={hoveredBuoy?.id === buoy.id ? 0.25 : 0.15}
                  className="animate-ping transition-all duration-300 pointer-events-none"
                  style={{ animationDelay: `${index * 300 + 500}ms`, animationDuration: '2.5s' }}
                />
                <circle
                  r={10}
                  fill="url(#blackGradient)"
                  fillOpacity={hoveredBuoy?.id === buoy.id ? 0.3 : 0.2}
                  className="animate-ping transition-all duration-300 pointer-events-none"
                  style={{ animationDelay: `${index * 300 + 1000}ms`, animationDuration: '2s' }}
                />
                
                {/* Main buoy marker with enhanced styling */}
                <circle
                  r={8}
                  fill="url(#blackGradient)"
                  stroke="white"
                  strokeWidth={3}
                  className={`cursor-pointer transition-all duration-300 ease-out hover:scale-125 hover:drop-shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-400/50 ${
                    selectedBuoy?.id === buoy.id ? 'scale-125 drop-shadow-2xl' : ''
                  } ${hoveredBuoy?.id === buoy.id ? 'scale-110 drop-shadow-xl' : ''}`}
                  onMouseEnter={() => handleBuoyMouseEnter(buoy)}
                  onMouseLeave={handleBuoyMouseLeave}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Circle clicked for buoy:", buoy.name);
                    handleBuoyClick(buoy);
                  }}
                  onKeyDown={(e) => handleBuoyKeyDown(e, buoy)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Navigate to ${buoy.name} in ${buoy.region}`}
                />
                
                {/* Inner highlight with wave effect */}
                <circle
                  r={4}
                  fill="white"
                  fillOpacity={0.9}
                  className="animate-pulse pointer-events-none"
                />
                
                {/* Data point indicator */}
                <circle
                  r={1.5}
                  fill="url(#blackGradient)"
                  className="animate-pulse pointer-events-none"
                  style={{ animationDelay: `${index * 200}ms` }}
                />
              </g>
            </Marker>
          ))}
          
          {/* Enhanced gradient definitions */}
          <defs>
            <linearGradient id="blackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="50%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
            <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
            </radialGradient>
          </defs>
        </ComposableMap>
      </div>

      {/* Minimalist Header */}
      <div className={`absolute top-0 left-0 right-0 z-20 transition-all duration-1000 delay-300 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="FloatChat Logo" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-semibold text-gray-800">FloatChat</h1>
              <p className="text-sm text-gray-500">Real-time ocean insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side Text */}
      {/* <div className={`absolute left-8 top-1/2 transform -translate-y-1/2 z-20 transition-all duration-1000 delay-400 ${
        isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}>
        <div className="max-w-md text-left">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
            Real-time <span className="italic">data</span> insights
          </h2>
          <p className="text-lg text-gray-600 mt-4 font-serif leading-relaxed">
            Eleven buoys monitoring the Indian Ocean
          </p>
        </div>
      </div> */}

      {/* Branding Title on Map */}
      <div className={`absolute right-8 top-1/2 transform -translate-y-1/2 z-20 transition-all duration-1000 delay-500 ${
        isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}>
        <div className="max-w-md text-right">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            Discover <span className="italic">ocean</span> intelligence
          </h2>
          <p className="text-lg text-gray-600 mt-4 font-serif leading-relaxed">
            Real-time data from buoys across the Indian Ocean
          </p>
        </div>
      </div>
      

      {/* Floating Action Hint */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-1000 delay-700 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="bg-white/90 backdrop-blur-md border border-gray-200/20 rounded-2xl px-6 py-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Navigation className="h-5 w-5 text-gray-800 animate-bounce" />
            <p className="text-gray-700 font-medium">Click any buoy to explore data</p>
          </div>
        </div>
      </div>

      {/* Enhanced Tooltip with better positioning and animations */}
      {hoveredBuoy && (
        <div className="fixed top-8 right-8 z-30 pointer-events-auto">
          <div className="relative">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gray-500/20 rounded-3xl blur-xl scale-110 animate-pulse"></div>
            
            {/* Main tooltip */}
            <div className="relative bg-white/95 backdrop-blur-xl border border-gray-200/30 rounded-3xl p-6 shadow-2xl max-w-sm transform transition-all duration-300 ease-out animate-in slide-in-from-right-5 fade-in-0">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-1">
                    {hoveredBuoy.name}
                  </h4>
                  <p className="text-sm text-gray-600 font-semibold mb-3">
                    {hoveredBuoy.region}
                  </p>
                  {hoveredBuoy.description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {hoveredBuoy.description}
                    </p>
                  )}
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    onClick={() => handleBuoyClick(hoveredBuoy)}
                  >
                    Explore Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for smooth transitions */}
      {selectedBuoy && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
              <img src="/logo.svg" alt="FloatChat Logo" className="w-10 h-10" />
            </div>
            <p className="text-lg font-semibold text-gray-800">Loading {selectedBuoy.name} data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
