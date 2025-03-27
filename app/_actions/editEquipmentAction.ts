"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { shopItemRepository } from "@lib/data/repositories";
import { UpdatedShopItem } from "@lib/data/entities";

const createEquipmentFormSchema = z.object({
    id: z.number().min(1, "ID is required"),
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
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
        })
        .optional()
        .nullable(),
    categoryId: z.number().optional(),
    stock: z.number().min(1, "Stock is required").optional(),
    delete: z.boolean().optional(),
});

const deleteEquipmentFormSchema = z.object({
    id: z.number().min(1, "ID is required"),
    delete: z.boolean().optional(),
});

export default async function editEquipmentAction(
    prevState: {
        message: string;
        success?: boolean;
        error?: boolean;
        redirectUrl?: string;
    },
    formData: FormData,
) {
    try {
        const deleteParsedData = deleteEquipmentFormSchema.safeParse({
            id: parseInt(formData.get("id") as string),
            delete: formData.get("delete") === "true",
        });

        if (deleteParsedData.data?.delete) {
            await shopItemRepository.deleteShopItem(deleteParsedData.data.id);
            revalidatePath(`/admin/equipment`);
            return {
                message: "Equipment deleted successfully",
                success: true,
                redirectUrl: `/admin/equipment`,
            };
        }

        const { userId, orgId } = await auth();

        if (!userId || !orgId) {
            return {
                message: "User not authenticated or not in an organization",
                error: true,
            };
        }

        const parsedData = createEquipmentFormSchema.safeParse({
            id: parseInt(formData.get("id") as string),
            name: formData.get("name"),
            description: formData.get("description"),
            image: formData.get("image") as File,
            categoryId: formData.get("categoryId")
                ? parseInt(formData.get("categoryId") as string)
                : undefined,
            stock: formData.get("stock")
                ? parseInt(formData.get("stock") as string)
                : undefined,
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

        const newEquipment: UpdatedShopItem = {
            id: parsedData.data.id,
            name: parsedData.data.name,
            description: parsedData.data.description,
            categoryId: parsedData.data.categoryId
                ? parsedData.data.categoryId
                : null,
            stock: parsedData.data.stock,
            organizationId: orgId,
        };

        let imageUrl: string = "";
        if (parsedData.data.image) {
            imageUrl = await uploadImage(parsedData.data.image);
            newEquipment.url = imageUrl;
        }

        await shopItemRepository.updateShopItem(newEquipment);
        revalidatePath(`/admin/equipment`);

        return {
            message: "Equipment edited successfully",
            success: true,
            redirectUrl: `/admin/equipment`,
        };
    } catch (error) {
        console.log(error);
        return {
            message: "An error has occurred while editing the equipment",
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
