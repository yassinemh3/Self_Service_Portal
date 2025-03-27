"use server";

import TicketStatusChart from "@components/dashboard/TicketStatusChart";
import TicketAmountChart from "@components/dashboard/TicketAmountChart";
import { auth } from "@clerk/nextjs/server";
import {
    getTicketAmountChartData,
    getTicketStatusChartData,
} from "@lib/data/useCases/getSupportDashboardChartData";
import {
    itemInRequestRepository,
    requestRepository,
    ticketRepository,
} from "@lib/data/repositories";
import MyRecentEquipmentRequestStatus from "@components/dashboard/MyRecentEquipmentRequestStatus";
import RecentSupportTickets from "@components/dashboard/RecentSupportTickets";

export default async function SupportDashboard() {
    const { userId, orgId } = await auth();
    const ticketStatusChartData = await getTicketStatusChartData(String(orgId));
    const ticketAmountChartData = await getTicketAmountChartData(String(orgId));

    const myRequests = await requestRepository.getAllRequestsByUserId(
        String(userId),
        String(orgId),
    );

    const tickets = await ticketRepository.getTicketsByOrganizationId(
        String(orgId),
    );

    const requestsWithItems = [];
    for (let i = 0; i < Math.min(myRequests.length, 5); i++) {
        const request = myRequests[i];
        const items = await itemInRequestRepository.getItemsInRequestList(
            request.id,
        );
        requestsWithItems.push({ request, items });
    }

    return (
        <main className="m-4 grid gap-4 xl:h-full xl:grid-rows-2 xl:overflow-y-hidden">
            <div className="grid flex-grow gap-4 overflow-y-hidden xl:grid-cols-3">
                <TicketStatusChart chartData={ticketStatusChartData} />
                <RecentSupportTickets supportTickets={tickets} />
                <MyRecentEquipmentRequestStatus
                    requestData={requestsWithItems}
                />
            </div>
            <TicketAmountChart chartData={ticketAmountChartData} />
        </main>
    );
}
