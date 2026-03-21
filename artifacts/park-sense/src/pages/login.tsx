import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);

  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuthContext(res.token, res.user);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        setLocation("/find");
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: error.message || "Please check your credentials and try again.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
            alt="Parking structure" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-md p-12 text-white">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-6 leading-tight">Welcome to ParkSense</h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            The smartest way to find, book, and manage your parking spaces across the city.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <Button variant="ghost" asChild className="absolute top-8 right-8 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl">ParkSense</span>
            </div>
          </div>

          <h2 className="text-3xl font-display font-bold mb-2">
            {isRegistering ? "Create an account" : "Sign in to your account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isRegistering 
              ? "Enter your details below to create your account" 
              : "Enter your email and password to access your bookings"}
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {isRegistering && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="h-12 bg-muted/50 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" type="email" className="h-12 bg-muted/50 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      {!isRegistering && (
                        <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
                      )}
                    </div>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" className="h-12 bg-muted/50 rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                {isRegistering ? "Create Account" : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                form.reset();
              }} 
              className="ml-2 font-medium text-primary hover:underline focus:outline-none"
            >
              {isRegistering ? "Sign in" : "Create one now"}
            </button>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-xl text-sm border border-border">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>User: <code className="bg-background px-1 py-0.5 rounded">user@parksense.com</code> / <code className="bg-background px-1 py-0.5 rounded">password</code></li>
              <li>Admin: <code className="bg-background px-1 py-0.5 rounded">admin@parksense.com</code> / <code className="bg-background px-1 py-0.5 rounded">password</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
