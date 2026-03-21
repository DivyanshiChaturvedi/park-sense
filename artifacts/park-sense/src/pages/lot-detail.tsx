import { useState } from "react";
import { useParams, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addHours, format } from "date-fns";
import { 
  MapPin, Star, Clock, Info, Shield, CheckCircle2, 
  Car, Zap, Accessibility, ChevronLeft, CalendarIcon, Loader2
} from "lucide-react";
import { 
  useGetParkingLot, 
  useListParkingSlots, 
  useCreateBooking,
  ParkingSlotSlotType
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Zod schema for booking
const bookingSchema = z.object({
  slotId: z.coerce.number().min(1, "Please select a parking slot"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  durationHours: z.coerce.number().min(1).max(24),
  vehicleNumber: z.string().min(2, "Vehicle number is required"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function LotDetail() {
  const params = useParams();
  const lotId = parseInt(params.id || "0");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const { data: lot, isLoading: lotLoading } = useGetParkingLot(lotId);
  const { data: slotsData, isLoading: slotsLoading } = useListParkingSlots(lotId, {
    slotType: selectedType !== "all" ? selectedType as ParkingSlotSlotType : undefined
  });

  const createBookingMutation = useCreateBooking();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      slotId: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: format(new Date(), "HH:mm"),
      durationHours: 2,
      vehicleNumber: "",
    },
  });

  // Watch duration to calculate total price
  const duration = form.watch("durationHours");
  const totalPrice = lot ? lot.pricePerHour * (duration || 0) : 0;

  const handleSlotSelect = (slotId: number) => {
    setSelectedSlotId(slotId);
    form.setValue("slotId", slotId);
  };

  const onSubmit = (data: BookingFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a parking slot.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const startDateTime = new Date(`${data.date}T${data.startTime}`);
    const endDateTime = addHours(startDateTime, data.durationHours);

    createBookingMutation.mutate({
      data: {
        slotId: data.slotId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        vehicleNumber: data.vehicleNumber,
      }
    }, {
      onSuccess: (booking) => {
        toast({
          title: "Booking Initiated!",
          description: "Please complete payment to confirm your booking.",
        });
        window.location.href = `/bookings/${booking.id}/pay`;
      },
      onError: (err) => {
        toast({
          title: "Booking Failed",
          description: err.message || "Could not reserve this slot.",
          variant: "destructive",
        });
      }
    });
  };

  if (lotLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  if (!lot) return <div className="p-8 text-center text-xl text-muted-foreground">Parking lot not found.</div>;

  return (
    <div className="bg-background min-h-full pb-20">
      {/* Top Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900">
        {/* parking lot aerial view */}
        <img 
          src={lot.imageUrl || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1600&h=600&fit=crop"} 
          alt={lot.name} 
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        
        <div className="absolute top-6 left-6">
          <Button asChild variant="outline" size="sm" className="bg-background/50 backdrop-blur-md border-white/20 text-white hover:bg-background/80 hover:text-white">
            <Link href="/find">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Search
            </Link>
          </Button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <Badge className={lot.availableSlots > 0 ? "bg-emerald-500 text-white border-0" : "bg-destructive text-white border-0"}>
                {lot.availableSlots > 0 ? `${lot.availableSlots} Slots Available` : "Full"}
              </Badge>
              <div className="flex items-center text-sm font-medium bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-current mr-1" />
                {lot.rating?.toFixed(1) || "New"} ({lot.reviewCount} reviews)
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-2 shadow-sm">{lot.name}</h1>
            <div className="flex items-center text-slate-300 text-sm md:text-base">
              <MapPin className="w-4 h-4 mr-1.5" />
              {lot.address}, {lot.city}
            </div>
          </div>
          
          <div className="bg-background/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white text-center min-w-[120px]">
            <div className="text-3xl font-display font-bold">${lot.pricePerHour}</div>
            <div className="text-slate-300 text-sm uppercase tracking-wider font-semibold">Per Hour</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Slot Selection */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Info Bar */}
          <div className="flex flex-wrap gap-6 p-5 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Operating Hours</p>
                <p className="font-semibold text-foreground">{lot.openTime && lot.closeTime ? `${lot.openTime} - ${lot.closeTime}` : '24/7 Open'}</p>
              </div>
            </div>
            <Separator orientation="vertical" className="hidden md:block h-10" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Security</p>
                <p className="font-semibold text-foreground">24/7 Camera & Guard</p>
              </div>
            </div>
            <Separator orientation="vertical" className="hidden md:block h-10" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Capacity</p>
                <p className="font-semibold text-foreground">{lot.totalSlots} Slots</p>
              </div>
            </div>
          </div>

          {/* Slot Selection Visualizer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Select a Spot</h2>
              
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div> Available</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div> Occupied</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-primary mr-2"></div> Selected</div>
              </div>
            </div>

            <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType} className="w-full">
              <TabsList className="bg-muted/50 p-1 rounded-xl w-full flex overflow-x-auto justify-start hide-scrollbar">
                <TabsTrigger value="all" className="rounded-lg px-4 flex-1">All Slots</TabsTrigger>
                <TabsTrigger value="standard" className="rounded-lg px-4 flex-1"><Car className="w-4 h-4 mr-2"/> Standard</TabsTrigger>
                <TabsTrigger value="ev_charging" className="rounded-lg px-4 flex-1"><Zap className="w-4 h-4 mr-2 text-yellow-500"/> EV Charging</TabsTrigger>
                <TabsTrigger value="handicapped" className="rounded-lg px-4 flex-1"><Accessibility className="w-4 h-4 mr-2 text-blue-500"/> Accessible</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="bg-slate-100 dark:bg-slate-900 border border-border rounded-3xl p-6 md:p-10 relative mt-4 shadow-inner">
              {/* Road markings */}
              <div className="absolute top-1/2 left-4 right-4 h-12 border-y-2 border-dashed border-slate-300 dark:border-slate-700 -translate-y-1/2 flex items-center justify-center">
                <div className="px-4 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-bold text-slate-400 uppercase tracking-widest">Driveway</div>
              </div>

              {slotsLoading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 relative z-10">
                  {slotsData?.slots.map(slot => {
                    const isSelected = selectedSlotId === slot.id;
                    const isAvailable = slot.isAvailable;
                    
                    let typeIcon = null;
                    if (slot.slotType === "ev_charging") typeIcon = <Zap className="w-3 h-3 text-yellow-500" />;
                    if (slot.slotType === "handicapped") typeIcon = <Accessibility className="w-3 h-3 text-blue-500" />;

                    return (
                      <button
                        key={slot.id}
                        disabled={!isAvailable}
                        onClick={() => handleSlotSelect(slot.id)}
                        className={`
                          relative h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all duration-200 font-medium text-sm
                          ${isSelected ? 'slot-selected' : ''}
                          ${!isSelected && isAvailable ? 'slot-available' : ''}
                          ${!isAvailable ? 'slot-occupied' : ''}
                        `}
                      >
                        <span className="font-display text-lg">{slot.slotNumber}</span>
                        {typeIcon && <div className="absolute top-1 right-1 bg-background/50 rounded-sm p-0.5">{typeIcon}</div>}
                        {isSelected && <CheckCircle2 className="w-4 h-4 absolute bottom-1 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Amenities & Details */}
          <div className="space-y-4 pt-6">
            <h3 className="text-xl font-display font-bold">Amenities & Features</h3>
            <div className="flex flex-wrap gap-3">
              {lot.amenities.map(amenity => (
                <Badge key={amenity} variant="outline" className="px-4 py-2 text-sm bg-muted/30 font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-3xl bg-card border border-border shadow-xl p-6">
            <h3 className="text-2xl font-display font-bold mb-6 pb-4 border-b border-border">Book this Spot</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                
                <div className="bg-muted/50 p-4 rounded-xl border border-border mb-6 flex justify-between items-center">
                  <div className="text-sm font-medium text-muted-foreground">Selected Spot</div>
                  {selectedSlotId ? (
                    <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold text-base px-3 py-1">
                      {slotsData?.slots.find(s => s.id === selectedSlotId)?.slotNumber || 'Unknown'}
                    </Badge>
                  ) : (
                    <span className="text-sm text-destructive font-semibold">None selected</span>
                  )}
                </div>
                
                {/* Hidden input to ensure form validation runs for slotId */}
                <input type="hidden" {...form.register("slotId")} />
                {form.formState.errors.slotId && (
                  <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.slotId.message}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input type="date" className="pl-9 bg-background" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input type="time" className="pl-9 bg-background" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="durationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Hours)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="1" 
                            max="24" 
                            className="flex-1 accent-primary" 
                            {...field} 
                          />
                          <div className="w-12 text-center font-bold bg-muted px-2 py-1 rounded-md">{field.value}h</div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Plate Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="e.g. ABC-1234" className="pl-9 bg-background uppercase" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-6" />

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium">${lot.pricePerHour.toFixed(2)} / hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{duration} hours</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                    <span>Total Amount</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25"
                  disabled={createBookingMutation.isPending || !selectedSlotId}
                >
                  {createBookingMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                  Proceed to Payment
                </Button>
                
                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    You'll be asked to sign in if you haven't already.
                  </p>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
