"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@components/ui/Form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/Select";
import { Input } from "@components/ui/Input";
import { startTransition, useActionState, useEffect, useState } from "react";
import { LoadingButton } from "@components/ui/LoadingButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ShopItem, ShopItemCategory } from "@lib/data/entities";
import editEquipmentAction from "@actions/editEquipmentAction";
import Image from "next/image";
import { Skeleton } from "@components/ui/Skeleton";
import { Button } from "@components/ui/Button";
import { Save, Trash2 } from "lucide-react";

const editEquipmentSchema = z.object({
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
        .optional(),
    categoryId: z.string().optional(),
    stock: z.string().optional(),
});

interface EditEquipmentFormProps {
    categories: ShopItemCategory[];
    shopItem: ShopItem;
}

export default function EditEquipmentForm({
    categories,
    shopItem,
}: EditEquipmentFormProps) {
    const form = useForm<z.infer<typeof editEquipmentSchema>>({
        resolver: zodResolver(editEquipmentSchema),
        defaultValues: {
            name: shopItem.name,
            description: shopItem.description ? shopItem.description : "",
            image: undefined,
            categoryId: shopItem.categoryId?.toString() || undefined,
            stock: shopItem.stock.toString() || "1",
        },
    });

    const initialState: {
        message: string;
        success?: boolean;
        error?: boolean;
        redirectUrl?: string;
    } = {
        message: "",
    };

    const [state, formAction, isPending] = useActionState(
        editEquipmentAction,
        initialState,
    );

    const [toDelete, setToDelete] = useState(false);

    const onSubmit = (data: z.infer<typeof editEquipmentSchema>) => {
        const formData = new FormData();
        if (toDelete) {
            formData.append("delete", "true");
            startTransition(() => {
                formAction(formData);
            });
        }

        formData.append("id", shopItem.id.toString());
        formData.append("name", data.name || "");
        formData.append("description", data.description || "");

        if (data.image instanceof File) {
            formData.append("image", data.image);
        }

        formData.append(
            "categoryId",
            data.categoryId ? data.categoryId.toString() : "",
        );
        formData.append("stock", data.stock?.toString() || "0");

        startTransition(() => {
            formAction(formData);
        });
    };

    const router = useRouter();

    useEffect(() => {
        if (state && "error" in state && state.message !== "") {
            toast.error(state.message);
        } else if (state && "success" in state && state.message !== "") {
            toast.success(state.message);
            if (state.redirectUrl) {
                router.push(state.redirectUrl);
            }
        }
    }, [state, router]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto my-10 max-w-4xl grid-cols-1 items-center justify-center space-y-8"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Item Name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {shopItem?.url ? (
                    <div className={""}>
                        <span className={"mt-4 text-center"}>
                            Current Image
                        </span>
                        <Image
                            src={shopItem.url}
                            alt={shopItem.name}
                            className={
                                "mt-4 h-48 w-48 content-center rounded-lg bg-background text-center"
                            }
                            width={320}
                            height={320}
                        />
                    </div>
                ) : (
                    <Skeleton className="h-48 w-48 content-center rounded-lg bg-background text-center">
                        <div>No Image</div>
                    </Skeleton>
                )}
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image</FormLabel>
                            <FormControl>
                                <Input
                                    type={"file"}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        field.onChange(file);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={shopItem.categoryId?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => {
                                        return (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                                <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className={"grid grid-cols-2 gap-4"}>
                    <LoadingButton
                        loading={isPending}
                        type={"submit"}
                        className={"w-full"}
                    >
                        <Save className={"mr-2"} />
                        Save
                    </LoadingButton>
                    <Button
                        variant={"destructive"}
                        className={"w-full"}
                        onClick={() => setToDelete(true)}
                    >
                        <Trash2 />
                        Delete
                    </Button>
                </div>
            </form>
        </Form>
    );
}
