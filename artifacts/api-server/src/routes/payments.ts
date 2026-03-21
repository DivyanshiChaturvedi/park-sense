import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { paymentsTable, bookingsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware";

const router: IRouter = Router();

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { bookingId, paymentMethod, amount } = req.body;

  if (!bookingId || !paymentMethod || !amount) {
    res.status(400).json({ error: "bad_request", message: "bookingId, paymentMethod, and amount are required" });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId)).limit(1);
  if (!booking || booking.userId !== req.userId) {
    res.status(404).json({ error: "not_found", message: "Booking not found" });
    return;
  }

  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const [payment] = await db.insert(paymentsTable).values({
    bookingId,
    userId: req.userId!,
    amount,
    paymentMethod,
    status: "completed",
    transactionId,
  }).returning();

  await db.update(bookingsTable).set({ status: "confirmed" }).where(eq(bookingsTable.id, bookingId));

  res.status(201).json(payment);
});

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.userId, req.userId!))
    .orderBy(desc(paymentsTable.createdAt));

  res.json({ payments, total: payments.length });
});

export default router;
