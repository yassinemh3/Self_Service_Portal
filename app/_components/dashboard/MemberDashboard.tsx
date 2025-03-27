"use server";

import { auth } from "@clerk/nextjs/server";
import {
    inventoryRepository,
    itemInRequestRepository,
    requestRepository,
    shopItemRepository,
    ticketConversationRepository,
    ticketRepository,
} from "@lib/data/repositories";
import MyRecentSupportTickets from "@components/dashboard/MyRecentSupportTickets";
import { fetchUserData } from "@lib/utils";
import MyRecentEquipmentRequestStatus from "@components/dashboard/MyRecentEquipmentRequestStatus";
import MyEquipmentShort, {
    MyEquipmentShortProp,
} from "@components/dashboard/MyEquipmentShort";
import RecentTicketResponses, {
    RecentTicketResponsesProp,
} from "@components/dashboard/RecentTicketResponses";

export default async function MemberDashboard() {
    const { userId, orgId } = await auth();

    const myTickets = await ticketRepository.getTicketsByUserId(
        String(userId),
        String(orgId),
    );
    const myInventory = await inventoryRepository.getInventoryByOwnerId(
        String(userId),
    );
    const shopItems = await shopItemRepository.getAllShopItemsInOrganization(
        String(orgId),
    );
    const myEquipmentTableProps: MyEquipmentShortProp[] = [];
    myInventory.map((myItem) => {
        const item = shopItems.find((item) => item.id === myItem.itemId);
        const equipmentProp: MyEquipmentShortProp = {
            imageUrl: item?.url || "",
            name: item?.name || "",
            description: item?.description || "",
            purchaseDate: myItem.purchaseDate,
        };
        myEquipmentTableProps.push(equipmentProp);
    });

    const myRecentTicketResponsesProps: RecentTicketResponsesProp[] = [];
    for (const ticket of myTickets) {
        const responses =
            await ticketConversationRepository.getTicketConversationsByTicketId(
                ticket.id,
            );
        const sortedResponses = responses
            .filter((response) => response.creationDate)
            .sort(
                (a, b) =>
                    new Date(b.creationDate).getTime() -
                    new Date(a.creationDate).getTime(),
            );
        if (sortedResponses.length > 0) {
            const newestResponse = sortedResponses[0];
            myRecentTicketResponsesProps.push({
                ticketId: ticket.id,
                title: ticket.title,
                status: ticket.status,
                updateDate: newestResponse.creationDate,
                lastResponse: newestResponse,
            });
        }
    }

    const myRequests = await requestRepository.getAllRequestsByUserId(
        String(userId),
        String(orgId),
    );

    const requestsWithItems = [];
    for (let i = 0; i < Math.min(myRequests.length, 5); i++) {
        const request = myRequests[i];
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
            <div className="grid flex-grow gap-4 overflow-y-hidden xl:grid-cols-3">
                <RecentTicketResponses
                    ticketProp={myRecentTicketResponsesProps}
                />
                <MyRecentSupportTickets supportTickets={myTickets} />
                <MyRecentEquipmentRequestStatus
                    requestData={requestsWithItems}
                />
            </div>
            <MyEquipmentShort equipmentProps={myEquipmentTableProps} />
        </main>
    );
}
