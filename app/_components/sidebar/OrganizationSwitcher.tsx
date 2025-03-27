"use client";

import { ChevronsUpDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@components/ui/Sidebar";
import { useOrganizationList, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";

export function OrganizationSwitcher() {
    const { isMobile } = useSidebar();

    const { isLoaded, setActive, userMemberships } = useOrganizationList({
        userMemberships: true,
    });

    type Organization = {
        name: string;
        logoUrl: string;
        id: string;
        role: string;
    };

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [activeOrganization, setActiveOrganization] = useState<
        Organization | null | undefined
    >(null);

    const { orgId } = useAuth();
    // Clerk beschuldet, Thomas sagt es sei ok
    useEffect(() => {
        if (!isLoaded) return;
        const fetchedTeams: Organization[] = userMemberships.data?.map(
            (membership) => ({
                name: membership.organization.name || "No name",
                logoUrl:
                    membership.organization.imageUrl || "/avatars/shadcn.jpg",
                id: membership.organization.id || "no-id",
                role: membership.role.replace("org:", "") || "no role",
            }),
        );
        setOrganizations(fetchedTeams);
        const activeTeam = fetchedTeams.find((team) => team.id === orgId);
        setActiveOrganization(activeTeam);
    }, [isLoaded, userMemberships.data, orgId]);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                {activeOrganization && (
                                    <Image
                                        src={activeOrganization.logoUrl}
                                        alt={activeOrganization.name + " logo"}
                                        className="size-4"
                                        width={16}
                                        height={16}
                                    />
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {activeOrganization?.name}
                                </span>
                                <span className="truncate text-xs">
                                    {activeOrganization?.role}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Organizations
                        </DropdownMenuLabel>
                        {organizations?.map((team, index) => (
                            <DropdownMenuItem
                                key={team.name}
                                onClick={() => {
                                    setActiveOrganization(team);
                                    if (setActive) {
                                        setActive({ organization: team.id });
                                    }
                                }}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <Image
                                        src={team.logoUrl}
                                        alt={team.name + " logo"}
                                        className="size-4 shrink-0"
                                        width={16}
                                        height={16}
                                    />
                                </div>
                                {team.name}
                                <DropdownMenuShortcut>
                                    ⌘{index + 1}
                                </DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
