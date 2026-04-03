import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Globe2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../lib/api";

// Fix Leaflet default icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// India constraints
const INDIA_BOUNDS = [
  [6.7535, 68.1624],
  [37.09, 97.3956],
];
const INDIA_CENTER = [22.5937, 78.9629];

function MapBoundsController() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(INDIA_BOUNDS);
    map.options.minZoom = 5;
  }, [map]);
  return null;
}

function FlyToLogic() {
  const map = useMap();
  const location = useLocation();
  useEffect(() => {
    if (location.state?.focusPin) {
      const { lat, lng } = location.state.focusPin;
      map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
    }
  }, [location.state, map]);
  return null;
}

export default function MapDashboard({ isDark }) {
  const location = useLocation();
  const [region, setRegion] = useState(location.state?.focusPin ? "India" : null); // null, "India"
  const [isRevealing, setIsRevealing] = useState(false);
  const [sightings, setSightings] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/sightings");
        setSightings(data);
      } catch (err) {
        console.error("Failed to load sightings for map", err);
      }
    }
    load();
  }, []);

  const handleSelectIndia = () => {
    setIsRevealing(true);
    // Delay to allow quote sequence to play before removing selector overlay entirely
    setTimeout(() => {
      setRegion("India");
      setIsRevealing(false);
    }, 3800); 
  };

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const PARK_PINS = [
    { id: "park-1", lat: 27.1648, lng: 77.5190, speciesName: "Keoladeo National Park", userName: "BioDex Admin", cityName: "Bharatpur, Rajasthan" },
    { id: "park-2", lat: 19.2272, lng: 72.9157, speciesName: "Sanjay Gandhi National Park", userName: "BioDex Admin", cityName: "Mumbai, Maharashtra" },
    { id: "park-3", lat: 26.5775, lng: 93.1711, speciesName: "Kaziranga National Park", userName: "BioDex Admin", cityName: "Assam" },
    { id: "park-4", lat: 29.5300, lng: 78.7747, speciesName: "Jim Corbett National Park", userName: "BioDex Admin", cityName: "Uttarakhand" },
  ];

  const pins = sightings.length > 0 ? sightings : PARK_PINS;

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
      
      {/* ── Map ── */}
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        className="w-full h-full z-0"
        zoomControl={true}
        maxBoundsViscosity={1.0}
      >
        <MapBoundsController />
        <FlyToLogic />
        <TileLayer
          key={isDark ? "dark" : "light"}
          attribution='&copy; CARTO'
          url={tileUrl}
        />

        {region === "India" && pins.map((pin) => (
          <Marker position={[pin.lat, pin.lng]} key={pin.id}>
            <Popup className="custom-popup">
              <div className="font-sans">
                <p className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 mb-1">
                  {pin.speciesName}
                </p>
                <p className="text-xs text-zinc-500">
                  Detected by <span className="text-emerald-600 font-medium">{pin.userName || "Unknown"}</span>
                </p>
                {pin.cityName && (
                  <p className="text-[10px] text-zinc-400 mt-1">{pin.cityName}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Region Selector Overlay & Cinematic Quote Reveal ────── */}
      <AnimatePresence>
        {region !== "India" && (
          <motion.div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900"
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              {!isRevealing ? (
                /* Step 1: Region Selector Modal */
                <motion.div 
                  key="selector"
                  initial={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  exit={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.5 }}
                  className="relative glass p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl flex flex-col items-center text-center mx-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-zinc-800/40 rounded-[2.5rem] pointer-events-none" />
                  
                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                      <Globe2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Select Region</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs">
                      Wildlife populations differ globally. Where are you tracking today?
                    </p>

                    <div className="w-full space-y-3">
                      <button 
                        onClick={handleSelectIndia}
                        className="group w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-2xl transition-all hover:shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-xl">🇮🇳</span> 
                          <span>India</span>
                        </span>
                        <span className="text-emerald-50 text-xs font-medium uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                          Enter →
                        </span>
                      </button>

                      {/* Unavailable Regions */}
                      <div className="w-full py-4 px-6 bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-400 font-medium rounded-2xl flex items-center justify-between cursor-not-allowed">
                        <span className="flex items-center gap-3">
                          <span className="text-xl opacity-50">🇺🇸</span> 
                          <span>North America</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider"><Lock className="w-3 h-3"/> Soon</span>
                      </div>

                      <div className="w-full py-4 px-6 bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-400 font-medium rounded-2xl flex items-center justify-between cursor-not-allowed">
                        <span className="flex items-center gap-3">
                          <span className="text-xl opacity-50">🇪🇺</span> 
                          <span>Europe</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider"><Lock className="w-3 h-3"/> Soon</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Step 2: Cinematic Quote Sequence */
                <motion.div 
                  key="quote"
                  initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="max-w-2xl text-center px-6"
                >
                  <p className="text-2xl md:text-4xl font-serif text-zinc-800 dark:text-zinc-200 leading-relaxed italic mb-4">
                    "Look deep into nature, and then you will understand everything better."
                  </p>
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "3rem" }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="h-0.5 bg-emerald-500 mx-auto"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
