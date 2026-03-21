import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, parkingSlotsTable, parkingLotsTable, usersTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth-middleware";

const router: IRouter = Router();

function generateQrCode(bookingId: number, userId: number): string {
  return `PARKSENSE-BOOKING-${bookingId}-USER-${userId}-${Date.now()}`;
}

async function getBookingWithDetails(bookingId: number) {
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId)).limit(1);
  if (!booking) return null;

  const [slot] = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.id, booking.slotId)).limit(1);
  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, booking.lotId)).limit(1);

  return {
    ...booking,
    lotName: lot?.name || "Unknown",
    slotNumber: slot?.slotNumber || "Unknown",
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.query as { status?: string };
  const conditions: any[] = [eq(bookingsTable.userId, req.userId!)];

  if (status) {
    conditions.push(eq(bookingsTable.status, status as any));
  }

  const bookings = await db.select().from(bookingsTable)
    .where(and(...conditions))
    .orderBy(desc(bookingsTable.createdAt));

  const withDetails = await Promise.all(bookings.map(async (b) => {
    const [slot] = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.id, b.slotId)).limit(1);
    const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, b.lotId)).limit(1);
    return {
      ...b,
      lotName: lot?.name || "Unknown",
      slotNumber: slot?.slotNumber || "Unknown",
    };
  }));

  res.json({ bookings: withDetails, total: withDetails.length });
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { slotId, startTime, endTime, vehicleNumber } = req.body;

  if (!slotId || !startTime || !endTime) {
    res.status(400).json({ error: "bad_request", message: "slotId, startTime, and endTime are required" });
    return;
  }

  const [slot] = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.id, slotId)).limit(1);
  if (!slot) {
    res.status(400).json({ error: "not_found", message: "Slot not found" });
    return;
  }
  if (!slot.isAvailable) {
    res.status(400).json({ error: "unavailable", message: "This slot is not available" });
    return;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  const totalAmount = parseFloat((hours * slot.pricePerHour).toFixed(2));

  const [booking] = await db.insert(bookingsTable).values({
    userId: req.userId!,
    slotId,
    lotId: slot.lotId,
    status: "pending",
    startTime: start,
    endTime: end,
    totalAmount,
    vehicleNumber: vehicleNumber || null,
  }).returning();

  await db.update(parkingSlotsTable).set({ isAvailable: false }).where(eq(parkingSlotsTable.id, slotId));

  const qrCode = generateQrCode(booking.id, req.userId!);
  await db.update(bookingsTable).set({ qrCode }).where(eq(bookingsTable.id, booking.id));

  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, slot.lotId)).limit(1);

  res.status(201).json({
    ...booking,
    qrCode,
    lotName: lot?.name || "Unknown",
    slotNumber: slot.slotNumber,
  });
});

router.get("/:bookingId", requireAuth, async (req: AuthRequest, res) => {
  const bookingId = parseInt(req.params.bookingId);
  const booking = await getBookingWithDetails(bookingId);

  if (!booking || (booking.userId !== req.userId && req.userRole !== "admin")) {
    res.status(404).json({ error: "not_found", message: "Booking not found" });
    return;
  }

  res.json(booking);
});

router.post("/:bookingId/cancel", requireAuth, async (req: AuthRequest, res) => {
  const bookingId = parseInt(req.params.bookingId);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId)).limit(1);

  if (!booking || booking.userId !== req.userId) {
    res.status(404).json({ error: "not_found", message: "Booking not found" });
    return;
  }

  if (booking.status === "completed" || booking.status === "cancelled") {
    res.status(400).json({ error: "bad_request", message: `Cannot cancel a ${booking.status} booking` });
    return;
  }

  const [updated] = await db.update(bookingsTable)
    .set({ status: "cancelled" })
    .where(eq(bookingsTable.id, bookingId))
    .returning();

  await db.update(parkingSlotsTable).set({ isAvailable: true }).where(eq(parkingSlotsTable.id, booking.slotId));

  const [slot] = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.id, booking.slotId)).limit(1);
  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, booking.lotId)).limit(1);

  res.json({ ...updated, lotName: lot?.name || "Unknown", slotNumber: slot?.slotNumber || "Unknown" });
});

router.get("/:bookingId/qr", requireAuth, async (req: AuthRequest, res) => {
  const bookingId = parseInt(req.params.bookingId);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId)).limit(1);

  if (!booking || booking.userId !== req.userId) {
    res.status(404).json({ error: "not_found", message: "Booking not found" });
    return;
  }

  const qrData = booking.qrCode || generateQrCode(bookingId, req.userId!);

  res.json({
    bookingId,
    qrData,
    qrImageUrl: null,
  });
});

export default router;
