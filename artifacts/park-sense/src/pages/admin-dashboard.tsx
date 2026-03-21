import { BarChart3, TrendingUp, Users, Car, Ticket, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useGetAdminStats, useListAllBookings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: bookingsData, isLoading: bookingsLoading } = useListAllBookings({ limit: 5 });

  if (statsLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!stats) return null;

  const StatCard = ({ title, value, icon: Icon, trend, colorClass }: any) => (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-display font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">{trend}</span> from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of the ParkSense system performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatPrice(stats.totalRevenue)} 
          icon={BarChart3} 
          trend="+12%" 
          colorClass="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard 
          title="Active Bookings" 
          value={stats.activeBookings} 
          icon={Ticket} 
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard 
          title="Total Parking Lots" 
          value={stats.totalLots} 
          icon={Car} 
          colorClass="bg-amber-500/10 text-amber-600"
        />
        <StatCard 
          title="Registered Users" 
          value={stats.totalUsers} 
          icon={Users} 
          trend="+5%" 
          colorClass="bg-purple-500/10 text-purple-600"
        />
      </div>

      {/* Capacity Utilization Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Lot Name</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingsData?.bookings.map((booking) => (
                      <TableRow key={booking.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-xs text-muted-foreground">#{booking.id}</TableCell>
                        <TableCell className="font-semibold">{booking.lotName}</TableCell>
                        <TableCell>{booking.slotNumber}</TableCell>
                        <TableCell className="text-sm">{format(new Date(booking.startTime), "MMM d, h:mm a")}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            booking.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            'bg-slate-100 text-slate-800 border-slate-200'
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(booking.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>System Capacity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            <div className="relative w-48 h-48 rounded-full border-[16px] border-muted flex items-center justify-center">
              {/* Fake Donut Chart SVG approach */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="42" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="16" 
                  className="text-primary"
                  strokeDasharray={`${((stats.totalSlots - stats.availableSlots) / stats.totalSlots) * 264} 264`}
                />
              </svg>
              <div className="text-center">
                <div className="text-4xl font-display font-bold">
                  {Math.round(((stats.totalSlots - stats.availableSlots) / stats.totalSlots) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground font-medium">Occupied</div>
              </div>
            </div>
            
            <div className="w-full mt-10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-primary mr-2"></div>Occupied</div>
                <span className="font-bold">{stats.totalSlots - stats.availableSlots}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-muted mr-2"></div>Available</div>
                <span className="font-bold">{stats.availableSlots}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border pt-2">
                <div className="text-muted-foreground">Total Slots</div>
                <span className="font-bold">{stats.totalSlots}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
