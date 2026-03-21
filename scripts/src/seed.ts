import { db } from "@workspace/db";
import {
  usersTable,
  parkingLotsTable,
  parkingSlotsTable,
  bookingsTable,
  paymentsTable,
  reviewsTable,
} from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Clearing existing data...");
  await db.execute(sql`TRUNCATE TABLE reviews, payments, bookings, parking_slots, parking_lots, users RESTART IDENTITY CASCADE`);

  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("password", 10);
  const userHash = await bcrypt.hash("password", 10);

  const [admin] = await db.insert(usersTable).values({
    name: "Admin User",
    email: "admin@parksense.com",
    passwordHash: adminHash,
    phone: "+91-98765-00000",
    role: "admin",
  }).returning();

  const [user1] = await db.insert(usersTable).values({
    name: "Rahul Sharma",
    email: "user@parksense.com",
    passwordHash: userHash,
    phone: "+91-98765-43210",
    role: "user",
  }).returning();

  const [user2] = await db.insert(usersTable).values({
    name: "Priya Patel",
    email: "priya@example.com",
    passwordHash: userHash,
    phone: "+91-91234-56789",
    role: "user",
  }).returning();

  const lots = await db.insert(parkingLotsTable).values([
    // India - Mumbai
    {
      name: "Bandra Kurla Complex Parking",
      address: "BKC Main Road, Bandra Kurla Complex",
      city: "Mumbai",
      latitude: 19.0596,
      longitude: 72.8656,
      totalSlots: 60,
      pricePerHour: 80.0,
      isOpen: true,
      openTime: "06:00",
      closeTime: "23:00",
      amenities: ["CCTV", "EV Charging", "Accessible", "Security Guard"],
    },
    {
      name: "Andheri Metro Parking",
      address: "Andheri Station Road, Andheri West",
      city: "Mumbai",
      latitude: 19.1197,
      longitude: 72.8468,
      totalSlots: 40,
      pricePerHour: 50.0,
      isOpen: true,
      openTime: "05:00",
      closeTime: "23:30",
      amenities: ["CCTV", "Covered Parking", "24/7 Security"],
    },
    // India - Delhi
    {
      name: "Connaught Place Multi-Level Parking",
      address: "Inner Circle, Connaught Place",
      city: "Delhi",
      latitude: 28.6315,
      longitude: 77.2167,
      totalSlots: 100,
      pricePerHour: 60.0,
      isOpen: true,
      openTime: "06:00",
      closeTime: "23:00",
      amenities: ["CCTV", "Multi-Level", "EV Charging", "Accessible", "Security"],
    },
    {
      name: "Saket District Centre Parking",
      address: "Press Enclave Road, Saket",
      city: "Delhi",
      latitude: 28.5244,
      longitude: 77.2066,
      totalSlots: 50,
      pricePerHour: 40.0,
      isOpen: true,
      openTime: "08:00",
      closeTime: "22:00",
      amenities: ["CCTV", "Covered Parking"],
    },
    // India - Bangalore
    {
      name: "MG Road Smart Parking",
      address: "MG Road, Shanthala Nagar",
      city: "Bangalore",
      latitude: 12.9750,
      longitude: 77.6100,
      totalSlots: 50,
      pricePerHour: 70.0,
      isOpen: true,
      openTime: "07:00",
      closeTime: "22:00",
      amenities: ["CCTV", "EV Charging", "Car Wash"],
    },
    {
      name: "Electronic City Parking Hub",
      address: "Phase 1, Electronic City",
      city: "Bangalore",
      latitude: 12.8458,
      longitude: 77.6626,
      totalSlots: 80,
      pricePerHour: 30.0,
      isOpen: true,
      openTime: "06:00",
      closeTime: "21:00",
      amenities: ["CCTV", "EV Charging", "Bicycle Parking", "Security"],
    },
    // India - Hyderabad
    {
      name: "HITEC City Parking Complex",
      address: "Cyber Towers Road, HITEC City",
      city: "Hyderabad",
      latitude: 17.4435,
      longitude: 78.3772,
      totalSlots: 70,
      pricePerHour: 40.0,
      isOpen: true,
      openTime: "06:00",
      closeTime: "22:00",
      amenities: ["CCTV", "EV Charging", "Accessible", "24/7"],
    },
    // India - Chennai
    {
      name: "T. Nagar Central Parking",
      address: "Pondy Bazaar, T. Nagar",
      city: "Chennai",
      latitude: 13.0418,
      longitude: 80.2341,
      totalSlots: 45,
      pricePerHour: 35.0,
      isOpen: true,
      openTime: "07:00",
      closeTime: "22:00",
      amenities: ["CCTV", "Covered Parking", "Security Guard"],
    },
    // India - Pune
    {
      name: "FC Road Parking",
      address: "Fergusson College Road, Shivajinagar",
      city: "Pune",
      latitude: 18.5204,
      longitude: 73.8567,
      totalSlots: 35,
      pricePerHour: 30.0,
      isOpen: true,
      openTime: "08:00",
      closeTime: "21:00",
      amenities: ["CCTV", "Accessible"],
    },
    // India - Kolkata
    {
      name: "Park Street Underground Parking",
      address: "Park Street, Kolkata",
      city: "Kolkata",
      latitude: 22.5521,
      longitude: 88.3516,
      totalSlots: 55,
      pricePerHour: 25.0,
      isOpen: true,
      openTime: "07:00",
      closeTime: "23:00",
      amenities: ["CCTV", "Covered Parking", "Security"],
    },
  ]).returning();

  for (const lot of lots) {
    const slots: any[] = [];
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

  // Create a sample booking
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
    totalAmount: 240.0,
    qrCode: `PARKSENSE-BOOKING-1-USER-${user1.id}-DEMO`,
    vehicleNumber: "MH-01-AB-1234",
  }).returning();

  await db.insert(paymentsTable).values({
    bookingId: booking1.id,
    userId: user1.id,
    amount: 240.0,
    paymentMethod: "upi",
    status: "completed",
    transactionId: "TXN-DEMO-001",
  });

  const [slot2] = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lots[2].id)).limit(1);
  const start2 = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const end2 = new Date(start2.getTime() + 2 * 60 * 60 * 1000);

  const [booking2] = await db.insert(bookingsTable).values({
    userId: user1.id,
    slotId: slot2.id,
    lotId: lots[2].id,
    status: "confirmed",
    startTime: start2,
    endTime: end2,
    totalAmount: 120.0,
    qrCode: `PARKSENSE-BOOKING-2-USER-${user1.id}-DEMO`,
    vehicleNumber: "DL-01-CD-5678",
  }).returning();

  await db.update(parkingSlotsTable).set({ isAvailable: false }).where(eq(parkingSlotsTable.id, slot2.id));

  await db.insert(paymentsTable).values({
    bookingId: booking2.id,
    userId: user1.id,
    amount: 120.0,
    paymentMethod: "credit_card",
    status: "completed",
    transactionId: "TXN-DEMO-002",
  });

  const reviews = [
    { lotId: lots[0].id, userId: user1.id, rating: 5, comment: "Excellent facility! Clean and well-organized. Security is top-notch." },
    { lotId: lots[0].id, userId: user2.id, rating: 4, comment: "Great location near BKC offices. Slightly pricey but worth it." },
    { lotId: lots[2].id, userId: user1.id, rating: 5, comment: "Best parking in Connaught Place! Easy to find, clean restrooms too." },
    { lotId: lots[2].id, userId: user2.id, rating: 4, comment: "Central location, great for CP visits. Can get crowded on weekends." },
    { lotId: lots[4].id, userId: user2.id, rating: 5, comment: "Perfect for MG Road shopping. EV charging was very handy!" },
    { lotId: lots[6].id, userId: user1.id, rating: 4, comment: "Good for HITEC City workers. EV stations are a plus." },
    { lotId: lots[7].id, userId: user2.id, rating: 3, comment: "Decent but gets crowded during peak shopping hours." },
    { lotId: lots[1].id, userId: user2.id, rating: 4, comment: "Very convenient for metro commuters. Good security." },
  ];

  await db.insert(reviewsTable).values(reviews);

  console.log("Seeding complete!");
  console.log(`Created ${lots.length} parking lots across Indian cities`);
  console.log("Demo accounts:");
  console.log("  Admin: admin@parksense.com / password");
  console.log("  User:  user@parksense.com / password");
}

seed().catch(console.error).finally(() => process.exit(0));
