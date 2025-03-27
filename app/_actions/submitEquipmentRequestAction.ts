"use server";

import { auth } from "@clerk/nextjs/server";
import {
    requestRepository,
    itemInRequestRepository,
} from "@lib/data/repositories";
import { articlesInShoppingCartSchema } from "@lib/formSchemas";
import { revalidatePath } from "next/cache";

export default async function submitEquipmentRequestAction(
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

        const parsedData = articlesInShoppingCartSchema.safeParse(
            JSON.parse(formData.get("articlesInShoppingCart") as string),
        );

        if (!parsedData.success) {
            const errorMessages = parsedData.error.errors.map(
                (error) => error.message,
            );
            return {
                message: errorMessages.join(", "),
                error: true,
            };
        }

        const request = await requestRepository.createRequest(userId, orgId);

        for (const article of parsedData.data) {
            await itemInRequestRepository.createItemInRequestList({
                requestId: request.id,
                itemId: article.id,
                quantity: article.quantity,
                organizationId: orgId,
            });
        }

        revalidatePath(`/equipment/my-requests`);
        revalidatePath(`/equipment/all-requests`);

        return {
            message: "Equipment request submitted successfully",
            success: true,
            redirectUrl: `/equipment/request/${request.id}`,
        };
    } catch (error) {
        console.log(error);
        return {
            message:
                "An error has occurred while submitting the equipment request",
            error: true,
        };
    }
}
