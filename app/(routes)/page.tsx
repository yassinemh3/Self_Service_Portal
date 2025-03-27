"use server";

import { AppSidebar } from "@components/sidebar/AppSidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@components/ui/Breadcrumb";
import { Separator } from "@components/ui/Separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@components/ui/Sidebar";
import SupportDashboard from "@components/dashboard/SupportDashboard";
import { auth } from "@clerk/nextjs/server";
import ManagerDashboard from "@components/dashboard/ManagerDashboard";
import MemberDashboard from "@components/dashboard/MemberDashboard";

export default async function Home() {
    const { userId, orgId, has } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    const isAdmin = has({ role: "org:admin" });
    const isManager = has({ role: "org:manager" });
    const isSupport = has({ role: "org:it_support" });
    const isMember = has({ role: "org:member" });

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className={"flex h-screen"}>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbPage>Home</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                {isAdmin ? (
                    <SupportDashboard />
                ) : isManager ? (
                    <ManagerDashboard />
                ) : isSupport ? (
                    <SupportDashboard />
                ) : isMember ? (
                    <MemberDashboard />
                ) : (
                    <></>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
