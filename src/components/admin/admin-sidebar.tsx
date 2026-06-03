"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Ticket,
  Film,
  BusFront,
  TrainFront,
  Mic2,
  Users,
  CreditCard,
  Settings,
  ChevronRight,
  MonitorPlay,
} from "lucide-react";

interface SubSubNavItem {
  title: string;
  url: string;
}

interface SubNavItem {
  title: string;
  url: string;
  items?: SubSubNavItem[];
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  items?: SubNavItem[];
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Ads Manage", url: "/admin/ads", icon: MonitorPlay },
  { title: "Transactions", url: "/admin/transactions", icon: CreditCard },
  { title: "Users", url: "/admin/users", icon: Users },
];

const eventTypes: NavItem[] = [
  {
    title: "Movies Manage",
    url: "/admin/movies",
    icon: Film,
    items: [
      {
        title: "Movies",
        url: "/admin/movies",
        items: [
          { title: "Movie List", url: "/admin/movies" },
          { title: "Add Movie", url: "/admin/movies/add" },
          { title: "Genres", url: "/admin/movies/genres" },
          { title: "Reviews", url: "/admin/movies/reviews" },
          { title: "Analytics", url: "/admin/movies/analytics" },
        ],
      },
      {
        title: "Shows",
        url: "/admin/movies/shows",
        items: [
          { title: "Show List", url: "/admin/movies/shows" },
          { title: "Add Show", url: "/admin/movies/shows/add" },
          { title: "Schedules", url: "/admin/movies/shows/schedules" },
          { title: "Seat Config", url: "/admin/movies/shows/seats" },
          { title: "Pricing Rules", url: "/admin/movies/shows/pricing" },
        ],
      },
      {
        title: "Cineplex",
        url: "/admin/movies/cineplex",
        items: [
          { title: "Cineplex List", url: "/admin/movies/cineplex" },
          { title: "Add Cineplex", url: "/admin/movies/cineplex/add" },
          { title: "Halls & Screens", url: "/admin/movies/cineplex/halls" },
          { title: "Seat Map", url: "/admin/movies/cineplex/seat-map" },
          { title: "Locations", url: "/admin/movies/cineplex/locations" },
        ],
      },
      {
        title: "Theaters",
        url: "/admin/movies/theaters",
        items: [
          { title: "Theater List", url: "/admin/movies/theaters" },
          { title: "Add Theater", url: "/admin/movies/theaters/add" },
          { title: "Theater Halls", url: "/admin/movies/theaters/halls" },
          { title: "Seat Types", url: "/admin/movies/theaters/seat-types" },
          { title: "Theater Seat Map", url: "/admin/movies/theaters/seat-map" },
          { title: "Theater Locations", url: "/admin/movies/theaters/locations" },
        ],
      },
    ],
  },
  {
    title: "Buses Manage",
    url: "/admin/buses",
    icon: BusFront,
    items: [
      {
        title: "Buses",
        url: "/admin/buses",
        items: [
          { title: "Bus List", url: "/admin/buses" },
          { title: "Add Bus", url: "/admin/buses/add" },
          { title: "Brands", url: "/admin/buses/brands" },
          { title: "Bus Types", url: "/admin/buses/types" },
          { title: "Analytics", url: "/admin/buses/analytics" },
        ],
      },
      {
        title: "Shows & Trips",
        url: "/admin/buses/shows",
        items: [
          { title: "Trip List", url: "/admin/buses/shows" },
          { title: "Add Trip", url: "/admin/buses/shows/add" },
          { title: "Schedules", url: "/admin/buses/shows/schedules" },
          { title: "Routes", url: "/admin/buses/shows/routes" },
          { title: "Pricing", url: "/admin/buses/shows/pricing" },
        ],
      },
      {
        title: "Counter",
        url: "/admin/buses/counters",
        items: [
          { title: "Counter List", url: "/admin/buses/counters" },
          { title: "Add Counter", url: "/admin/buses/counters/add" },
          { title: "Locations", url: "/admin/buses/counters/locations" },
          { title: "Agents", url: "/admin/buses/counters/agents" },
          { title: "Staff", url: "/admin/buses/counters/staff" },
        ],
      },
    ],
  },
  {
    title: "Trains Manage",
    url: "/admin/trains",
    icon: TrainFront,
    items: [
      {
        title: "Trains",
        url: "/admin/trains",
        items: [
          { title: "Train List", url: "/admin/trains" },
          { title: "Add Train", url: "/admin/trains/add" },
          { title: "Compartments", url: "/admin/trains/compartments" },
          { title: "Classes", url: "/admin/trains/classes" },
          { title: "Analytics", url: "/admin/trains/analytics" },
        ],
      },
      {
        title: "Shows & Schedules",
        url: "/admin/trains/shows",
        items: [
          { title: "Schedule List", url: "/admin/trains/shows" },
          { title: "Add Schedule", url: "/admin/trains/shows/add" },
          { title: "Routes", url: "/admin/trains/shows/routes" },
          { title: "Fares", url: "/admin/trains/shows/fares" },
          { title: "Seat Inventory", url: "/admin/trains/shows/seats" },
        ],
      },
      {
        title: "Station",
        url: "/admin/trains/stations",
        items: [
          { title: "Station List", url: "/admin/trains/stations" },
          { title: "Add Station", url: "/admin/trains/stations/add" },
          { title: "Platforms", url: "/admin/trains/stations/platforms" },
          { title: "Locations", url: "/admin/trains/stations/locations" },
          { title: "Contacts", url: "/admin/trains/stations/contacts" },
        ],
      },
    ],
  },
  {
    title: "Concerts Manage",
    url: "/admin/concerts",
    icon: Mic2,
    items: [
      {
        title: "Concerts",
        url: "/admin/concerts",
        items: [
          { title: "Concert List", url: "/admin/concerts" },
          { title: "Add Concert", url: "/admin/concerts/add" },
          { title: "Artists", url: "/admin/concerts/artists" },
          { title: "Sponsors", url: "/admin/concerts/sponsors" },
          { title: "Analytics", url: "/admin/concerts/analytics" },
        ],
      },
      {
        title: "Shows & Events",
        url: "/admin/concerts/shows",
        items: [
          { title: "Event List", url: "/admin/concerts/shows" },
          { title: "Add Event", url: "/admin/concerts/shows/add" },
          { title: "Performances", url: "/admin/concerts/shows/performances" },
          { title: "Ticket Tiers", url: "/admin/concerts/shows/tiers" },
          { title: "Pricing", url: "/admin/concerts/shows/pricing" },
        ],
      },
      {
        title: "Venue",
        url: "/admin/concerts/venues",
        items: [
          { title: "Venue List", url: "/admin/concerts/venues" },
          { title: "Add Venue", url: "/admin/concerts/venues/add" },
          { title: "Seating Layout", url: "/admin/concerts/venues/seating" },
          { title: "Maps & Zones", url: "/admin/concerts/venues/maps" },
          { title: "Contacts", url: "/admin/concerts/venues/contacts" },
        ],
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  // 1. Gather all sidebar URLs
  const allUrls: string[] = [];
  mainNavItems.forEach((item) => {
    allUrls.push(item.url);
  });
  eventTypes.forEach((item) => {
    allUrls.push(item.url);
    item.items?.forEach((sub) => {
      allUrls.push(sub.url);
      sub.items?.forEach((subSub) => {
        allUrls.push(subSub.url);
      });
    });
  });
  allUrls.push("/admin/settings");

  // 2. Find the best match for the current pathname (longest matching prefix)
  let bestMatchUrl = "";
  allUrls.forEach((url) => {
    if (pathname === url || pathname.startsWith(url + "/")) {
      if (url.length > bestMatchUrl.length) {
        bestMatchUrl = url;
      }
    }
  });

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-bold text-xl px-4 py-2"
        >
          <Ticket className="w-6 h-6 text-primary" />
          <span>TicketAdmin</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={item.url === bestMatchUrl}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage Events</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {eventTypes.map((item) => {
                const hasSubItems = item.items && item.items.length > 0;
                const isGroupActive =
                  item.url === bestMatchUrl ||
                  item.items?.some(
                    (sub) =>
                      sub.url === bestMatchUrl ||
                      sub.items?.some((subSub) => subSub.url === bestMatchUrl),
                  ) ||
                  false;

                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        isActive={item.url === bestMatchUrl}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={isGroupActive}
                    className="group/collapsible"
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          isActive={isGroupActive}
                          tooltip={item.title}
                        />
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const hasSubSubItems =
                            subItem.items && subItem.items.length > 0;
                          const isSubActive =
                            subItem.url === bestMatchUrl ||
                            subItem.items?.some(
                              (subSub) => subSub.url === bestMatchUrl,
                            ) ||
                            false;

                          if (!hasSubSubItems) {
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  isActive={subItem.url === bestMatchUrl}
                                  render={<Link href={subItem.url} />}
                                >
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          }

                          return (
                            <Collapsible
                              key={subItem.title}
                              defaultOpen={isSubActive}
                              className="group/sub-collapsible"
                              render={<SidebarMenuSubItem />}
                            >
                              <CollapsibleTrigger
                                render={
                                  <SidebarMenuSubButton
                                    isActive={isSubActive}
                                    className="flex items-center w-full justify-between pr-2 cursor-pointer"
                                  />
                                }
                              >
                                <span>{subItem.title}</span>
                                <ChevronRight className="ml-auto w-3.5 h-3.5 transition-transform duration-200 group-data-open/sub-collapsible:rotate-90 text-muted-foreground/75" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <ul className="pl-3.5 ml-2.5 mt-1 border-l border-sidebar-border/50 flex flex-col gap-0.5">
                                  {subItem.items?.map((subSubItem) => (
                                    <li key={subSubItem.title}>
                                      <SidebarMenuSubButton
                                        isActive={subSubItem.url === bestMatchUrl}
                                        render={<Link href={subSubItem.url} />}
                                        className="h-7 text-xs font-normal"
                                      >
                                        <span>{subSubItem.title}</span>
                                      </SidebarMenuSubButton>
                                    </li>
                                  ))}
                                </ul>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={bestMatchUrl === "/admin/settings"}>
              <Link href="/admin/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
