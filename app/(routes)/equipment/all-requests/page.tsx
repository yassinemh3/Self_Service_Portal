"use server";

import { auth } from "@clerk/nextjs/server";
import {
    itemInRequestRepository,
    requestRepository,
} from "@lib/data/repositories";
import AllRequestsTable, {
    AllRequestsTableProp,
} from "@components/equipment/requests/AllRequestsTable";
import { fetchUserData } from "@lib/utils";
import PageSection from "@components/general/PageSection";
import { notFound } from "next/navigation";

export default async function AllRequestsPage() {
    const { userId, orgId, has } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    if (
        !(
            has({ permission: "org:requests:view_all" }) &&
            has({ permission: "org:requests:manage_all" })
        )
    ) {
        notFound();
    }

    const requests =
        await requestRepository.getAllRequestsInOrganization(orgId);
    const itemsInRequests =
        await itemInRequestRepository.getAllRequestsForOrganization(orgId);

    const allRequestsTableProps: AllRequestsTableProp[] = await Promise.all(
        requests.map(async (request) => {
            const userData = await fetchUserData(request.userId);
            const items = itemsInRequests.filter(
                (item) => item.requestId === request.id,
            );
            return {
                requestId: request.id,
                userImageUrl: userData?.image_url || "",
                userFullName:
                    userData?.first_name + " " + userData?.last_name ||
                    "Unknown",
                creationDate: request.creationDate,
                updateDate: request.updateDate,
                status: request.status,
                requestedItemsAmount: items.length,
                acceptedItemsAmount: items.filter(
                    (item) => item.status === "Accepted",
                ).length,
                declinedItemsAmount: items.filter(
                    (item) => item.status === "Declined",
                ).length,
            };
        }),
    );

    return (
        <PageSection title={"All Requests"} contentLength={requests.length}>
            <AllRequestsTable requestProps={allRequestsTableProps} />
        </PageSection>
    );
}
