"use server";

import { auth } from "@clerk/nextjs/server";
import MyEquipmentTable from "@components/equipment/MyEquipmentTable";
import {
    inventoryRepository,
    shopItemRepository,
} from "@lib/data/repositories";
import { MyEquipmentTableProp } from "@components/equipment/MyEquipmentTable";
import PageSection from "@components/general/PageSection";

export default async function MyEquipmentPage() {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    const myInventory = await inventoryRepository.getInventoryByOwnerId(userId);
    const shopItems =
        await shopItemRepository.getAllShopItemsInOrganization(orgId);

    const myEquipmentTableProps: MyEquipmentTableProp[] = [];
    myInventory.map((myItem) => {
        const item = shopItems.find((item) => item.id === myItem.itemId);
        const equipmentProp: MyEquipmentTableProp = {
            imageUrl: item?.url || "",
            name: item?.name || "",
            description: item?.description || "",
            purchaseDate: myItem.purchaseDate,
            status: myItem.status,
        };
        myEquipmentTableProps.push(equipmentProp);
    });

    return (
        <PageSection title={"My Equipment"} contentLength={myInventory.length}>
            <MyEquipmentTable equipmentProps={myEquipmentTableProps} />
        </PageSection>
    );
}
