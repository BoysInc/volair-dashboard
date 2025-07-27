"use client";
import {
  Plane,
  Calendar,
  BookOpen,
  BarChart3,
  Settings,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Menu items for the operator dashboard
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    description: "Overview & analytics",
  },
  {
    title: "Aircraft Fleet",
    url: "/aircraft",
    icon: Plane,
    description: "Manage aircraft",
  },
  {
    title: "Flight Schedule",
    url: "/flights",
    icon: Calendar,
    description: "Flight operations",
  },
  // {
  //   title: "Bookings",
  //   url: "/bookings",
  //   icon: BookOpen,
  //   description: "Passenger bookings",
  // },
  {
    title: "Airports",
    url: "/airports",
    icon: MapPin,
    description: "Airport network",
  },
  // {
  //   title: "Revenue",
  //   url: "/revenue",
  //   icon: CreditCard,
  //   description: "Financial insights",
  // },
  // {
  //   title: "Settings",
  //   url: "#/settings",
  //   icon: Settings,
  //   description: "System configuration",
  // },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-100 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-slate-50 transition-colors"
            >
              <a href="#" className="group">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                  <Plane className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-slate-900">
                    Volair Aviation
                  </span>
                  <span className="truncate text-xs text-slate-500 font-medium">
                    Operator Portal
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    asChild
                    className="group h-12 hover:bg-primary/10 hover:text-slate-900 transition-all duration-200 rounded-lg mx-1"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-3"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                        <item.icon className="size-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm text-slate-700 group-hover:text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 group-hover:text-slate-600">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 bg-gradient-to-br from-white to-slate-50/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-14 hover:bg-slate-50 data-[state=open]:bg-slate-50 data-[state=open]:text-slate-900 transition-colors rounded-lg"
                >
                  <Avatar className="h-10 w-10 rounded-xl ring-2 ring-slate-200">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="Operator"
                    />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-900">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {user?.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border border-slate-200 bg-white shadow-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="gap-3 h-10 rounded-lg hover:bg-slate-50 transition-colors">
                  <User className="size-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 h-10 rounded-lg hover:bg-slate-50 transition-colors">
                  <Settings className="size-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={signOut}
                  className="gap-3 h-10 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-red-600"
                >
                  <span className="font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
