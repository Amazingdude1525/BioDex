import { Router } from "express";
import db from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/users/:id — Get user by Clerk ID
router.get("/:id", async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — Create user with full onboarding data
router.post("/", async (req, res) => {
  try {
    const { id, name, favoriteCategory, favoriteSpecies, facebookUrl, linkedinUrl } = req.body;
    const [user] = await db.insert(users).values({
      id,
      name,
      favoriteCategory: favoriteCategory || null,
      favoriteSpecies: favoriteSpecies || null,
      facebookUrl: facebookUrl || null,
      linkedinUrl: linkedinUrl || null,
      onboardingComplete: true,
    }).returning();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
