import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import confetti from "canvas-confetti";
import { 
  X, UploadCloud, MapPin, Loader2, CheckCircle2, AlertCircle, PawPrint
} from "lucide-react";
import api from "../lib/api";

const generateHash = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

export default function SubmissionModal({ isOpen, onClose }) {
  const { user } = useUser();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0); 
  // 0: Select, 1: Processing, 2: Details, 3: Uploading, 4: Success
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageHash, setImageHash] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null, city: "" });
  const [speciesName, setSpeciesName] = useState("");
  const [isPet, setIsPet] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [processStatus, setProcessStatus] = useState(""); // UI feedback during step 1

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(0);
        setFile(null);
        setPreview(null);
        setImageHash("");
        setLocation({ lat: null, lng: null, city: "" });
        setSpeciesName("");
        setIsPet(false);
        setErrorMsg("");
      }, 300);
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#fcd34d']
    });
  };

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrorMsg("");
    setStep(1); // Move to processing

    try {
      // 1. Generate SHA-256
      setProcessStatus("Hashing image to verify uniqueness...");
      const hash = await generateHash(selected);
      setImageHash(hash);

      // 2. Check Database for duplicate
      setProcessStatus("Checking database for duplicates...");
      const { data: dbCheck } = await api.post("/sightings/check-hash", { imageHash: hash });
      if (dbCheck.exists) {
        throw new Error("This exact image has already been submitted to BioDex!");
      }

      // 3. Get Geolocation
      setProcessStatus("Requesting high-accuracy GPS location...");
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true,
          timeout: 10000 
        });
      });
      const { latitude, longitude } = pos.coords;

      // 4. Reverse Geocode (Nominatim)
      setProcessStatus("identifying city...");
      let city = "Unknown Location";
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const geoData = await geoRes.json();
        city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.state || "Unknown Location";
      } catch (geocodingError) {
        console.error("Reverse geocoding failed", geocodingError);
      }

      setLocation({ lat: latitude, lng: longitude, city });
      setStep(2); // Ready for details!

    } catch (err) {
      if (err.code === 1) {
        setErrorMsg("Location access denied. BioDex requires GPS to log sightings.");
      } else {
        setErrorMsg(err.message || "An error occurred during processing.");
      }
      setStep(0); // Kick back to start if fatal processing error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!speciesName.trim()) {
      setErrorMsg("Please identify the species.");
      return;
    }

    setStep(3); // Uploading
    setErrorMsg("");

    try {
      // 1. Upload to Cloudinary via Backend
      const formData = new FormData();
      formData.append("image", file);
      
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const { url: imageUrl } = uploadRes.data;

      // 2. Save Sighting in Database
      await api.post("/sightings", {
        userId: user.id,
        speciesName: speciesName.trim(),
        imageUrl,
        imageHash,
        lat: location.lat,
        lng: location.lng,
        cityName: location.city,
        isPet,
      });

      setStep(4);
      triggerConfetti();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || "Failed to submit sighting.");
      setStep(2); // Kick back to details
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
        onClick={() => step !== 1 && step !== 3 && onClose()} // Prevent closing during processing/uploading
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl flex flex-col pt-12 pb-8 px-10"
      >
        {/* Close Button */}
        {step !== 1 && step !== 3 && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 0: SELECT FILE */}
          {step === 0 && (
            <motion.div 
              key="step-0"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">Log a Sighting</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Must be an original photo. We use GPS to verify location.
                </p>
              </div>

              {errorMsg && (
                <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex gap-3 text-left">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">Tap to select photo</p>
              </div>
            </motion.div>
          )}

          {/* STEP 1: PROCESSING (HASH + GEO) */}
          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-6 py-8"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Analyzing Sighting</h3>
                <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">{processStatus}</p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex flex-col w-full space-y-6"
            >
              <h2 className="text-2xl font-bold text-center">Confirm Details</h2>

              {errorMsg && (
                <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}

              <div className="flex gap-4">
                <div className="w-1/3 aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative shadow-sm">
                  <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                </div>
                
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                      <MapPin className="w-3.5 h-3.5" />Location
                    </div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{location.city}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />Uniqueness
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Original Photo Verified</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPet((p) => !p)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm ${
                  isPet
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <PawPrint className="w-5 h-5" />
                <span className="flex-1 text-left">This is a pet (domestic animal)</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isPet ? "border-amber-400 bg-amber-400" : "border-zinc-300"}`}>
                  {isPet && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">What species is this?</label>
                  <input
                    type="text"
                    value={speciesName}
                    onChange={(e) => setSpeciesName(e.target.value)}
                    placeholder="e.g. Red Fox"
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow font-medium"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={!speciesName.trim()}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_8px_30px_rgb(16,185,129,0.3)]"
                >
                  Submit Sighting
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: UPLOADING */}
          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-6 py-8"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Uploading Securely</h3>
                <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">Syncing to BioDex Network...</p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div 
              key="step-4"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-6 py-6"
            >
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2 text-emerald-600 dark:text-emerald-400">Sighting Logged!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-[200px] mx-auto">
                  Your discovery has been added to the map.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-4 mt-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Return to Map
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
