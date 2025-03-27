"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { shopItemRepository } from "@lib/data/repositories";
import { CreatedShopItem } from "@lib/data/entities";

const createEquipmentFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    image: z
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
    categoryId: z.number().optional(),
    stock: z.number().min(1, "Stock is required"),
});

export default async function addEquipmentAction(
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

        const parsedData = createEquipmentFormSchema.safeParse({
            name: formData.get("name"),
            description: formData.get("description"),
            image: formData.get("image") as File,
            categoryId: formData.get("categoryId")
                ? parseInt(formData.get("categoryId") as string)
                : undefined,
            stock: formData.get("stock")
                ? parseInt(formData.get("stock") as string)
                : undefined,
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

        const imageUrl = await uploadImage(parsedData.data.image);

        const newEquipment: CreatedShopItem = {
            name: parsedData.data.name,
            description: parsedData.data.description,
            url: imageUrl,
            categoryId: parsedData.data.categoryId
                ? parsedData.data.categoryId
                : null,
            stock: parsedData.data.stock,
            organizationId: orgId,
        };

        await shopItemRepository.createShopItem(newEquipment);
        revalidatePath(`/admin/equipment`);

        return {
            message: "Equipment created successfully",
            success: true,
            redirectUrl: `/admin/equipment`,
        };
    } catch (error) {
        console.log(error);
        return {
            message: "An error has occurred while adding the equipment",
            error: true,
        };
    }
}

const uploadImage = async (image: File) => {
    try {
        const cloudData = new FormData();
        cloudData.append("file", image);
        cloudData.append("upload_preset", "article");
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
        return data.secure_url;
    } catch (err) {
        console.error(err);
    } finally {
        console.log("File uploaded:", image.name);
    }
};
