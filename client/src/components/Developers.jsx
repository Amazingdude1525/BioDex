import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function GithubIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.47 2 2 6.47 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.69c-2.78.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.53-4.47-10-10-10z" />
    </svg>
  );
}

function LinkedinIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function Developers() {
  const navigate = useNavigate();

  const team = [
    {
      name: "Prateek Das",
      role: "Full-Stack Engineer",
      image: "/prateek.jpg",
      github: "https://github.com/Amazingdude1525",
      linkedin: "https://www.linkedin.com/in/prateek-das-a45215252/",
      email: "mailto:prateekdas5255@gmail.com",
      description: "Driving the backend architecture, API integrations, and secure Cloudinary uploading pipeline. Passionate about efficient and scalable systems."
    },
    {
      name: "Shikha Kushwaha",
      role: "UI Designer & Frontend Engineer",
      image: "/shikha.jpg",
      github: "https://github.com/ShikhaKushwaha0005",
      linkedin: "https://www.linkedin.com/in/shikha-kushwaha-a71977391/",
      email: "mailto:shikhakushwaha0005@gmail.com",
      description: "Crafting the visual identity, interactive maps, and glassmorphic aesthetic. Focused on producing premium, intuitive user experiences."
    }
  ];

  return (
    <div className="w-full h-full p-4 md:p-12 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-5xl relative mb-16 pt-8">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-0 top-8 p-3 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-full hover:scale-105 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Meet the Creators</h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Team Debug Duo—the brilliant minds behind the BioDex engine. We set out to build a highly gamified, Pinterest-scale wildlife tracker.
          </p>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {team.map((dev) => (
          <div key={dev.name} className="glass rounded-[32px] p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 opacity-20 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Image */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl z-10 bg-emerald-100 dark:bg-emerald-900/30 mb-6">
              <img src={dev.image} alt={dev.name} className="w-full h-full object-cover scale-[1.02]" />
            </div>

            {/* Identity */}
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1 z-10">{dev.name}</h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-widest mb-4 z-10">{dev.role}</p>
            
            {/* Description */}
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 z-10 leading-relaxed text-sm md:text-base">
              {dev.description}
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mt-auto z-10">
              <a href={dev.github} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#24292e] text-white hover:-translate-y-1 hover:shadow-lg transition-all">
                <GithubIcon className="w-6 h-6" />
              </a>
              <a href={dev.linkedin} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0077b5] text-white hover:-translate-y-1 hover:shadow-lg transition-all">
                <LinkedinIcon className="w-6 h-6" />
              </a>
              <a href={dev.email} className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-500 text-white hover:-translate-y-1 hover:shadow-lg transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
