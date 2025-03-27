"use server";

import { auth } from "@clerk/nextjs/server";
import AllEquipmentTable from "@components/equipment/AllEquipmentTable";
import {
    inventoryRepository,
    shopItemRepository,
} from "@lib/data/repositories";
import { Inventory, Ticket } from "@lib/data/entities";
import PageSection from "@components/general/PageSection";
import { notFound } from "next/navigation";

export type AllEquipmentProps = {
    userId: string;
    items: Inventory[];
    issues?: Ticket[];
};

export default async function AllEquipmentPage() {
    const { userId, orgId, has } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    if (!has({ permission: "org:requests:view_all" })) {
        notFound();
    }

    const inventories = await inventoryRepository.getAllInventories();
    const shopItems =
        await shopItemRepository.getAllShopItemsInOrganization(orgId);

    return (
        <PageSection title={"All Equipment"} contentLength={inventories.length}>
            <AllEquipmentTable
                inventories={inventories}
                shopItems={shopItems}
            />
        </PageSection>
    );
}
