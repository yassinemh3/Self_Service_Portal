"use server";

import { auth } from "@clerk/nextjs/server";
import EditCategoryForm from "@components/admin/EditCategoryForm";
import { shopItemCategoryRepository } from "@lib/data/repositories";
import { notFound, redirect } from "next/navigation";

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ categoryId: string }>;
}) {
    const { userId, orgId, has } = await auth();
    if (!userId || !orgId) {
        return null;
    }

    if (!has({ role: "org:admin" })) {
        notFound();
    }

    const categoryId = (await params).categoryId;
    try {
        const category =
            await shopItemCategoryRepository.getShopItemCategoryById(
                parseInt(categoryId),
            );
        return <EditCategoryForm category={category} />;
    } catch (error) {
        const err = error as Error;
        if (err.message === "Shop item category not found") {
            redirect("/admin/categories");
        } else {
            console.error(error);
        }
    }
}
