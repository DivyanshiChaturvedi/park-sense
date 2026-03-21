import { Link } from "wouter";
import { MapPin, Search, ShieldCheck, Zap, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Navbar for Landing */}
      <header className="absolute top-0 w-full z-50 px-6 py-4 flex items-center justify-between">
        <div className="font-display font-bold text-2xl tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          Park<span className="text-primary">Sense</span>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-white hover:text-white hover:bg-white/10 hidden sm:flex">
            <Link href="/find">Find Parking</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Abstract tech background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground backdrop-blur-md mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Smart Parking Made Simple</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight mb-6 leading-tight"
          >
            Find, Book, and Park <br className="hidden md:block" />
            <span className="text-gradient">Without the Hassle</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12"
          >
            Real-time availability, secure payments, and instant QR tickets. Join thousands of drivers saving time every day.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-2xl bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by city or location..." 
                className="w-full pl-12 pr-4 h-14 bg-white/5 border-0 text-white placeholder:text-slate-400 text-lg rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50"
              />
            </div>
            <Button asChild size="lg" className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-lg shrink-0">
              <Link href="/find">Search Lots</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-background relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Choose ParkSense?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We've reimagined the parking experience from the ground up to save you time, money, and frustration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display">Real-Time Availability</h3>
              <p className="text-muted-foreground">No more circling the block. See exactly how many spots are open before you leave home.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display">Guaranteed Booking</h3>
              <p className="text-muted-foreground">Reserve your spot in advance. Your space is guaranteed and waiting for your arrival.</p>
            </div>

            <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-display">Instant Access</h3>
              <p className="text-muted-foreground">Get a digital QR ticket instantly on your phone. Scan and go, no paper tickets needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-display font-bold mb-6">Ready to upgrade your parking experience?</h2>
          <p className="text-xl text-slate-300 mb-10">Join thousands of smart drivers finding perfect spots every day.</p>
          <Button asChild size="lg" className="h-14 px-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-lg group">
            <Link href="/find">
              Find a Spot Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-center border-t border-white/10">
        <div className="font-display font-bold text-xl text-white mb-4">ParkSense</div>
        <p className="text-sm">© {new Date().getFullYear()} ParkSense Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
