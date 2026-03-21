import { pgTable, serial, text, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const parkingLotsTable = pgTable("parking_lots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  totalSlots: integer("total_slots").notNull(),
  pricePerHour: real("price_per_hour").notNull(),
  imageUrl: text("image_url"),
  isOpen: boolean("is_open").notNull().default(true),
  openTime: text("open_time"),
  closeTime: text("close_time"),
  amenities: text("amenities").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertParkingLotSchema = createInsertSchema(parkingLotsTable).omit({ id: true, createdAt: true });
export type InsertParkingLot = z.infer<typeof insertParkingLotSchema>;
export type ParkingLot = typeof parkingLotsTable.$inferSelect;
