import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import { Loader2, Bird, Cat, Bug, HelpCircle, ChevronRight, Leaf } from "lucide-react";

const CATEGORIES = [
  { id: "Birds", label: "Birds", icon: Bird, color: "text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800" },
  { id: "Cats", label: "Wild Cats", icon: Cat, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800" },
  { id: "Insects", label: "Insects", icon: Bug, color: "text-lime-600 bg-lime-50 dark:bg-lime-950/40 border-lime-200 dark:border-lime-800" },
  { id: "None/Other", label: "All / Other", icon: HelpCircle, color: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700" },
];

export default function FirstLoginModal() {
  const { user, isLoaded } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 | 2 | 3

  // Step 1
  const [displayName, setDisplayName] = useState("");
  // Step 2
  const [category, setCategory] = useState("");
  const [favoriteSpecies, setFavoriteSpecies] = useState("");
  // Step 3
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkUser() {
      if (!isLoaded || !user) { setIsLoading(false); return; }
      try {
        await api.get(`/users/${user.id}`);
        setIsOpen(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setIsOpen(true);
          setDisplayName(user.fullName || user.firstName || "");
        }
      } finally {
        setIsLoading(false);
      }
    }
    checkUser();
  }, [user, isLoaded]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/users", {
        id: user.id,
        name: displayName.trim(),
        favoriteCategory: category || null,
        favoriteSpecies: favoriteSpecies.trim() || null,
        facebookUrl: facebookUrl.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
      });
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to create user", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isOpen) return null;

  const TOTAL_STEPS = 3;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[28px] overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50"
      >
        {/* Progress bar */}
        <div className="h-1 bg-zinc-100 dark:bg-zinc-800">
          <motion.div
            className="h-full bg-emerald-500"
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Step {step} of {TOTAL_STEPS}</span>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Name ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">Welcome to BioDex! 🦎</h2>
                <p className="text-zinc-500 text-sm mb-7">The wildlife photographer's field journal. What should we call you?</p>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Wildlife Explorer"
                  autoFocus
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-900 dark:text-zinc-100 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={!displayName.trim()}
                  onClick={() => setStep(2)}
                  className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}

            {/* ── Step 2: Category + Species ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">Your Wildlife Passion 🌿</h2>
                <p className="text-zinc-500 text-sm mb-6">Pick your favorite category and tell us your #1 species.</p>

                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Favorite Category</label>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        category === cat.id
                          ? `${cat.color} border-current scale-[1.02]`
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                      }`}
                    >
                      <cat.icon className="w-4 h-4" /> {cat.label}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Favorite Species</label>
                <input
                  type="text"
                  value={favoriteSpecies}
                  onChange={(e) => setFavoriteSpecies(e.target.value)}
                  placeholder="e.g. Bengal Tiger, Indian Peafowl..."
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-900 dark:text-zinc-100 text-sm"
                />

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Back</button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Social Links ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-100">Connect Your Socials ✨</h2>
                <p className="text-zinc-500 text-sm mb-6">Optional — add your social links so the community can follow you.</p>

                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Facebook Profile URL</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/yourprofile"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-900 dark:text-zinc-100 text-sm mb-4"
                />

                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-900 dark:text-zinc-100 text-sm"
                />

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Back</button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "🌿 Start Exploring"}
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
