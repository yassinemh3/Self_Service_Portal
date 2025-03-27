"use server";

import { auth } from "@clerk/nextjs/server";
import {
    shopItemCategoryRepository,
    shopItemRepository,
} from "@lib/data/repositories";
import EditEquipmentForm from "@components/admin/EditEquipmentForm";
import { notFound, redirect } from "next/navigation";

export default async function AddEquipmentPage({
    params,
}: {
    params: Promise<{ equipmentId: string }>;
}) {
    const { userId, orgId, has } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    if (!has({ role: "org:admin" })) {
        notFound();
    }

    const equipmentId = (await params).equipmentId;
    try {
        const shopItem = await shopItemRepository.getShopItemById(
            parseInt(equipmentId),
        );
        const categories =
            await shopItemCategoryRepository.getAllShopItemCategoriesInOrganization(
                orgId,
            );

        return (
            <EditEquipmentForm categories={categories} shopItem={shopItem} />
        );
    } catch (error) {
        const err = error as Error;
        if (err.message === "Shop item not found") {
            redirect("/admin/equipment");
        } else {
            console.error(error);
        }
    }
}
