"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { shopItemCategoryRepository } from "@lib/data/repositories";
import { z } from "zod";

const createCategoryFormSchema = z.object({
    categoryName: z.string().nonempty("Category name is required"),
});

export default async function addCategoryAction(
    prevState: {
        message: string;
        success?: boolean;
        error?: boolean;
    },
    formData: FormData,
) {
    try {
        const { userId, orgId } = await auth();

        if (!userId || !orgId) {
            return {
                message: "User not authenticated or not in an organization",
                error: true,
            };
        }

        const parsedData = createCategoryFormSchema.safeParse({
            categoryName: formData.get("name"),
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

        const newCategory = {
            name: parsedData.data.categoryName,
            organizationId: orgId,
        };

        await shopItemCategoryRepository.createShopItemCategory(newCategory);
        revalidatePath(`/admin/categories`);

        return {
            message: "Category created successfully",
            success: true,
            redirectUrl: `/admin/categories`,
        };
    } catch (error) {
        console.log(error);
        return {
            message: "An error has occurred while adding the category",
            error: true,
        };
    }
}
