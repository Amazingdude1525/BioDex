import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Leaf, Home, Compass, Plus, Bell, Settings, Search, Users, TreePine, User } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, SignIn, SignUp, useUser } from "@clerk/clerk-react";
import FirstLoginModal from "./components/FirstLoginModal";
import SubmissionModal from "./components/SubmissionModal";
import MapDashboard from "./components/MapDashboard";
import Gallery from "./components/Gallery";
import Profile from "./components/Profile";
import Developers from "./components/Developers";
import BioDexAgent from "./components/BioDexAgent";
import BiodiversityParks from "./components/BiodiversityParks";
import CreatePage from "./components/CreatePage";

// Animated sidebar button
function NavBtn({ href, title, children, onClick, active }) {
  const Tag = href ? "a" : "button";
  return (
    <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.94 }} transition={{ duration: 0.15 }}>
      <Tag
        href={href}
        onClick={onClick}
        title={title}
        className={`p-3 rounded-full transition-colors flex items-center justify-center ${
          active
            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
            : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

const NOTIFICATIONS = [
  { id: 1, text: "A new Bengal Tiger sighting was logged near Bandhavgarh!", time: "2m ago", unread: true },
  { id: 2, text: "Your sighting of 'Red-whiskered Bulbul' has been saved.", time: "1h ago", unread: true },
  { id: 3, text: "Welcome to BioDex! Start by logging your first wildlife sighting.", time: "Today", unread: false },
];

function App() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  // Side drawer panel: null | 'settings' | 'parks'
  const [panel, setPanel] = useState(null);
  // Top-right notification dropdown
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const togglePanel = (name) => setPanel((p) => (p === name ? null : name));

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="h-screen w-full flex bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden bg-grid">

      {/* ── Left Sidebar ─────────────────────────────── */}
      <aside className="w-16 md:w-20 flex-none flex flex-col items-center py-6 glass border-r z-50">
        <motion.a href="/" whileHover={{ scale: 1.1, rotate: 6 }} transition={{ duration: 0.2 }} className="mb-8">
          <Leaf className="w-8 h-8 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </motion.a>

        {/* Top nav group */}
        <div className="flex flex-col gap-2 w-full items-center">
          <NavBtn href="/" title="Home · Gallery"><Home className="w-5 h-5" /></NavBtn>
          <NavBtn href="/map" title="Explore Map"><Compass className="w-5 h-5" /></NavBtn>
          <NavBtn title="Biodiversity Parks" active={panel === "parks"} onClick={() => togglePanel("parks")}>
            <TreePine className="w-5 h-5" />
          </NavBtn>
          <NavBtn title="Log a Sighting" onClick={() => navigate("/create")}>
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500 text-white glow-emerald">
              <Plus className="w-5 h-5" />
            </div>
          </NavBtn>
        </div>

        <div className="flex-1" />

        {/* Bottom nav group */}
        <div className="flex flex-col gap-2 w-full items-center">
          <NavBtn href="/developers" title="Meet the Creators"><Users className="w-5 h-5" /></NavBtn>

          {/* Profile icon — click → /profile, hover shows Clerk popover */}
          <div className="relative group">
            <NavBtn href="/profile" title="My Profile">
              <SignedIn>
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile" className="w-7 h-7 rounded-full ring-1 ring-emerald-400/40 object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </SignedIn>
              <SignedOut>
                <User className="w-5 h-5" />
              </SignedOut>
            </NavBtn>
            {/* Clerk popover on hover (absolute positioned right of sidebar) */}
            <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-[200]">
              <SignedIn>
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2">
                  <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-full" } }} />
                </div>
              </SignedIn>
            </div>
          </div>

          <NavBtn title="Settings" active={panel === "settings"} onClick={() => togglePanel("settings")}>
            <motion.div animate={{ rotate: panel === "settings" ? 90 : 0 }} transition={{ duration: 0.25 }}>
              <Settings className="w-5 h-5 text-zinc-500" />
            </motion.div>
          </NavBtn>
        </div>
      </aside>

      {/* ── Secondary Panel (Parks / Settings) ── */}
      <motion.div
        initial={false}
        animate={{ width: panel ? 300 : 0, opacity: panel ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex-none overflow-hidden glass border-r z-40 hidden md:flex flex-col"
      >
        <div className="w-[300px] h-full flex flex-col overflow-hidden">

          {/* Parks Panel */}
          {panel === "parks" && (
            <BiodiversityParks onClose={() => setPanel(null)} />
          )}

          {/* Settings Panel */}
          {panel === "settings" && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">Settings & Support</h2>
                <button onClick={() => setPanel(null)} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.12em] mb-3 ml-2">Settings</p>
                  <button onClick={() => setDark(!dark)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors text-zinc-900 dark:text-zinc-100 font-medium text-sm text-left">
                    <span>Appearance Theme</span>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                      {dark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    </div>
                  </button>
                  <button className="w-full px-3 py-2.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors text-zinc-900 dark:text-zinc-100 font-medium text-sm text-left">Account management</button>
                  <button className="w-full px-3 py-2.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors text-zinc-900 dark:text-zinc-100 font-medium text-sm text-left">Notification preferences</button>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.12em] mb-3 ml-2">Support</p>
                  {[
                    { label: "Help center", href: "/tos.html#contact-section" },
                    { label: "Privacy policy", href: "/tos.html#privacy-section" },
                    { label: "Terms of service", href: "/tos.html" },
                  ].map(({ label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer"
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors text-zinc-900 dark:text-zinc-100 font-medium text-sm flex items-center">
                      {label}
                      <svg className="w-3 h-3 ml-auto text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </motion.div>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-white dark:bg-zinc-950 rounded-tl-3xl border-t border-l border-zinc-200/50 dark:border-zinc-800/50 shadow-[-8px_0_24px_rgba(0,0,0,0.06)]">

        {/* Top Header */}
        <header className="h-16 w-full flex items-center px-6 gap-4 shrink-0 glass border-b sticky top-0 z-40">
          <div className="flex-1 max-w-3xl relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search wildlife, locations, species..."
              className="w-full bg-zinc-100/70 dark:bg-zinc-900/70 text-zinc-900 dark:text-zinc-100 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-zinc-200/50 dark:border-zinc-800/50 placeholder-zinc-400 font-medium transition-all"
            />
          </div>

          {/* Right side: Bell + Sign in */}
          <div className="flex items-center gap-2 ml-auto relative" ref={notifRef}>
            <SignedIn>
              {/* SINGLE Bell icon — top right */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifs((v) => !v)}
                className={`relative p-2.5 rounded-full transition-colors ${showNotifs ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {NOTIFICATIONS.some((n) => n.unread) && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white dark:ring-zinc-950" />
                )}
              </motion.button>

              {/* Notification dropdown — top right */}
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-14 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-[200]"
                  >
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notifications</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                      {NOTIFICATIONS.map((n) => (
                        <div key={n.id} className={`p-4 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${n.unread ? "" : "opacity-60"}`}>
                          <div className={`w-2 h-2 rounded-full mt-2 flex-none ${n.unread ? "bg-emerald-500" : "bg-transparent"}`} />
                          <div>
                            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-snug">{n.text}</p>
                            <p className="text-[11px] text-zinc-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <motion.button whileHover={{ scale: 1.04 }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full transition-colors glow-emerald">
                  Sign in
                </motion.button>
              </SignInButton>
            </SignedOut>
          </div>
        </header>

        <main className="flex-1 w-full h-full relative overflow-y-auto">
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/map" element={<MapDashboard isDark={dark} openUpload={() => setIsUploadOpen(true)} />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/profile" element={<SignedIn><Profile /></SignedIn>} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/sign-in/*" element={<div className="flex items-center justify-center h-full"><SignIn routing="path" path="/sign-in" /></div>} />
            <Route path="/sign-up/*" element={<div className="flex items-center justify-center h-full"><SignUp routing="path" path="/sign-up" /></div>} />
          </Routes>
        </main>
      </div>

      <SubmissionModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <BioDexAgent />
      <SignedIn><FirstLoginModal /></SignedIn>
    </div>
  );
}

export default App;
