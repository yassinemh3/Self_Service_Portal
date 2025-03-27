import * as z from "zod";

export const submitTicketFormSchema = z.object({
    ticketTitle: z
        .string()
        .min(5, { message: "Title must be at least 5 characters long" })
        .max(100, { message: "Title must be at most 100 characters long" }),
    ticketDescription: z
        .string()
        .min(10, { message: "Description must be at least 10 characters long" })
        .max(500, {
            message: "Description must be at most 500 characters long",
        }),

    images: z
        .array(
            z
                .instanceof(File)
                .refine(
                    (file) => {
                        const validTypes = ["image/jpeg", "image/png"];
                        return validTypes.includes(file.type);
                    },
                    { message: "Only JPG and PNG files are allowed" },
                )
                .refine((file) => file.size < 8 * 1024 * 1024, {
                    message: "File size must be less than 5MB",
                }),
        )
        .max(4, { message: "You can upload up to 4 images" }),
});
