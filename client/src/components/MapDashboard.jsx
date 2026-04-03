import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SubmissionModal from "./SubmissionModal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  // Merge real sightings with demo pins if no real ones yet
  const DEMO_PINS = [
    { id: "demo-1", lat: 28.6139, lng: 77.2090, speciesName: "Rhesus Macaque", userName: "WildlifeExplorer", cityName: "Delhi" },
    { id: "demo-2", lat: 19.0760, lng: 72.8777, speciesName: "Indian Peafowl", userName: "NatureLover", cityName: "Mumbai" },
    { id: "demo-3", lat: 12.9716, lng: 77.5946, speciesName: "Slender Loris", userName: "NightWatcher", cityName: "Bangalore" },
  ];

  const pins = sightings.length > 0 ? sightings : DEMO_PINS;

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-zinc-100 dark:bg-zinc-900 overflow-hidden">

      {/* ── Map ── */}
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        className="w-full h-full z-0"
        zoomControl={false}
        maxBoundsViscosity={1.0}
      >
        <MapBoundsController />
        <FlyToLogic />
        <TileLayer
          key={isDark ? "dark" : "light"}
          attribution='&copy; CARTO'
          url={tileUrl}
        />

        {pins.map((pin) => (
          <Marker position={[pin.lat, pin.lng]} key={pin.id}>
            <Popup className="custom-popup">
              <div className="font-sans">
                <p className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 mb-1">
                  {pin.speciesName}
                </p>
                <p className="text-xs text-zinc-500">
                  Spotted by <span className="text-emerald-600 font-medium">{pin.userName || "Unknown"}</span>
                </p>
                {pin.cityName && (
                  <p className="text-[10px] text-zinc-400 mt-1">{pin.cityName}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── FAB — Log Sighting ── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <button
          className="group flex gap-2 items-center px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.3)] transition-all transform hover:scale-105 active:scale-95"
          onClick={() => setIsModalOpen(true)}
        >
          <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Log Sighting</span>
        </button>
      </motion.div>

      <SubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
