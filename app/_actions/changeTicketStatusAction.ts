"use server";

import { auth } from "@clerk/nextjs/server";
import { changeTicketStatusFormSchema } from "@lib/formSchemas";
import { ticketRepository } from "@lib/data/repositories";
import { revalidatePath } from "next/cache";
import { TicketStatusEnum } from "@lib/data/entities";

export default async function changeTicketStatusAction(
    prevState: {
        message: string;
        success?: boolean;
        info?: boolean;
        error?: boolean;
    },
    formData: FormData,
) {
    try {
        const { userId, has } = await auth();

        if (!userId) {
            return {
                message: "User not authenticated",
                error: true,
            };
        }

        const parsedData = changeTicketStatusFormSchema.safeParse({
            status: formData.get("status"),
            ticketId: Number(formData.get("ticketId")),
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

        const ticket = await ticketRepository.getTicketById(
            parsedData.data.ticketId,
        );

        if (
            ticket.ownerId === userId &&
            parsedData.data.status !== TicketStatusEnum.Closed &&
            !has({ permission: "org:tickets:manage_all" })
        ) {
            return {
                message: "You can only set the status to closed",
                error: true,
            };
        }

        if (
            !has({ permission: "org:tickets:manage_all" }) &&
            ticket.ownerId !== userId
        ) {
            return {
                message:
                    "You do not have permission to change this ticket's status",
                error: true,
            };
        }

        if (ticket.status === parsedData.data.status) {
            return {
                message: "Ticket status is already set to this status",
                info: true,
            };
        }

        await ticketRepository.updateTicket({
            id: parsedData.data.ticketId,
            status: parsedData.data.status,
            updateDate: new Date(),
        });

        revalidatePath(`/support/ticket/${String(parsedData.data.ticketId)}`);

        return {
            message: "Ticket status updated",
            success: true,
        };
    } catch (error) {
        console.error(error);
        return {
            message: "An error has occurred while submitting the ticket",
            error: true,
        };
    }
}
