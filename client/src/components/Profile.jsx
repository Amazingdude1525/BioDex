import { useState, useEffect, useMemo } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Camera, Bookmark, Loader2, MapPin, Navigation, LogOut, Heart, PawPrint, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

// ── Activity Heatmap ─────────────────────────────────────────
function ActivityHeatmap({ sightings }) {
  const weeks = 26; // Show last 26 weeks
  const days = 7;

  const counts = useMemo(() => {
    const map = {};
    sightings.forEach((s) => {
      const d = new Date(s.createdAt).toISOString().split("T")[0];
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [sightings]);

  // Build a grid going back 26 weeks from today
  const today = new Date();
  const grid = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < days; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (days - 1 - d)));
      const key = date.toISOString().split("T")[0];
      week.push({ date: key, count: counts[key] || 0 });
    }
    grid.push(week);
  }

  const getColor = (count) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-800";
    if (count === 1) return "bg-emerald-200 dark:bg-emerald-900";
    if (count === 2) return "bg-emerald-300 dark:bg-emerald-700";
    if (count >= 3) return "bg-emerald-500 dark:bg-emerald-500";
    return "bg-emerald-700";
  };

  return (
    <div className="glass rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Activity — Last 26 Weeks</h3>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span>Less</span>
          {["bg-zinc-100 dark:bg-zinc-800", "bg-emerald-200", "bg-emerald-300", "bg-emerald-500", "bg-emerald-700"].map((c, i) => (
            <span key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(({ date, count }) => (
              <div
                key={date}
                title={`${date}: ${count} sighting${count !== 1 ? "s" : ""}`}
                className={`w-3 h-3 rounded-sm cursor-default transition-colors ${getColor(count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-400 mt-3">
        {sightings.length} total sighting{sightings.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ── Sighting Card ─────────────────────────────────────────────
function SightingCard({ sighting, onMapClick, onLike, showLikes }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(sighting.likesCount || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    try {
      await api.patch(`/sightings/${sighting.id}/like`);
    } catch {}
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="break-inside-avoid relative group flex flex-col mb-5 cursor-zoom-in"
      onClick={() => onMapClick(sighting)}
    >
      <div className="relative rounded-2xl overflow-hidden">
        <img src={sighting.imageUrl} alt={sighting.speciesName} className="w-full h-auto object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
          <div className="flex justify-end gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${liked ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-red-500"}`}
            >
              <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMapClick(sighting); }}
              className="p-2 rounded-full bg-white/80 text-zinc-900 hover:bg-white transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-2 pl-1">
        <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{sighting.speciesName}</p>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="w-3 h-3" />{sighting.cityName || "—"}
          </div>
          {showLikes && (
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Heart className="w-3 h-3 text-red-400" fill="currentColor" /> {likes}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wild"); // wild | best | pets | saved
  const [data, setData] = useState({ sightings: [], saved: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [sightingsRes, savedRes] = await Promise.all([
          api.get(`/sightings/user/${user.id}`),
          api.get(`/sightings/saved/${user.id}`),
        ]);
        setData({ sightings: sightingsRes.data, saved: savedRes.data });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (!user) return null;

  const wildSightings = data.sightings.filter((s) => !s.isPet);
  const petSightings = data.sightings.filter((s) => s.isPet);
  const bestPosts = [...wildSightings].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));

  const currentData = {
    wild: wildSightings,
    best: bestPosts,
    pets: petSightings,
    saved: data.saved,
  }[activeTab];

  const goToMap = (s) => navigate("/map", { state: { focusPin: { lat: s.lat, lng: s.lng } } });

  const TABS = [
    { id: "wild", label: "Discoveries", icon: Camera, count: wildSightings.length },
    { id: "best", label: "Best Posts", icon: Trophy, count: bestPosts.length },
    { id: "pets", label: "Pets", icon: PawPrint, count: petSightings.length },
    { id: "saved", label: "Saved", icon: Bookmark, count: data.saved.length },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 h-full overflow-y-auto">

      {/* ── Profile Header ─────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 glass p-8 rounded-3xl relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl flex-shrink-0 ring-2 ring-emerald-400/30">
          <img src={user.imageUrl} alt={user.fullName} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{user.fullName || user.firstName}</h1>
          <p className="text-zinc-500 text-sm mt-1">BioDex Member since {new Date(user.createdAt).getFullYear()}</p>
          <div className="flex items-center justify-center md:justify-start gap-8 mt-4">
            {[
              { val: wildSightings.length, label: "Discoveries" },
              { val: petSightings.length, label: "Pets" },
              { val: data.saved.length, label: "Saved" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center md:text-left">
                <p className="font-bold text-xl text-emerald-600 dark:text-emerald-400">{val}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-6 right-6">
          <SignOutButton>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors rounded-xl text-sm font-medium">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* ── Activity Heatmap ───────────────────────── */}
      {!isLoading && <ActivityHeatmap sightings={data.sightings} />}

      {/* ── Tabs ───────────────────────────────────── */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-6 overflow-x-auto pb-0">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 pb-4 px-4 text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
              activeTab === id
                ? "border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === id ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Grid ───────────────────────────────────── */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : currentData.length === 0 ? (
        <div className="py-20 text-center glass rounded-3xl">
          <p className="text-zinc-500 text-lg">
            {activeTab === "wild" && "No wild sightings yet. Head to the Map!"}
            {activeTab === "best" && "No sightings with likes yet."}
            {activeTab === "pets" && "No pet photos yet. Log a sighting with 'Pet' toggle on!"}
            {activeTab === "saved" && "You haven't saved any posts yet."}
          </p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 gap-4 space-y-0">
          {currentData.map((s) => (
            <SightingCard
              key={s.id}
              sighting={s}
              onMapClick={goToMap}
              showLikes={activeTab === "best"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
