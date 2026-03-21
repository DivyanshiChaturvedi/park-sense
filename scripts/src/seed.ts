import { db } from "@workspace/db";
import {
  usersTable,
  parkingLotsTable,
  parkingSlotsTable,
  bookingsTable,
  paymentsTable,
  reviewsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping.");
    process.exit(0);
  }

  const adminHash = await bcrypt.hash("password", 10);
  const userHash = await bcrypt.hash("password", 10);

  const [admin] = await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@parksense.com",
    passwordHash: adminHash,
    phone: "+1-555-0100",
    role: "admin",
  }).returning();

  const [user1] = await db.insert(usersTable).values({
    name: "John Smith",
    email: "user@parksense.com",
    passwordHash: userHash,
    phone: "+1-555-0101",
    role: "user",
  }).returning();

  const [user2] = await db.insert(usersTable).values({
    name: "Sarah Johnson",
    email: "sarah@example.com",
    passwordHash: userHash,
    phone: "+1-555-0102",
    role: "user",
  }).returning();

  const lots = await db.insert(parkingLotsTable).values([
    {
      name: "Downtown Central Parking",
      address: "123 Main Street",
      city: "New York",
      latitude: 40.7128,
      longitude: -74.0060,
      totalSlots: 50,
      pricePerHour: 8.0,
      isOpen: true,
      openTime: "06:00",
      closeTime: "23:00",
      amenities: ["CCTV", "EV Charging", "Accessible", "24/7 Security"],
    },
    {
      name: "Harbor View Parking",
      address: "456 Harbor Blvd",
      city: "San Francisco",
      latitude: 37.7749,
      longitude: -122.4194,
      totalSlots: 40,
      pricePerHour: 12.0,
      isOpen: true,
      openTime: "07:00",
      closeTime: "22:00",
      amenities: ["CCTV", "Valet Service", "Car Wash"],
    },
    {
      name: "Airport Express Parking",
      address: "789 Airport Road",
      city: "Los Angeles",
      latitude: 33.9425,
      longitude: -118.4081,
      totalSlots: 100,
      pricePerHour: 15.0,
      isOpen: true,
      openTime: "00:00",
      closeTime: "23:59",
      amenities: ["CCTV", "Shuttle Service", "EV Charging", "Accessible", "24/7"],
    },
    {
      name: "City Mall Parking Complex",
      address: "321 Shopping Ave",
      city: "Chicago",
      latitude: 41.8781,
      longitude: -87.6298,
      totalSlots: 30,
      pricePerHour: 5.0,
      isOpen: true,
      openTime: "08:00",
      closeTime: "21:00",
      amenities: ["CCTV", "Covered Parking"],
    },
    {
      name: "Tech Park Office Parking",
      address: "654 Innovation Dr",
      city: "Austin",
      latitude: 30.2672,
      longitude: -97.7431,
      totalSlots: 60,
      pricePerHour: 3.0,
      isOpen: true,
      openTime: "06:00",
      closeTime: "20:00",
      amenities: ["CCTV", "EV Charging", "Bicycle Parking"],
    },
  ]).returning();

  for (const lot of lots) {
    const slots: any[] = [];
    const types: ("standard" | "compact" | "handicapped" | "ev_charging")[] = [];

    for (let i = 0; i < lot.totalSlots; i++) {
      const row = String.fromCharCode(65 + Math.floor(i / 10));
      const num = (i % 10) + 1;
      let slotType: "standard" | "compact" | "handicapped" | "ev_charging" = "standard";
      if (i < 4) slotType = "ev_charging";
      else if (i >= 4 && i < 8) slotType = "handicapped";
      else if (i >= 8 && i < 18) slotType = "compact";

      slots.push({
        lotId: lot.id,
        slotNumber: `${row}${num}`,
        slotType,
        floor: Math.floor(i / 20) + 1,
        isAvailable: Math.random() > 0.3,
        pricePerHour: slotType === "ev_charging" ? lot.pricePerHour * 1.5 : lot.pricePerHour,
      });
    }

    await db.insert(parkingSlotsTable).values(slots);
  }

  const [slot1] = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lots[0].id)).limit(1);
  const now = new Date();
  const start1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const end1 = new Date(start1.getTime() + 3 * 60 * 60 * 1000);

  const [booking1] = await db.insert(bookingsTable).values({
    userId: user1.id,
    slotId: slot1.id,
    lotId: lots[0].id,
    status: "completed",
    startTime: start1,
    endTime: end1,
    totalAmount: 24.0,
    qrCode: `PARKSENSE-BOOKING-1-USER-${user1.id}-DEMO`,
    vehicleNumber: "NYC-4521",
  }).returning();

  await db.insert(paymentsTable).values({
    bookingId: booking1.id,
    userId: user1.id,
    amount: 24.0,
    paymentMethod: "credit_card",
    status: "completed",
    transactionId: "TXN-DEMO-001",
  });

  const [slot2] = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lots[1].id)).limit(1);
  const start2 = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const end2 = new Date(start2.getTime() + 2 * 60 * 60 * 1000);

  await db.insert(bookingsTable).values({
    userId: user1.id,
    slotId: slot2.id,
    lotId: lots[1].id,
    status: "confirmed",
    startTime: start2,
    endTime: end2,
    totalAmount: 24.0,
    qrCode: `PARKSENSE-BOOKING-2-USER-${user1.id}-DEMO`,
    vehicleNumber: "SF-7890",
  });

  await db.update(parkingSlotsTable).set({ isAvailable: false }).where(eq(parkingSlotsTable.id, slot2.id));

  const reviews = [
    { lotId: lots[0].id, userId: user1.id, rating: 5, comment: "Excellent parking facility! Very clean and well-organized." },
    { lotId: lots[0].id, userId: user2.id, rating: 4, comment: "Great location, easy access. Slightly pricey but worth it." },
    { lotId: lots[1].id, userId: user1.id, rating: 5, comment: "Stunning views from the parking structure. Great amenities!" },
    { lotId: lots[2].id, userId: user2.id, rating: 3, comment: "Convenient for airport but a bit expensive for long stays." },
    { lotId: lots[3].id, userId: user1.id, rating: 4, comment: "Perfect for mall visits. Affordable and covered." },
    { lotId: lots[4].id, userId: user2.id, rating: 5, comment: "Love the EV charging stations! Great for daily commuters." },
  ];

  await db.insert(reviewsTable).values(reviews);

  console.log("Seeding complete!");
  console.log(`Created ${lots.length} parking lots with slots`);
  console.log("Demo accounts:");
  console.log("  Admin: admin@parksense.com / password");
  console.log("  User:  user@parksense.com / password");
}

seed().catch(console.error).finally(() => process.exit(0));
