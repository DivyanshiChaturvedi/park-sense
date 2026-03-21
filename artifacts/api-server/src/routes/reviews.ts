import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { reviewsTable, usersTable, parkingLotsTable } from "@workspace/db/schema";
import { eq, avg, count, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const lotId = parseInt(req.query.lotId as string);
  if (!lotId) {
    res.status(400).json({ error: "bad_request", message: "lotId is required" });
    return;
  }

  const reviews = await db.select({
    id: reviewsTable.id,
    lotId: reviewsTable.lotId,
    userId: reviewsTable.userId,
    rating: reviewsTable.rating,
    comment: reviewsTable.comment,
    createdAt: reviewsTable.createdAt,
    userName: usersTable.name,
  }).from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
    .where(eq(reviewsTable.lotId, lotId))
    .orderBy(desc(reviewsTable.createdAt));

  const stats = await db.select({
    avg: sql<number>`AVG(${reviewsTable.rating})`,
  }).from(reviewsTable).where(eq(reviewsTable.lotId, lotId));

  res.json({
    reviews: reviews.map(r => ({ ...r, userName: r.userName || "Anonymous" })),
    total: reviews.length,
    averageRating: stats[0]?.avg ? parseFloat(parseFloat(stats[0].avg.toString()).toFixed(1)) : null,
  });
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { lotId, rating, comment } = req.body;

  if (!lotId || !rating) {
    res.status(400).json({ error: "bad_request", message: "lotId and rating are required" });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "bad_request", message: "Rating must be between 1 and 5" });
    return;
  }

  const [review] = await db.insert(reviewsTable).values({
    lotId,
    userId: req.userId!,
    rating,
    comment: comment || null,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

  res.status(201).json({
    ...review,
    userName: user?.name || "Anonymous",
  });
});

export default router;
