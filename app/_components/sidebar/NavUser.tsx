"use client";

import { ChevronsUpDown, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@components/ui/Sidebar";
import { useClerk, useUser } from "@clerk/nextjs";
import { Switch } from "@components/ui/Switch";
import { useTheme } from "next-themes";

export function NavUser() {
    const { isMobile } = useSidebar();
    const { signOut, openUserProfile } = useClerk();
    const { isLoaded, user } = useUser();
    const { setTheme, resolvedTheme } = useTheme();

    const switchDark = resolvedTheme === "dark" ? "system" : "dark";
    const switchLight = resolvedTheme === "light" ? "system" : "light";

    if (!isLoaded) return null;
    if (!user?.id) return null;

    const currentUser = {
        name: user.fullName || "Unknown User",
        email: user.primaryEmailAddress?.emailAddress || "No Email",
        imageUrl: user.imageUrl || "",
        initials:
            user.fullName
                ?.split(" ")
                .map((n) => n[0].toUpperCase())
                .join("") || "U",
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={currentUser.imageUrl}
                                    alt={currentUser.email}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {currentUser.initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {currentUser.name}
                                </span>
                                <span className="truncate text-xs">
                                    {currentUser.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={currentUser.imageUrl}
                                        alt={currentUser.name}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {currentUser.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {currentUser.name}
                                    </span>
                                    <span className="truncate text-xs">
                                        {currentUser.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => openUserProfile()}>
                                <UserRound />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Sun />
                                <Switch
                                    defaultChecked={resolvedTheme === "dark"}
                                    onCheckedChange={(checked) =>
                                        setTheme(
                                            checked ? switchDark : switchLight,
                                        )
                                    }
                                />
                                <Moon />
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => signOut({ redirectUrl: "/" })}
                        >
                            <LogOut />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
