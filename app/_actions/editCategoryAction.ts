"use server";

import { auth } from "@clerk/nextjs/server";
import { shopItemCategoryRepository } from "@lib/data/repositories";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const editCategoryFormSchema = z.object({
    categoryId: z.number().nonnegative("Category ID must be a positive number"),
    categoryName: z.string().nonempty("Category name is required"),
    delete: z.boolean().optional(),
});

export default async function editCategoryAction(
    prevState: {
        message: string;
        success?: boolean;
        error?: boolean;
        redirectUrl?: string;
    },
    formData: FormData,
) {
    try {
        const { userId, orgId, has } = await auth();

        if (!userId || !orgId) {
            return {
                message: "User not authenticated or not in an organization",
                error: true,
            };
        }

        if (!has({ role: "org:admin" })) {
            return {
                message: "User does not have permission to edit categories",
                error: true,
            };
        }

        const parsedData = editCategoryFormSchema.safeParse({
            categoryId: parseInt(formData.get("id") as string),
            categoryName: formData.get("name"),
            delete: formData.get("delete") === "true",
        });

        if (!parsedData.success) {
            const errorMessages = parsedData.error.errors.map(
                (error) => error.message,
            );
            return {
                message: errorMessages.join(", "),
                error: true,
            };
        }

        if (parsedData.data.delete === true) {
            await shopItemCategoryRepository.deleteShopItemCategory(
                parsedData.data.categoryId,
            );

            revalidatePath(`/admin/categories`);
            revalidatePath(`/equipment/shop`);
            return {
                message: "Category deleted successfully",
                success: true,
                redirectUrl: `/admin/categories`,
            };
        }

        const newCategory = {
            id: parsedData.data.categoryId,
            name: parsedData.data.categoryName,
            organizationId: orgId,
        };

        await shopItemCategoryRepository.updateShopItemCategory(newCategory);
        revalidatePath(`/admin/categories`);

        return {
            message: "Category created successfully",
            success: true,
            redirectUrl: `/admin/categories`,
        };
    } catch (error) {
        console.log(error);
        return {
            message: "An error has occurred while editing the category",
            error: true,
        };
    }
}
