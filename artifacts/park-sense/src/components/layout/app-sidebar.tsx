import { Link, useLocation } from "wouter";
import { 
  Car, 
  LayoutDashboard, 
  MapPin, 
  CreditCard, 
  History, 
  Star, 
  Settings, 
  LogOut,
  User,
  Menu,
  Ticket
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { setOpenMobile } = useSidebar();

  const closeMobile = () => setOpenMobile(false);

  const mainNav = [
    { title: "Find Parking", url: "/find", icon: MapPin },
  ];

  const userNav = [
    { title: "My Bookings", url: "/bookings", icon: Ticket },
    { title: "Payment History", url: "/payments", icon: History },
    { title: "My Reviews", url: "/reviews", icon: Star },
    { title: "Profile", url: "/profile", icon: User },
  ];

  const adminNav = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Manage Lots", url: "/admin/lots", icon: Car },
    { title: "All Bookings", url: "/admin/bookings", icon: History },
  ];

  return (
    <Sidebar variant="sidebar" className="border-r-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4 flex flex-row items-center space-x-3 border-b border-sidebar-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Car className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="font-display font-bold text-xl tracking-tight">
          Park<span className="text-primary">Sense</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wider">Explore</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url || location.startsWith(`${item.url}/`)}
                    onClick={closeMobile}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAuthenticated && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wider">My Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.url || location.startsWith(`${item.url}/`)}
                      onClick={closeMobile}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-colors"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-semibold uppercase tracking-wider">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.url || location.startsWith(`${item.url}/`)}
                      onClick={closeMobile}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-colors"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        {isAuthenticated ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 ml-2 shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0">
            <Link href="/login" onClick={closeMobile}>Sign In</Link>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
