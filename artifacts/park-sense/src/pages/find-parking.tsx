import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Search, Star, Clock, Filter, AlertCircle, ArrowRight } from "lucide-react";
import { useListParkingLots } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FindParking() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce
  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading, error } = useListParkingLots({
    search: debouncedSearch || undefined,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
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
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
          <p className="text-muted-foreground mt-2">Try adjusting your search criteria or explore another area.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.lots.map((lot) => (
            <div 
              key={lot.id} 
              className="group bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image Placeholder (Stock) */}
              <div className="h-48 bg-muted relative overflow-hidden">
                {/* Find parking stock image */}
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
                  ${lot.pricePerHour}<span className="text-muted-foreground font-medium text-xs">/hr</span>
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
                    {lot.openTime && lot.closeTime ? `${lot.openTime} - ${lot.closeTime}` : '24/7'}
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
