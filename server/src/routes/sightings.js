import { Router } from "express";
import db from "../db/index.js";
import { sightings, savedPosts, users } from "../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

// GET /api/sightings — All wild sightings (isPet=false) with user name
router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select({
        id: sightings.id,
        userId: sightings.userId,
        userName: users.name,
        speciesName: sightings.speciesName,
        imageUrl: sightings.imageUrl,
        lat: sightings.lat,
        lng: sightings.lng,
        cityName: sightings.cityName,
        likesCount: sightings.likesCount,
        isPet: sightings.isPet,
        createdAt: sightings.createdAt,
      })
      .from(sightings)
      .leftJoin(users, eq(sightings.userId, users.id))
      .where(eq(sightings.isPet, false))
      .orderBy(desc(sightings.createdAt));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sightings/user/:userId — All sightings by user (wild & pets)
router.get("/user/:userId", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(sightings)
      .where(eq(sightings.userId, req.params.userId))
      .orderBy(desc(sightings.createdAt));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sightings — Create a new sighting
router.post("/", async (req, res) => {
  try {
    const { userId, speciesName, imageUrl, imageHash, lat, lng, cityName, isPet, userName } = req.body;

    // Ensure user exists in local DB (Upsert)
    if (userId) {
      const [existing] = await db.select().from(users).where(eq(users.id, userId));
      if (!existing) {
        await db.insert(users).values({
          id: userId,
          name: userName || "User",
          onboardingComplete: false,
        });
      }
    }

    const [sighting] = await db
      .insert(sightings)
      .values({ 
        id: `sighting_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId, 
        speciesName, 
        imageUrl, 
        imageHash, 
        lat, 
        lng, 
        cityName, 
        isPet: isPet ?? false 
      })
      .returning();

    res.status(201).json(sighting);
  } catch (err) {
    if (err.message?.includes("unique")) {
      return res.status(409).json({ error: "Duplicate image detected" });
    }
    res.status(500).json({ error: err.message });
    console.error("❌ BioDex Save Sighting Error:", err);
  }
});

// POST /api/sightings/check-hash
router.post("/check-hash", async (req, res) => {
  try {
    const { imageHash } = req.body;
    const [existing] = await db.select().from(sightings).where(eq(sightings.imageHash, imageHash));
    res.json({ exists: !!existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sightings/:id/like — Increment like count
router.patch("/:id/like", async (req, res) => {
  try {
    const [updated] = await db
      .update(sightings)
      .set({ likesCount: sql`${sightings.likesCount} + 1` })
      .where(eq(sightings.id, req.params.id))
      .returning({ likesCount: sightings.likesCount });

    if (!updated) return res.status(404).json({ error: "Sighting not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sightings/:id/save — Save/unsave a post
router.post("/:id/save", async (req, res) => {
  try {
    const { userId } = req.body;
    const sightingId = req.params.id;

    const [existing] = await db
      .select()
      .from(savedPosts)
      .where(eq(savedPosts.userId, userId))
      .where(eq(savedPosts.sightingId, sightingId));

    if (existing) {
      await db.delete(savedPosts)
        .where(eq(savedPosts.userId, userId))
        .where(eq(savedPosts.sightingId, sightingId));
      return res.json({ saved: false });
    }

    await db.insert(savedPosts).values({ userId, sightingId });
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sightings/saved/:userId — Saved posts for a user
router.get("/saved/:userId", async (req, res) => {
  try {
    const result = await db
      .select({
        id: sightings.id,
        userId: sightings.userId,
        userName: users.name,
        speciesName: sightings.speciesName,
        imageUrl: sightings.imageUrl,
        lat: sightings.lat,
        lng: sightings.lng,
        cityName: sightings.cityName,
        likesCount: sightings.likesCount,
        isPet: sightings.isPet,
        createdAt: sightings.createdAt,
      })
      .from(savedPosts)
      .innerJoin(sightings, eq(savedPosts.sightingId, sightings.id))
      .leftJoin(users, eq(sightings.userId, users.id))
      .where(eq(savedPosts.userId, req.params.userId))
      .orderBy(desc(sightings.createdAt));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
