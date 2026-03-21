import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { parkingSlotsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/:lotId/slots", async (req, res) => {
  const lotId = parseInt(req.params.lotId);
  const { slotType, available } = req.query as Record<string, string>;

  const conditions: any[] = [eq(parkingSlotsTable.lotId, lotId)];

  if (slotType) {
    conditions.push(eq(parkingSlotsTable.slotType, slotType as any));
  }
  if (available === "true") {
    conditions.push(eq(parkingSlotsTable.isAvailable, true));
  }
  if (available === "false") {
    conditions.push(eq(parkingSlotsTable.isAvailable, false));
  }

  const slots = await db.select().from(parkingSlotsTable).where(and(...conditions));
  const availableCount = slots.filter(s => s.isAvailable).length;

  res.json({
    slots: slots.map(s => ({
      id: s.id,
      lotId: s.lotId,
      slotNumber: s.slotNumber,
      slotType: s.slotType,
      floor: s.floor,
      isAvailable: s.isAvailable,
      pricePerHour: s.pricePerHour,
    })),
    total: slots.length,
    available: availableCount,
  });
});

export default router;
