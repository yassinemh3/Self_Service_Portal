import { auth } from "@clerk/nextjs/server";
import AddEquipmentForm from "@components/admin/AddEquipmentForm";
import { shopItemCategoryRepository } from "@lib/data/repositories";
import { notFound } from "next/navigation";

export default async function AddEquipmentPage() {
    const { userId, orgId, has } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    if (!has({ role: "org:admin" })) {
        notFound();
    }

    const categories =
        await shopItemCategoryRepository.getAllShopItemCategoriesInOrganization(
            orgId,
        );

    return <AddEquipmentForm categories={categories} />;
}
