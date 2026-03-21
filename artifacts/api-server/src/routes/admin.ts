import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, parkingLotsTable, parkingSlotsTable, paymentsTable, usersTable } from "@workspace/db/schema";
import { count, sum, eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth-middleware";
import { parkingSlotsTable as slotsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", async (_req, res) => {
  const [lotCount] = await db.select({ count: count() }).from(parkingLotsTable);
  const [slotCount] = await db.select({ count: count() }).from(parkingSlotsTable);
  const [availableCount] = await db.select({ count: count() }).from(parkingSlotsTable).where(eq(parkingSlotsTable.isAvailable, true));
  const [bookingCount] = await db.select({ count: count() }).from(bookingsTable);
  const [activeCount] = await db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.status, "active"));
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [revenueResult] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "completed"));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [todayRevenue] = await db.select({ total: sum(paymentsTable.amount) })
    .from(paymentsTable)
    .where(sql`${paymentsTable.status} = 'completed' AND ${paymentsTable.createdAt} >= ${today}`);

  res.json({
    totalLots: lotCount.count,
    totalSlots: slotCount.count,
    availableSlots: availableCount.count,
    totalBookings: bookingCount.count,
    activeBookings: activeCount.count,
    totalRevenue: parseFloat(revenueResult.total?.toString() || "0"),
    todayRevenue: parseFloat(todayRevenue.total?.toString() || "0"),
    totalUsers: userCount.count,
  });
});

router.get("/bookings", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const bookings = await db.select().from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const withDetails = await Promise.all(bookings.map(async (b) => {
    const [slot] = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.id, b.slotId)).limit(1);
    const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, b.lotId)).limit(1);
    return {
      ...b,
      lotName: lot?.name || "Unknown",
      slotNumber: slot?.slotNumber || "Unknown",
    };
  }));

  const [total] = await db.select({ count: count() }).from(bookingsTable);

  res.json({
    bookings: withDetails,
    total: total.count,
    page,
    limit,
  });
});

export default router;
