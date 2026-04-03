import { pgTable, text, timestamp, doublePrecision, primaryKey, boolean, integer } from "drizzle-orm/pg-core";

// ── Users ──────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),                    // Clerk user ID
  name: text("name").notNull(),
  // Onboarding preferences
  favoriteCategory: text("favorite_category"),    // Birds | Cats | Insects | None/Other
  favoriteSpecies: text("favorite_species"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// ── Sightings ──────────────────────────────────────
export const sightings = pgTable("sightings", {
  id: text("id").primaryKey(),                    // Unique ID from client or random
  userId: text("user_id").notNull().references(() => users.id),
  speciesName: text("species_name").notNull(),
  imageUrl: text("image_url").notNull(),
  imageHash: text("image_hash").notNull().unique(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  cityName: text("city_name"),
  likesCount: integer("likes_count").default(0).notNull(),
  isPet: boolean("is_pet").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Saved Posts (many-to-many) ─────────────────────
export const savedPosts = pgTable("saved_posts", {
  userId: text("user_id").notNull().references(() => users.id),
  sightingId: text("sighting_id").notNull().references(() => sightings.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.sightingId] }),
}));
