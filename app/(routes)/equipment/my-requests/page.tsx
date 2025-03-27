"use server";

import { auth } from "@clerk/nextjs/server";
import {
    itemInRequestRepository,
    requestRepository,
} from "@lib/data/repositories";
import MyRequestsTable, {
    MyRequestsTableProps,
} from "@components/equipment/my-requests/MyRequestsTable";
import PageSection from "@components/general/PageSection";

export default async function MyRequestsPage() {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    const myRequests = await requestRepository.getAllRequestsByUserId(
        userId,
        orgId,
    );
    const requestsWithItems: MyRequestsTableProps[] = [];
    for (const request of myRequests) {
        const items = await itemInRequestRepository.getItemsInRequestList(
            request.id,
        );
        requestsWithItems.push({ request, items });
    }

    return (
        <PageSection title={"My Requests"} contentLength={myRequests.length}>
            <MyRequestsTable requests={requestsWithItems} />
        </PageSection>
    );
}
