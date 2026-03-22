import { db } from "@workspace/db";
import { parkingLotsTable, parkingSlotsTable } from "@workspace/db/schema";

const newLots = [
  {
    name: "Pink City Parking – Johri Bazaar",
    address: "Johri Bazaar Road, Near Hawa Mahal",
    city: "Jaipur",
    latitude: 26.9239, longitude: 75.8267,
    totalSlots: 55, pricePerHour: 30.0,
    isOpen: true, openTime: "07:00", closeTime: "22:00",
    amenities: ["CCTV", "Covered Parking", "Security Guard"],
  },
  {
    name: "Jaipur Metro Mall Parking",
    address: "Tonk Road, Durgapura",
    city: "Jaipur",
    latitude: 26.8557, longitude: 75.8113,
    totalSlots: 80, pricePerHour: 25.0,
    isOpen: true, openTime: "08:00", closeTime: "23:00",
    amenities: ["CCTV", "Multi-Level", "EV Charging"],
  },
  {
    name: "SG Highway Premium Parking",
    address: "SG Highway, Bodakdev",
    city: "Ahmedabad",
    latitude: 23.0468, longitude: 72.5086,
    totalSlots: 70, pricePerHour: 35.0,
    isOpen: true, openTime: "06:00", closeTime: "23:00",
    amenities: ["CCTV", "EV Charging", "24/7 Security"],
  },
  {
    name: "Law Garden Parking",
    address: "Netaji Road, Law Garden",
    city: "Ahmedabad",
    latitude: 23.0271, longitude: 72.5503,
    totalSlots: 45, pricePerHour: 25.0,
    isOpen: true, openTime: "07:00", closeTime: "22:00",
    amenities: ["CCTV", "Accessible"],
  },
  {
    name: "Sector 17 Smart Parking",
    address: "Sector 17, Chandigarh",
    city: "Chandigarh",
    latitude: 30.7433, longitude: 76.7794,
    totalSlots: 60, pricePerHour: 20.0,
    isOpen: true, openTime: "06:00", closeTime: "22:00",
    amenities: ["CCTV", "EV Charging", "Bicycle Parking"],
  },
  {
    name: "Elante Mall Parking",
    address: "Industrial & Business Park, Phase 1",
    city: "Chandigarh",
    latitude: 30.7046, longitude: 76.8019,
    totalSlots: 120, pricePerHour: 30.0,
    isOpen: true, openTime: "10:00", closeTime: "22:00",
    amenities: ["CCTV", "Multi-Level", "EV Charging", "Accessible", "Security"],
  },
  {
    name: "Hazratganj Central Parking",
    address: "Hazratganj, Near Janpath Market",
    city: "Lucknow",
    latitude: 26.8536, longitude: 80.9408,
    totalSlots: 65, pricePerHour: 20.0,
    isOpen: true, openTime: "07:00", closeTime: "22:00",
    amenities: ["CCTV", "Security Guard"],
  },
  {
    name: "Phoenix Palassio Parking",
    address: "Sultanpur Road, Sushant Golf City",
    city: "Lucknow",
    latitude: 26.7922, longitude: 80.9466,
    totalSlots: 100, pricePerHour: 30.0,
    isOpen: true, openTime: "10:00", closeTime: "22:00",
    amenities: ["CCTV", "Multi-Level", "EV Charging", "Accessible"],
  },
  {
    name: "MG Road Smart Parking",
    address: "MG Road, Ernakulam",
    city: "Kochi",
    latitude: 9.9675, longitude: 76.2883,
    totalSlots: 40, pricePerHour: 30.0,
    isOpen: true, openTime: "07:00", closeTime: "22:00",
    amenities: ["CCTV", "Covered Parking"],
  },
  {
    name: "Lulu Mall Parking Complex",
    address: "Edapally, NH 47 Bypass",
    city: "Kochi",
    latitude: 10.0261, longitude: 76.3083,
    totalSlots: 200, pricePerHour: 20.0,
    isOpen: true, openTime: "09:00", closeTime: "22:00",
    amenities: ["CCTV", "Multi-Level", "EV Charging", "Accessible"],
  },
  {
    name: "Sadar Bazaar Parking",
    address: "Sadar, Nagpur",
    city: "Nagpur",
    latitude: 21.1498, longitude: 79.0806,
    totalSlots: 50, pricePerHour: 20.0,
    isOpen: true, openTime: "07:00", closeTime: "22:00",
    amenities: ["CCTV", "Security Guard"],
  },
  {
    name: "Treasure Island Mall Parking",
    address: "MG Road, Indore",
    city: "Indore",
    latitude: 22.7196, longitude: 75.8577,
    totalSlots: 90, pricePerHour: 25.0,
    isOpen: true, openTime: "10:00", closeTime: "22:00",
    amenities: ["CCTV", "Multi-Level", "EV Charging"],
  },
  {
    name: "Golden Temple Parking",
    address: "GT Road, Near Golden Temple",
    city: "Amritsar",
    latitude: 31.6200, longitude: 74.8765,
    totalSlots: 75, pricePerHour: 15.0,
    isOpen: true, openTime: "05:00", closeTime: "23:00",
    amenities: ["CCTV", "24/7 Security", "Accessible"],
  },
  {
    name: "Guwahati Railway Station Parking",
    address: "AT Road, Panbazar",
    city: "Guwahati",
    latitude: 26.1830, longitude: 91.7458,
    totalSlots: 45, pricePerHour: 15.0,
    isOpen: true, openTime: "05:00", closeTime: "23:00",
    amenities: ["CCTV", "Security"],
  },
  {
    name: "DB Mall Parking",
    address: "Arera Hills, Bhopal",
    city: "Bhopal",
    latitude: 23.2599, longitude: 77.4126,
    totalSlots: 55, pricePerHour: 20.0,
    isOpen: true, openTime: "10:00", closeTime: "21:00",
    amenities: ["CCTV", "Covered Parking", "Security"],
  },
  {
    name: "Vizag Beach Road Parking",
    address: "Beach Road, RK Beach",
    city: "Visakhapatnam",
    latitude: 17.7231, longitude: 83.3290,
    totalSlots: 60, pricePerHour: 20.0,
    isOpen: true, openTime: "06:00", closeTime: "22:00",
    amenities: ["CCTV", "Accessible"],
  },
  {
    name: "Surat Diamond Bourse Parking",
    address: "Khajod, Surat",
    city: "Surat",
    latitude: 21.1702, longitude: 72.8311,
    totalSlots: 100, pricePerHour: 30.0,
    isOpen: true, openTime: "07:00", closeTime: "21:00",
    amenities: ["CCTV", "EV Charging", "Multi-Level", "Security"],
  },
  {
    name: "Varanasi Ghats Parking",
    address: "Assi Ghat Road, Varanasi",
    city: "Varanasi",
    latitude: 25.2677, longitude: 82.9913,
    totalSlots: 40, pricePerHour: 15.0,
    isOpen: true, openTime: "05:00", closeTime: "23:00",
    amenities: ["CCTV", "Security"],
  },
  {
    name: "Coimbatore Airport Parking",
    address: "Peelamedu, Coimbatore",
    city: "Coimbatore",
    latitude: 11.0300, longitude: 77.0440,
    totalSlots: 80, pricePerHour: 25.0,
    isOpen: true, openTime: "00:00", closeTime: "23:59",
    amenities: ["CCTV", "24/7 Security", "EV Charging", "Accessible"],
  },
  {
    name: "Vijayawada Bus Stand Parking",
    address: "Pandit Nehru Bus Station, Vijayawada",
    city: "Vijayawada",
    latitude: 16.5062, longitude: 80.6480,
    totalSlots: 50, pricePerHour: 15.0,
    isOpen: true, openTime: "05:00", closeTime: "23:00",
    amenities: ["CCTV", "Security Guard"],
  },
];

