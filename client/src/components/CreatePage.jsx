import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, SignInButton } from "@clerk/clerk-react";
import confetti from "canvas-confetti";
import {
  UploadCloud, MapPin, Loader2, CheckCircle2, AlertCircle, PawPrint, X, Image as ImageIcon,
} from "lucide-react";
import api from "../lib/api";

const generateHash = async (file) => {
  // Ultra-safe fallback for all browser environments
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  const size = file?.size || 0;
  return `sight-${timestamp}-${size}-${random}`;
};

export default function CreatePage() {
  const { user, isSignedIn } = useUser();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageHash, setImageHash] = useState("");
  const [isDupeChecking, setIsDupeChecking] = useState(false);

  const [speciesName, setSpeciesName] = useState("");
  const [description, setDescription] = useState("");
  const [isPet, setIsPet] = useState(false);

  const [location, setLocation] = useState({ lat: null, lng: null, city: "" });
  const [isLocating, setIsLocating] = useState(false);

  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (selected) => {
    if (!selected?.type.startsWith("image/")) { setErrorMsg("Please select a valid image file."); return; }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrorMsg("");
    setIsDupeChecking(true);
    try {
      const hash = await generateHash(selected);
      setImageHash(hash);
      const { data } = await api.post("/sightings/check-hash", { imageHash: hash });
      if (data.exists) throw new Error("This exact photo has already been submitted to BioDex!");
    } catch (err) {
      setErrorMsg(err.message);
      setFile(null); setPreview(null);
    } finally {
      setIsDupeChecking(false);
    }
  };

  const handleFileSelect = (e) => processFile(e.target.files?.[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files?.[0]); };

  const captureLocation = async () => {
    if (!window.isSecureContext) {
      setErrorMsg("GPS requires a secure (HTTPS) connection. Please check your URL.");
      return;
    }
    setIsLocating(true);
    setErrorMsg("");
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 12000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      let city = "Unknown Location";
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const d = await r.json();
        city = d.address?.city || d.address?.town || d.address?.village || d.address?.state || "Unknown Location";
      } catch {}
      setLocation({ lat, lng, city });
    } catch (err) {
      setErrorMsg(err.code === 1 ? "Location access denied. Please allow location." : "Could not get GPS. Try again.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setErrorMsg("Please select an image first."); return; }
    if (!location.lat) { setErrorMsg("Please capture your GPS location first."); return; }
    if (!speciesName.trim()) { setErrorMsg("Please enter the species name."); return; }

    setStatus("submitting");
    setErrorMsg("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data: uploadData } = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

      await api.post("/sightings", {
        userId: user.id,
        userName: user.fullName || user.firstName || "User",
        speciesName: speciesName.trim(),
        imageUrl: uploadData.url,
        imageHash,
        lat: location.lat,
        lng: location.lng,
        cityName: location.city,
        isPet,
      });

      setStatus("success");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#10b981", "#34d399", "#fcd34d"] });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || "Submission failed.");
      setStatus("idle");
    }
  };

  const reset = () => {
    setFile(null); setPreview(null); setImageHash(""); setSpeciesName("");
    setDescription(""); setLocation({ lat: null, lng: null, city: "" }); setIsPet(false);
    setStatus("idle"); setErrorMsg("");
  };

  if (!isSignedIn) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <ImageIcon className="w-12 h-12 text-zinc-300" />
        <p className="text-zinc-500 font-medium">Sign in to log a wildlife sighting</p>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-colors">Sign In</button>
        </SignInButton>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Sighting Logged! 🦎</h2>
          <p className="text-zinc-500 mt-1">Your discovery has been added to the community gallery and map.</p>
        </div>
        <button onClick={reset} className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-full hover:opacity-90 transition-opacity">
          Log Another Sighting
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 tracking-tight">Log a Sighting</h1>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">

        {/* ── LEFT: Image Dropzone ─────────────────────── */}
        <div className="w-full md:w-2/5 flex-none">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative w-full aspect-[3/4] rounded-3xl overflow-hidden flex flex-col items-center justify-center cursor-pointer border-2 transition-all ${
              dragOver ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" :
              preview ? "border-transparent" : "border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            }`}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-semibold">Change photo</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full text-zinc-800 hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center p-6">
                {isDupeChecking ? (
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                ) : (
                  <UploadCloud className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                )}
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {isDupeChecking ? "Checking for duplicates..." : "Choose file or drag & drop"}
                </p>
                <p className="text-xs text-zinc-400">JPG, PNG, WEBP supported</p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
        </div>

        {/* ── RIGHT: Fields ────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Error */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl">
                <AlertCircle className="w-5 h-5 flex-none" />
                <p className="text-sm">{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Species */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Species Name (or best guess)</label>
            <input
              type="text"
              value={speciesName}
              onChange={(e) => setSpeciesName(e.target.value)}
              placeholder="e.g. Indian Peafowl, Bengal Tiger..."
              className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the behaviour, habitat, or anything interesting..."
              className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all resize-none"
            />
          </div>

          {/* Pet toggle */}
          <button
            type="button"
            onClick={() => setIsPet((p) => !p)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-sm font-semibold ${
              isPet ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300"
            }`}
          >
            <PawPrint className="w-5 h-5" />
            <span className="flex-1 text-left">This is a pet (domestic animal)</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isPet ? "border-amber-400 bg-amber-400" : "border-zinc-300"}`}>
              {isPet && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>

          {/* Capture Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Location</label>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={captureLocation}
              disabled={isLocating}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all font-semibold text-sm ${
                location.lat
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                  : "border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-400"
              }`}
            >
              {isLocating ? <Loader2 className="w-5 h-5 animate-spin flex-none" /> : <MapPin className="w-5 h-5 flex-none" />}
              <span className="flex-1 text-left">
                {isLocating ? "Getting GPS..." : location.lat
                  ? `${location.city} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
                  : "Capture Current GPS Location"}
              </span>
              {location.lat && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-none" />}
            </motion.button>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: status === "submitting" ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={status === "submitting" || !file || !location.lat || !speciesName.trim()}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-2 shadow-[0_8px_30px_rgba(16,185,129,0.25)] text-base"
          >
            {status === "submitting" ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting to BioDex...</>
            ) : (
              "🌿 Submit Sighting"
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
