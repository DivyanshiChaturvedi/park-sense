import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { 
  ChevronLeft, MapPin, Calendar, Clock, Car, 
  CheckCircle2, Download, AlertCircle, Loader2 
} from "lucide-react";
import { useGetBooking, useGetBookingQr } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function QRTicket() {
  const params = useParams();
  const bookingId = parseInt(params.id || "0");

  const { data: booking, isLoading: bookingLoading } = useGetBooking(bookingId);
  const { data: qrData, isLoading: qrLoading } = useGetBookingQr(bookingId);

  if (bookingLoading || qrLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!booking || !qrData) return <div className="p-8 text-center text-destructive flex flex-col items-center"><AlertCircle className="w-12 h-12 mb-4 opacity-50" />Ticket not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto py-10 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <Button asChild variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/bookings">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Bookings
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md overflow-hidden rounded-3xl border-border/50 shadow-2xl relative">
        {/* Ticket Header */}
        <div className="bg-primary p-6 text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
          
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 mb-3 backdrop-blur-sm shadow-none">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
          </Badge>
          <h2 className="text-2xl font-display font-bold tracking-tight mb-1">{booking.lotName}</h2>
          <p className="text-primary-foreground/80 text-sm">Parking Pass</p>
        </div>

        {/* The perforated ticket line effect */}
        <div className="relative h-6 bg-background flex items-center justify-between px-[-10px] z-10">
          <div className="w-6 h-6 rounded-full bg-background border-r border-border/50 absolute -left-3 shadow-inner"></div>
          <div className="w-full border-t-[3px] border-dashed border-border/60 mx-4"></div>
          <div className="w-6 h-6 rounded-full bg-background border-l border-border/50 absolute -right-3 shadow-inner"></div>
        </div>

        <div className="p-8 bg-card flex flex-col items-center">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 relative group">
            <QRCodeSVG 
              value={qrData.qrData} 
              size={200}
              level={"H"}
              includeMargin={false}
            />
            {/* Scanner corners design */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-primary rounded-tl-md"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-primary rounded-tr-md"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-primary rounded-bl-md"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-primary rounded-br-md"></div>
          </div>
          
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-[250px]">
            Scan this QR code at the entrance terminal to access the parking lot.
          </p>

          <Separator className="w-full mb-6 border-border/60" />

          {/* Details Grid */}
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground"><MapPin className="w-4 h-4 mr-2" /> Slot No.</div>
              <div className="font-display font-bold text-xl bg-muted/50 px-3 py-1 rounded-lg">{booking.slotNumber}</div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground"><Car className="w-4 h-4 mr-2" /> Vehicle</div>
              <div className="font-semibold uppercase">{booking.vehicleNumber}</div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground"><Calendar className="w-4 h-4 mr-2" /> Date</div>
              <div className="font-medium">{format(new Date(booking.startTime), "MMM d, yyyy")}</div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center text-muted-foreground"><Clock className="w-4 h-4 mr-2" /> Time</div>
              <div className="font-medium text-right">
                {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-4 text-center text-xs text-muted-foreground border-t border-border/50">
          Booking ID: #{booking.id.toString().padStart(6, '0')}
        </div>
      </Card>

      <Button variant="outline" className="mt-8 rounded-full px-6 shadow-sm bg-background">
        <Download className="w-4 h-4 mr-2" /> Save to Device
      </Button>
    </div>
  );
}
