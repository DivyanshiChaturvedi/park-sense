import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { parkingLotsTable, parkingSlotsTable, reviewsTable, bookingsTable } from "@workspace/db/schema";
import { eq, and, ilike, or, sql, isNull } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth-middleware";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const { search, city, available } = req.query as Record<string, string>;

  const conditions: any[] = [];

  if (search) {
    conditions.push(or(ilike(parkingLotsTable.name, `%${search}%`), ilike(parkingLotsTable.address, `%${search}%`)));
  }
  if (city) {
    conditions.push(ilike(parkingLotsTable.city, `%${city}%`));
  }

  const lots = await db.select().from(parkingLotsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(parkingLotsTable.createdAt);

  const lotsWithStats = await Promise.all(lots.map(async (lot) => {
    const slots = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lot.id));
    const availableSlots = slots.filter(s => s.isAvailable).length;

    const reviewStats = await db.select({
      avg: sql<number>`AVG(${reviewsTable.rating})`,
      count: sql<number>`COUNT(*)`,
    }).from(reviewsTable).where(eq(reviewsTable.lotId, lot.id));

    return {
      ...lot,
      availableSlots,
      rating: reviewStats[0]?.avg ? parseFloat(parseFloat(reviewStats[0].avg.toString()).toFixed(1)) : null,
      reviewCount: parseInt(reviewStats[0]?.count?.toString() || "0"),
    };
  }));

  const filtered = available === "true" ? lotsWithStats.filter(l => l.availableSlots > 0) : lotsWithStats;

  res.json({ lots: filtered, total: filtered.length });
});

router.get("/:lotId", async (req, res) => {
  const lotId = parseInt(req.params.lotId);
  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, lotId)).limit(1);

  if (!lot) {
    res.status(404).json({ error: "not_found", message: "Parking lot not found" });
    return;
  }

  const slots = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lotId));
  const reviewStats = await db.select({
    avg: sql<number>`AVG(${reviewsTable.rating})`,
    count: sql<number>`COUNT(*)`,
  }).from(reviewsTable).where(eq(reviewsTable.lotId, lotId));

  res.json({
    ...lot,
    availableSlots: slots.filter(s => s.isAvailable).length,
    rating: reviewStats[0]?.avg ? parseFloat(parseFloat(reviewStats[0].avg.toString()).toFixed(1)) : null,
    reviewCount: parseInt(reviewStats[0]?.count?.toString() || "0"),
    slots: slots.map(s => ({
      id: s.id,
      lotId: s.lotId,
      slotNumber: s.slotNumber,
      slotType: s.slotType,
      floor: s.floor,
      isAvailable: s.isAvailable,
      pricePerHour: s.pricePerHour,
    })),
  });
});

router.post("/", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { name, address, city, latitude, longitude, totalSlots, pricePerHour, openTime, closeTime, amenities } = req.body;

  if (!name || !address || !city || !totalSlots || !pricePerHour) {
    res.status(400).json({ error: "bad_request", message: "Missing required fields" });
    return;
  }

  const [lot] = await db.insert(parkingLotsTable).values({
    name,
    address,
    city,
    latitude,
    longitude,
    totalSlots,
    pricePerHour,
    openTime,
    closeTime,
    amenities: amenities || [],
  }).returning();

  const slotPromises = [];
  const rows = Math.ceil(totalSlots / 10);
  for (let i = 0; i < totalSlots; i++) {
    const row = String.fromCharCode(65 + Math.floor(i / 10));
    const num = (i % 10) + 1;
    slotPromises.push({
      lotId: lot.id,
      slotNumber: `${row}${num}`,
      slotType: "standard" as const,
      floor: 1,
      pricePerHour,
    });
  }

  if (slotPromises.length > 0) {
    await db.insert(parkingSlotsTable).values(slotPromises);
  }

  res.status(201).json({
    ...lot,
    availableSlots: totalSlots,
    rating: null,
    reviewCount: 0,
  });
});

export default router;
