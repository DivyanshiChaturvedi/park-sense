import { pgTable, serial, text, timestamp, integer, real, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { parkingLotsTable } from "./parking-lots";

export const slotTypeEnum = pgEnum("slot_type", ["standard", "compact", "handicapped", "ev_charging"]);

export const parkingSlotsTable = pgTable("parking_slots", {
  id: serial("id").primaryKey(),
  lotId: integer("lot_id").notNull().references(() => parkingLotsTable.id),
  slotNumber: text("slot_number").notNull(),
  slotType: slotTypeEnum("slot_type").notNull().default("standard"),
  floor: integer("floor"),
  isAvailable: boolean("is_available").notNull().default(true),
  pricePerHour: real("price_per_hour").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertParkingSlotSchema = createInsertSchema(parkingSlotsTable).omit({ id: true, createdAt: true });
export type InsertParkingSlot = z.infer<typeof insertParkingSlotSchema>;
export type ParkingSlot = typeof parkingSlotsTable.$inferSelect;
