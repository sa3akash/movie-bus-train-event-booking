"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const pathLabels: Record<string, string> = {
  admin: "Dashboard",
  movies: "Movies",
  cineplex: "Cineplex Brands",
  theaters: "Multiplex Branches",
  halls: "Halls",
  "seat-map": "Seat Designer",
  add: "Add",
  edit: "Edit",
};

const humanize = (segment: string) => {
  const decoded = decodeURIComponent(segment);
  if (pathLabels[decoded.toLowerCase()]) {
    return pathLabels[decoded.toLowerCase()];
  }
  // Check if it's a long database ID (like CUID or UUID)
  if (decoded.length > 20) {
    return "Details";
  }
  // Humanize standard slug words
  return decoded
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AdminBreadcrumb = () => {
  const pathname = usePathname();
  
  if (!pathname) return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Always render Home / Admin Dashboard link first */}
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          // Skip the first "admin" segment since we already rendered "Dashboard" as the base link
          if (segment.toLowerCase() === "admin") return null;

          const url = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;
          const label = humanize(segment);

          return (
            <React.Fragment key={url}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={url}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AdminBreadcrumb;
