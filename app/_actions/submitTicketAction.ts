"use server";

import { submitTicketFormSchema } from "@lib/formSchemas";
import { auth } from "@clerk/nextjs/server";
import {
    ticketRepository,
    ticketScreenshotRepository,
} from "@lib/data/repositories";
import { revalidatePath } from "next/cache";

export default async function submitTicketAction(
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

        const parsedData = submitTicketFormSchema.safeParse({
            ticketTitle: formData.get("ticketTitle"),
            ticketDescription: formData.get("ticketDescription"),
            images: formData.getAll("images") as File[],
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

        const newTicket = {
            title: parsedData.data.ticketTitle,
            description: parsedData.data.ticketDescription,
            ownerId: userId,
            organizationId: orgId,
        };

        const uploadedFiles = await uploadImages(parsedData.data.images);

        const ticket = await ticketRepository.createTicket(newTicket);

        await Promise.all(
            uploadedFiles.map(async (fileUrl) => {
                await ticketScreenshotRepository.createTicketScreenshot({
                    url: fileUrl,
                    ticketId: ticket.id,
                });
            }),
        );
        revalidatePath("/support/my-tickets");

        return {
            message: "Ticket submitted successfully",
            success: true,
            redirectUrl: `/support/ticket/${ticket.id}`,
        };
    } catch (error) {
        console.log(error);
        return {
            message: "An error has occurred while submitting the ticket",
            error: true,
        };
    }
}

const uploadImages = async (images: File[]) => {
    const uploadedFileUrls: string[] = [];
    for (const image of images) {
        try {
            const cloudData = new FormData();
            cloudData.append("file", image);
            cloudData.append("upload_preset", "screenshot");
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: cloudData,
                },
            );

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            const imageUrl = data.secure_url;

            uploadedFileUrls.push(imageUrl);
        } catch (err) {
            console.error(err);
        } finally {
            console.log("File uploaded:", image.name);
        }
    }
    return uploadedFileUrls;
};
