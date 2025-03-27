import * as z from "zod";
import { ItemInRequestStatusEnum, RequestStatusEnum } from "@lib/data/entities";

export const changeEquipmentRequestStatusFormSchema = z.object({
    requestId: z
        .number()
        .int()
        .nonnegative({ message: "Request ID must be a non-negative integer" }),
    status: z
        .nativeEnum(ItemInRequestStatusEnum, { message: "Invalid status" })
        .or(z.nativeEnum(RequestStatusEnum, { message: "Invalid status" })),
    itemInRequestId: z
        .number()
        .int()
        .nonnegative({
            message: "itemInRequestId ID must be a non-negative integer",
        })
        .optional(),
});
