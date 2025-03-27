"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { inventoryRepository } from "@lib/data/repositories";
import { updateInventoryStatusFormSchema } from "@lib/formSchemas";

export default async function updateInventoryStatusAction(
    prevState: {
        message: string;
        success?: boolean;
        error?: boolean;
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
                message: "You do not have permission to manage inventory",
                error: true,
            };
        }

        const parsedData = updateInventoryStatusFormSchema.safeParse({
            inventoryId: Number(formData.get("inventoryId")),
            status: formData.get("status"),
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

        await inventoryRepository.updateInventory({
            id: parsedData.data.inventoryId,
            status: parsedData.data.status,
            updateDate: new Date(),
        });

        revalidatePath(`/equipment/all-equipment`);

        return {
            message: "Inventory status updated successfully",
            success: true,
        };
    } catch (error) {
        console.error(error);
        return {
            message:
                "An error has occurred while updating the inventory status",
            error: true,
        };
    }
}
