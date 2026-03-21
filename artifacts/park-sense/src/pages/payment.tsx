import { useState } from "react";
import { useParams, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Wallet, Landmark, Smartphone, ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
import { 
  useGetBooking, 
  useCreatePayment,
  CreatePaymentRequestPaymentMethod
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const paymentSchema = z.object({
  paymentMethod: z.enum(["credit_card", "debit_card", "upi", "wallet", "cash"] as const),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function Payment() {
  const params = useParams();
  const bookingId = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useGetBooking(bookingId);
  const paymentMutation = useCreatePayment();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "credit_card",
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    if (!booking) return;

    paymentMutation.mutate({
      data: {
        bookingId: booking.id,
        paymentMethod: data.paymentMethod,
        amount: booking.totalAmount,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Payment Successful!",
          description: "Your booking is confirmed. View your QR ticket.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        window.location.href = `/bookings/${booking.id}/qr`;
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: err.message || "An error occurred during payment processing.",
        });
      }
    });
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!booking) return <div className="p-8 text-center">Booking not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto py-12">
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/bookings">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Bookings
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-display font-bold mb-8">Secure Payment</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="text-lg font-semibold">Select Payment Method</div>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <label className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all ${field.value === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="credit_card" className="sr-only" />
                          <CreditCard className={`w-8 h-8 mb-3 ${field.value === 'credit_card' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-semibold">Credit Card</span>
                        </label>
                        
                        <label className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all ${field.value === 'debit_card' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="debit_card" className="sr-only" />
                          <Landmark className={`w-8 h-8 mb-3 ${field.value === 'debit_card' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-semibold">Debit Card</span>
                        </label>

                        <label className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all ${field.value === 'upi' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="upi" className="sr-only" />
                          <Smartphone className={`w-8 h-8 mb-3 ${field.value === 'upi' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-semibold">UPI</span>
                        </label>

                        <label className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all ${field.value === 'wallet' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                          <RadioGroupItem value="wallet" className="sr-only" />
                          <Wallet className={`w-8 h-8 mb-3 ${field.value === 'wallet' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-semibold">Digital Wallet</span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dummy Card Input Fields just for show if card is selected */}
              {(form.watch("paymentMethod") === "credit_card" || form.watch("paymentMethod") === "debit_card") && (
                <div className="space-y-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text" placeholder="0000 0000 0000 0000" className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 pl-10 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CVC</label>
                      <input type="text" placeholder="123" className="flex h-12 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={paymentMutation.isPending}
              >
                {paymentMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Pay {formatPrice(booking.totalAmount)} Securely
              </Button>

              <div className="flex items-center justify-center text-sm text-muted-foreground mt-4">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" />
                Payments are 100% secure and encrypted
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-6 border-border/50 shadow-xl overflow-hidden rounded-3xl">
            <div className="h-2 w-full bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="text-lg font-display">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground font-medium">Location</div>
                <div className="font-semibold text-foreground">{booking.lotName}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground font-medium">Slot Number</div>
                <div className="font-bold text-lg font-display bg-muted/50 px-3 py-1 rounded-md inline-block">{booking.slotNumber}</div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Parking Fee</span>
                <span className="font-medium">{formatPrice(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxes & Fees</span>
                <span className="font-medium">₹0.00</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-end pt-2">
                <span className="text-base font-bold">Total to Pay</span>
                <span className="text-2xl font-bold text-primary font-display">{formatPrice(booking.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
