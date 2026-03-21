import { Link } from "wouter";
import { format } from "date-fns";
import { formatPrice } from "@/lib/currency";
import { 
  Ticket, MapPin, Calendar, Clock, CreditCard, 
  XCircle, QrCode, ArrowRight, Loader2
} from "lucide-react";
import { 
  useListBookings, 
  useCancelBooking,
  BookingStatus
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MyBookings() {
  const { data, isLoading } = useListBookings();
  const cancelMutation = useCancelBooking();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCancel = (id: number) => {
    cancelMutation.mutate({ bookingId: id }, {
      onSuccess: () => {
        toast({ title: "Booking cancelled successfully." });
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      },
      onError: (err) => {
        toast({ 
          variant: "destructive", 
          title: "Failed to cancel", 
          description: err.message 
        });
      }
    });
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 border-amber-200";
      case "confirmed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
      case "active": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500 border-emerald-200";
      case "completed": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
      case "cancelled": return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-500 border-rose-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const bookings = data?.bookings || [];
  const activeBookings = bookings.filter(b => ["pending", "confirmed", "active"].includes(b.status));
  const pastBookings = bookings.filter(b => ["completed", "cancelled"].includes(b.status));

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
      <div className="h-2 w-full bg-primary" />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="outline" className={`${getStatusColor(booking.status)} uppercase tracking-wider text-[10px] font-bold px-2 py-0.5`}>
              {booking.status}
            </Badge>
            <h3 className="font-display font-bold text-xl mt-2 line-clamp-1">{booking.lotName}</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{formatPrice(booking.totalAmount)}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50 mb-2">
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground font-medium"><MapPin className="w-3.5 h-3.5 mr-1" /> Slot</div>
            <div className="font-bold font-display text-lg">{booking.slotNumber}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground font-medium"><Car className="w-3.5 h-3.5 mr-1" /> Vehicle</div>
            <div className="font-semibold uppercase">{booking.vehicleNumber || 'N/A'}</div>
          </div>
        </div>

        <div className="space-y-3 mt-5">
          <div className="flex items-start">
            <Calendar className="w-4 h-4 mr-3 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium">{format(new Date(booking.startTime), "EEEE, MMMM d, yyyy")}</div>
              <div className="text-xs text-muted-foreground">Date</div>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="w-4 h-4 mr-3 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-medium">
                {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
              </div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/20 p-4 border-t border-border/50 flex gap-3">
        {booking.status === "pending" && (
          <>
            <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href={`/bookings/${booking.id}/pay`}>
                <CreditCard className="w-4 h-4 mr-2" /> Pay Now
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleCancel(booking.id)} className="bg-destructive hover:bg-destructive/90 text-white">
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {(booking.status === "confirmed" || booking.status === "active") && (
          <>
            <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
              <Link href={`/bookings/${booking.id}/qr`}>
                <QrCode className="w-4 h-4 mr-2" /> View QR Ticket
              </Link>
            </Button>
          </>
        )}

        {["completed", "cancelled"].includes(booking.status) && (
          <Button asChild variant="outline" className="w-full">
            <Link href={`/lots/${booking.lotId}`}>
              Book Again
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage your upcoming and past parking reservations.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6 rounded-xl inline-flex w-full sm:w-auto">
          <TabsTrigger value="active" className="rounded-lg px-6 py-2.5 font-medium flex-1">
            Active & Upcoming ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg px-6 py-2.5 font-medium flex-1">
            History ({pastBookings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          {activeBookings.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border/60">
              <Ticket className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No active bookings</h3>
              <p className="text-muted-foreground mb-6">You don't have any upcoming parking reservations.</p>
              <Button asChild className="rounded-xl px-8 shadow-md">
                <Link href="/find">Find Parking</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          {pastBookings.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border/60">
              <History className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No past bookings</h3>
              <p className="text-muted-foreground">Your parking history will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pastBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
