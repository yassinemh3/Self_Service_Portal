"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Headset, NotepadText, Shield } from "lucide-react";

import { NavMain } from "@components/sidebar/NavMain";
import { NavUser } from "@components/sidebar/NavUser";
import { OrganizationSwitcher } from "@components/sidebar/OrganizationSwitcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@components/ui/Sidebar";
import { NavHome } from "@components/sidebar/NavHome";
import { useAuth } from "@clerk/nextjs";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();
    const currentSection = pathname.split("/")[1] || "";
    const { has, isLoaded } = useAuth();

    if (!isLoaded) return false;

    const data = {
        navMain: [
            {
                title: "Support",
                url: "#",
                icon: Headset,
                isActive: currentSection.toLowerCase() === "support",
                items: [
                    // USER + MANAGER + ADMIN
                    ...(has({ permission: "org:tickets:submit" })
                        ? [
                              {
                                  title: "Submit Ticket",
                                  url: "/support/submit-ticket",
                              },
                          ]
                        : []),
                    // USER + MANAGER + ADMIN
                    ...(has({ permission: "org:tickets:view" })
                        ? [
                              {
                                  title: "My Tickets",
                                  url: "/support/my-tickets",
                              },
                          ]
                        : []),
                    // SUPPORT + ADMIN
                    ...(has({ permission: "org:tickets:view_all" })
                        ? [
                              {
                                  title: "All Tickets",
                                  url: "/support/all-tickets",
                              },
                          ]
                        : []),
                ],
            },
            {
                title: "Equipment",
                url: "#",
                icon: NotepadText,
                isActive: currentSection.toLowerCase() === "equipment",
                items: [
                    // USER + SUPPORT + ADMIN + MANAGER
                    {
                        title: "Shop",
                        url: "/equipment/shop",
                    },
                    // USER + MANAGER + SUPPORT + ADMIN
                    {
                        title: "My Equipment",
                        url: "/equipment/my-equipment",
                    },
                    // MANAGER + ADMIN
                    ...(has({ permission: "org:requests:view_all" })
                        ? [
                              {
                                  title: "All Equipment",
                                  url: "/equipment/all-equipment",
                              },
                          ]
                        : []),
                    // USER + SUPPORT + ADMIN
                    ...(!has({ role: "org:manager" })
                        ? [
                              {
                                  title: "My Requests",
                                  url: "/equipment/my-requests",
                              },
                          ]
                        : []),
                    // MANAGER + ADMIN
                    ...(has({ permission: "org:requests:view_all" })
                        ? [
                              {
                                  title: "All Requests",
                                  url: "/equipment/all-requests",
                              },
                          ]
                        : []),
                ],
            },
        ],
    };

    if (has({ role: "org:admin" })) {
        data.navMain.push({
            title: "Admin",
            url: "#",
            icon: Shield,
            isActive: currentSection.toLowerCase() === "admin",
            items: [
                {
                    title: "Equipment",
                    url: "/admin/equipment",
                },
                {
                    title: "Add Equipment",
                    url: "/admin/equipment/add",
                },
                {
                    title: "Categories",
                    url: "/admin/categories",
                },
                {
                    title: "Add Category",
                    url: "/admin/categories/add",
                },
            ],
        });
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <OrganizationSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavHome />
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
