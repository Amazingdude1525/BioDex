import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TreePine, ChevronDown, ChevronRight, Info, X } from "lucide-react";

const PARKS = [
  {
    id: "keoladeo",
    name: "Keoladeo National Park",
    location: "Bharatpur, Rajasthan",
    description:
      "A UNESCO World Heritage Site and one of the world's most important bird breeding and feeding grounds. Over 370 species of birds have been recorded here.",
    species: [
      {
        name: "Painted Stork",
        image: "/parks/painted-stork.jpg.jpg",
        fact: "The Painted Stork (Mycteria leucocephala) breeds in colonies in Keoladeo, nesting in tall trees over water. A single colony can have thousands of nesting pairs.",
      },
      {
        name: "Siberian Crane",
        image: "/parks/siberian-crane.jpg.jpg",
        fact: "The Siberian Crane is a critically endangered migratory bird. Keoladeo was once their wintering ground — they haven't been sighted here since 2002, making conservation efforts vital.",
      },
      {
        name: "Sambar Deer",
        image: "/parks/sambar-deer.jpg.jpg",
        fact: "The Sambar (Rusa unicolor) is India's largest deer, weighing up to 300 kg. Its loud alarm bark, called a 'belling cry', warns other animals of approaching predators.",
      },
    ],
  },
  {
    id: "sanjay-gandhi",
    name: "Sanjay Gandhi National Park",
    location: "Mumbai, Maharashtra",
    description:
      "One of the most visited national parks in the world, situated inside one of the world's largest cities. Home to over 1000 plant species, 251 bird species, and 40 mammals.",
    species: [
      {
        name: "Leopard",
        image: "/parks/leopard.jpg.jpg",
        fact: "SGNP hosts ~47 leopards that coexist remarkably close to 20 million people. They primarily prey on dogs and livestock, occasionally venturing into residential areas at night.",
      },
      {
        name: "Rhesus Macaque",
        image: "/parks/macaque.jpg.jpg",
        fact: "The Rhesus Macaque (Macaca mulatta) is highly adaptable and intelligent. They have been sent to space and are crucial to biomedical research. In SGNP they live in large social troops.",
      },
      {
        name: "Flying Fox",
        image: "/parks/flying-fox.jpg.jpg",
        fact: "The Indian Flying Fox (Pteropus giganteus), with a wingspan up to 1.5 meters, is the world's largest bat. They are critical pollinators and seed dispersers in Indian forests.",
      },
    ],
  },
  {
    id: "kaziranga",
    name: "Kaziranga National Park",
    location: "Assam, Northeast India",
    description:
      "A UNESCO World Heritage Site protecting two-thirds of the world's Great One-Horned Rhinoceroses. Also home to the world's highest density of tigers.",
    species: [
      {
        name: "One-Horned Rhino",
        image: "/parks/rhino.jpg.jpg",
        fact: "Kaziranga hosts over 2,600 Indian One-Horned Rhinos (Rhinoceros unicornis), a massive conservation success story. Their horn is solid keratin — the same material as human fingernails.",
      },
      {
        name: "Asian Elephant",
        image: "/parks/elephant.jpg.jpg",
        fact: "Asian Elephants in Kaziranga have learned to swim across the Brahmaputra river during floods. They are keystone species — their paths through dense forest create pathways used by other wildlife.",
      },
      {
        name: "Bengal Tiger",
        image: "/parks/tiger.jpg.jpg",
        fact: "Kaziranga has the world's highest density of Bengal Tigers — around 120 tigers in 430 sq km. Unlike most cats, Tigers are powerful swimmers and actively seek water to cool down.",
      },
    ],
  },
  {
    id: "jim-corbett",
    name: "Jim Corbett National Park",
    location: "Uttarakhand, North India",
    description:
      "India's oldest national park, established in 1936. The birthplace of Project Tiger — the world's most successful large predator conservation program.",
    species: [
      {
        name: "Bengal Tiger",
        image: "/parks/tiger.jpg.jpg",
        fact: "Corbett hosts over 260 tigers. The park's diverse terrain — grasslands, forests, and the Ramganga River — provides tigers with the perfect mix of hunting grounds and water access.",
      },
      {
        name: "Gharial",
        image: "/parks/gharial.jpg.jpg",
        fact: "The Gharial (Gavialis gangeticus) is one of the world's most critically endangered crocodilians. Its distinctive long, narrow snout has 110 razor-sharp teeth — perfect for catching slippery fish.",
      },
      {
        name: "Great Hornbill",
        image: "/parks/hornbill.jpg.jpg",
        fact: "The Great Hornbill (Buceros bicornis) is known for its massive yellow casque on top of its bill. Male hornbills seal the female inside a tree cavity during nesting — feeding her through a small slit.",
      },
    ],
  },
];

export default function BiodiversityParks({ onClose }) {
  const [openPark, setOpenPark] = useState(null);
  const [activeFact, setActiveFact] = useState(null);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <TreePine className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">Biodiversity Parks</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Fun Fact Box */}
      <AnimatePresence>
        {activeFact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl shrink-0"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">{activeFact}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parks List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {PARKS.map((park) => (
          <div key={park.id}>
            <button
              onClick={() => {
                setOpenPark(openPark === park.id ? null : park.id);
                setActiveFact(null);
              }}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{park.name}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{park.location}</p>
              </div>
              <motion.div animate={{ rotate: openPark === park.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openPark === park.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">{park.description}</p>

                    {/* Species Grid */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Species found here</p>
                    <div className="grid grid-cols-3 gap-2">
                      {park.species.map((species) => (
                        <motion.button
                          key={species.name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setActiveFact(activeFact === species.fact ? null : species.fact)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                            activeFact === species.fact
                              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-700"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-zinc-900"
                          }`}
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                            <img
                              src={species.image}
                              alt={species.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to a leaf emoji placeholder if image is missing
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = `<span class="w-full h-full flex items-center justify-center text-2xl">🌿</span>`;
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 text-center leading-tight">
                            {species.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
