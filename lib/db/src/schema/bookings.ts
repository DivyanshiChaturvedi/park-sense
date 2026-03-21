import { pgTable, serial, text, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { parkingSlotsTable } from "./parking-slots";
import { parkingLotsTable } from "./parking-lots";

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "active", "completed", "cancelled"]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  slotId: integer("slot_id").notNull().references(() => parkingSlotsTable.id),
  lotId: integer("lot_id").notNull().references(() => parkingLotsTable.id),
  status: bookingStatusEnum("status").notNull().default("pending"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  totalAmount: real("total_amount").notNull(),
  qrCode: text("qr_code"),
  vehicleNumber: text("vehicle_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
