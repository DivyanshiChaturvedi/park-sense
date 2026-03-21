const INDIAN_CITIES = new Set([
  "mumbai", "delhi", "bangalore", "bengaluru", "hyderabad",
  "chennai", "pune", "kolkata", "calcutta", "ahmedabad",
  "jaipur", "surat", "lucknow", "kanpur", "nagpur",
  "indore", "thane", "bhopal", "visakhapatnam", "pimpri",
  "patna", "vadodara", "ghaziabad", "ludhiana", "agra",
  "nashik", "faridabad", "meerut", "rajkot", "varanasi",
  "srinagar", "aurangabad", "dhanbad", "amritsar", "allahabad",
  "ranchi", "coimbatore", "jabalpur", "gwalior", "vijayawada",
  "madurai", "raipur", "kota", "guwahati", "chandigarh",
  "solapur", "hubli", "dharwad", "bareilly", "moradabad",
  "mysore", "mysuru", "gurgaon", "gurugram", "noida",
  "new delhi", "navi mumbai",
]);

export function getCurrencySymbol(city?: string | null): string {
  if (!city) return "₹";
  return INDIAN_CITIES.has(city.toLowerCase().trim()) ? "₹" : "$";
}

export function formatPrice(amount: number, city?: string | null): string {
  const symbol = getCurrencySymbol(city);
  if (symbol === "₹") {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return `$${amount.toFixed(2)}`;
}

export function formatPricePerHour(pricePerHour: number, city?: string | null): string {
  return `${formatPrice(pricePerHour, city)}/hr`;
}
