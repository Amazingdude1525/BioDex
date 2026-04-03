import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bookmark, BookmarkCheck, Loader2, Heart, Navigation } from "lucide-react";
import api from "../lib/api";

function SightingCard({ sighting, isSaved, onSave, onMapClick }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(sighting.likesCount || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    try { await api.patch(`/sightings/${sighting.id}/like`); } catch {}
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="break-inside-avoid relative group flex flex-col mb-5 cursor-zoom-in"
      onClick={() => onMapClick(sighting)}
    >
      {/* Image */}
      <div className="relative rounded-[18px] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={sighting.imageUrl}
          alt={sighting.speciesName}
          className="w-full h-auto object-cover"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
          {/* Top row: Save + Heart */}
          <div className="flex justify-between items-center">
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(e); }}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all ${liked ? "bg-red-500 text-white" : "bg-white/25 text-white hover:bg-red-500"}`}
            >
              <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSave(sighting.id); }}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${isSaved ? "bg-zinc-900 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
          {/* Bottom row: Map button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => { e.stopPropagation(); onMapClick(sighting); }}
              className="p-2 rounded-full bg-white/80 text-zinc-900 hover:bg-white transition-colors"
              title="View on Map"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info below image */}
      <div className="mt-2 pl-1">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] leading-snug">{sighting.speciesName}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 overflow-hidden flex-none">
              {(sighting.userName || "U")[0].toUpperCase()}
            </div>
            <span className="text-xs text-zinc-500 font-medium truncate max-w-[100px]">
              {sighting.userName || "Anonymous"}
            </span>
          </div>
          {likes > 0 && (
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Heart className="w-3 h-3 text-red-400" fill="currentColor" />
              {likes}
            </div>
          )}
        </div>
        {sighting.cityName && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-400">
            <MapPin className="w-3 h-3" /> {sighting.cityName}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [sightings, setSightings] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("All");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [sightingsRes, savedRes] = await Promise.all([
          api.get("/sightings"),
          user ? api.get(`/sightings/saved/${user.id}`) : { data: [] },
        ]);
        setSightings(sightingsRes.data);
        setSavedIds(new Set(savedRes.data.map((s) => s.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const uniqueCities = [...new Set(sightings.map((s) => s.cityName).filter(Boolean))];
  const filteredSightings = cityFilter === "All" ? sightings : sightings.filter((s) => s.cityName === cityFilter);

  const toggleSave = async (sightingId) => {
    if (!user) return alert("Please sign in to save sightings!");
    const newSaved = new Set(savedIds);
    if (newSaved.has(sightingId)) newSaved.delete(sightingId);
    else newSaved.add(sightingId);
    setSavedIds(newSaved);
    try {
      await api.post(`/sightings/${sightingId}/save`, { userId: user.id });
    } catch {
      setSavedIds(savedIds); // revert
    }
  };

  const goToMap = (s) => navigate("/map", { state: { focusPin: { lat: s.lat, lng: s.lng } } });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 h-full overflow-y-auto">

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
        {["All", ...uniqueCities].map((city) => (
          <motion.button
            key={city}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setCityFilter(city)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              cityFilter === city
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {city === "All" ? "All Locations" : city}
          </motion.button>
        ))}
      </div>

      {/* Masonry Grid */}
      {filteredSightings.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-zinc-500 text-lg">No sightings yet in this region. Be the first!</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
          {filteredSightings.map((s) => (
            <SightingCard
              key={s.id}
              sighting={s}
              isSaved={savedIds.has(s.id)}
              onSave={toggleSave}
              onMapClick={goToMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
