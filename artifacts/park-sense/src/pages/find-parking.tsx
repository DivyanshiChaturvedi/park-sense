import { useState, useEffect } from "react";
import { Link } from "wouter";
import { MapPin, Search, Star, Clock, Filter, AlertCircle, ArrowRight, X, SlidersHorizontal } from "lucide-react";
import { useListParkingLots } from "@workspace/api-client-react";
import { formatPrice, formatPricePerHour } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh",
  "Lucknow", "Kochi", "Nagpur", "Indore", "Amritsar",
  "Guwahati", "Bhopal", "Visakhapatnam", "Surat", "Varanasi",
  "Coimbatore", "Vijayawada",
];

export default function FindParking() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Properly debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error } = useListParkingLots({
    search: debouncedSearch || undefined,
    city: selectedCity || undefined,
    available: availableOnly ? "true" : undefined,
  } as any);

  const hasActiveFilters = selectedCity || availableOnly;

  const clearFilters = () => {
    setSelectedCity("");
    setAvailableOnly(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Find Parking</h1>
          <p className="text-muted-foreground mt-1">Discover and book parking spots near you.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search city, address or lot name..."
              className="pl-9 h-11 rounded-xl bg-background border-border/60 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-11 px-4 rounded-xl shrink-0 gap-2 ${hasActiveFilters ? "border-primary text-primary bg-primary/5" : ""}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {[selectedCity, availableOnly].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-5 rounded-2xl shadow-xl" align="end">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
                    Clear all
                  </button>
                )}
              </div>

              {/* City Filter */}
              <div className="space-y-3 mb-5">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">City</Label>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(selectedCity === city ? "" : city)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selectedCity === city
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Only */}
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <Label htmlFor="available-toggle" className="font-medium cursor-pointer">Available slots only</Label>
                  <p className="text-xs text-muted-foreground">Hide full parking lots</p>
                </div>
                <Switch
                  id="available-toggle"
                  checked={availableOnly}
                  onCheckedChange={setAvailableOnly}
                />
              </div>

              <Button className="w-full mt-4 rounded-xl" onClick={() => setFilterOpen(false)}>
                Show Results
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCity && (
            <Badge
              variant="secondary"
              className="px-3 py-1 rounded-full cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
              onClick={() => setSelectedCity("")}
            >
              <MapPin className="w-3 h-3 mr-1" />
              {selectedCity}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {availableOnly && (
            <Badge
              variant="secondary"
              className="px-3 py-1 rounded-full cursor-pointer bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
              onClick={() => setAvailableOnly(false)}
            >
              Available only
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      {!isLoading && !error && data && (
        <p className="text-sm text-muted-foreground">
          {data.lots.length === 0
            ? "No lots found"
            : `Showing ${data.lots.length} parking lot${data.lots.length !== 1 ? "s" : ""}${selectedCity ? ` in ${selectedCity}` : ""}`}
        </p>
      )}

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load parking lots. Please try again.</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl border border-border p-5 space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.lots.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border/50">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-foreground">No parking lots found</h3>
          <p className="text-muted-foreground mt-2">
            {hasActiveFilters ? "Try removing some filters." : "Try adjusting your search criteria or explore another area."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4 rounded-xl" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.lots.map((lot) => (
            <div
              key={lot.id}
              className="group bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="h-48 bg-muted relative overflow-hidden">
                <img
                  src={lot.imageUrl || "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&h=400&fit=crop"}
                  alt={lot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  {lot.availableSlots > 0 ? (
                    <Badge className="bg-emerald-500 text-white border-0 shadow-lg px-3 py-1 font-semibold">
                      {lot.availableSlots} Slots Available
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="shadow-lg px-3 py-1 font-semibold">
                      Full
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur text-foreground px-3 py-1.5 rounded-lg font-bold shadow-lg text-sm border border-border/50">
                  {formatPricePerHour(lot.pricePerHour, lot.city)}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display font-bold text-xl text-foreground line-clamp-1">{lot.name}</h3>
                  <div className="flex items-center gap-1 text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 px-2 py-0.5 rounded-md shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {lot.rating?.toFixed(1) || "New"}
                  </div>
                </div>

                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                  <span className="line-clamp-1">{lot.address}, {lot.city}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                  {lot.amenities?.slice(0, 3).map(amenity => (
                    <Badge key={amenity} variant="secondary" className="font-medium text-xs bg-muted text-muted-foreground">
                      {amenity}
                    </Badge>
                  ))}
                  {(lot.amenities?.length || 0) > 3 && (
                    <Badge variant="secondary" className="font-medium text-xs bg-muted text-muted-foreground">
                      +{(lot.amenities?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {lot.openTime && lot.closeTime ? `${lot.openTime} - ${lot.closeTime}` : "24/7"}
                  </div>
                  <Button asChild className="rounded-xl shadow-md group-hover:bg-primary/90 transition-colors">
                    <Link href={`/lots/${lot.id}`}>
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