async function addCities() {
  console.log("Adding new city parking lots...");
  const inserted = await db.insert(parkingLotsTable).values(newLots).returning();

  for (const lot of inserted) {
    const slots: any[] = [];
    for (let i = 0; i < lot.totalSlots; i++) {
      const row = String.fromCharCode(65 + Math.floor(i / 10));
      const num = (i % 10) + 1;
      let slotType: "standard" | "compact" | "handicapped" | "ev_charging" = "standard";
      if (i < 3) slotType = "ev_charging";
      else if (i >= 3 && i < 6) slotType = "handicapped";
      else if (i >= 6 && i < 14) slotType = "compact";
      slots.push({
        lotId: lot.id,
        slotNumber: `${row}${num}`,
        slotType,
        floor: Math.floor(i / 20) + 1,
        isAvailable: Math.random() > 0.25,
        pricePerHour: slotType === "ev_charging" ? lot.pricePerHour * 1.5 : lot.pricePerHour,
      });
    }
    await db.insert(parkingSlotsTable).values(slots);
    console.log(`  ✓ ${lot.name} (${lot.city}) — ${lot.totalSlots} slots`);
  }

  const cities = [...new Set(inserted.map(l => l.city))];
  console.log(`\nDone! Added ${inserted.length} parking lots across: ${cities.join(", ")}`);
  process.exit(0);
}

addCities().catch(e => { console.error(e); process.exit(1); });
