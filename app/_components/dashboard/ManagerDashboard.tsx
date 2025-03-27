"use server";

import { auth } from "@clerk/nextjs/server";
import {
    itemInRequestRepository,
    requestRepository,
    ticketRepository,
} from "@lib/data/repositories";
import MyRecentSupportTickets from "@components/dashboard/MyRecentSupportTickets";
import RecentEquipmentRequests from "@components/dashboard/RecentEquipmentRequests";
import { fetchUserData } from "@lib/utils";
import RequestsStatusChart from "@components/dashboard/RequestsStatusChart";
import {
    getRequestAmountChartData,
    getRequestsStatusChartData,
} from "@lib/data/useCases/getManagerDashboardChartData";
import RequestAmountChart from "@components/dashboard/RequestAmountChart";

export default async function ManagerDashboard() {
    const { userId, orgId } = await auth();
    const requestsStatusChartData = await getRequestsStatusChartData(
        String(orgId),
    );
    const requestAmountChartData = await getRequestAmountChartData(
        String(orgId),
    );

    const myTickets = await ticketRepository.getTicketsByUserId(
        String(userId),
        String(orgId),
    );

    const requests = await requestRepository.getAllRequestsInOrganization(
        String(orgId),
    );

    const requestsWithItems = [];
    for (let i = 0; i < Math.min(requests.length, 5); i++) {
        const request = requests[i];
        const userData = await fetchUserData(request.userId);
        const userFullName =
            userData?.first_name + " " + userData?.last_name || "Unknown";
        const items = await itemInRequestRepository.getItemsInRequestList(
            request.id,
        );
        requestsWithItems.push({ request, items, userFullName });
    }

    return (
        <main className="m-4 grid gap-4 xl:h-full xl:grid-rows-2 xl:overflow-y-hidden">
            <div
                className={
                    "grid flex-grow gap-4 overflow-y-hidden xl:grid-cols-3"
                }
            >
                <RequestsStatusChart chartData={requestsStatusChartData} />
                <RecentEquipmentRequests
                    equipmentRequestsWithItems={requestsWithItems}
                />
                <MyRecentSupportTickets supportTickets={myTickets} />
            </div>
            <RequestAmountChart chartData={requestAmountChartData} />
        </main>
    );
}
