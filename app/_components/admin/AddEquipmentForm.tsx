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
import { startTransition, useActionState, useEffect } from "react";
import { LoadingButton } from "@components/ui/LoadingButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ShopItemCategory } from "@lib/data/entities";
import addEquipmentAction from "@actions/addEquipmentAction";

const addEquipmentSchema = z.object({
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
    categoryId: z.string().optional(),
    stock: z.string(),
});

interface AddEquipmentFormProps {
    categories: ShopItemCategory[];
}

export default function AddEquipmentForm({
    categories,
}: AddEquipmentFormProps) {
    const form = useForm<z.infer<typeof addEquipmentSchema>>({
        resolver: zodResolver(addEquipmentSchema),
        defaultValues: {
            name: "",
            description: "",
            image: undefined,
            categoryId: undefined,
            stock: "1",
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
        addEquipmentAction,
        initialState,
    );

    const onSubmit = (data: z.infer<typeof addEquipmentSchema>) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("image", data.image);
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
                                defaultValue={""}
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
                <LoadingButton
                    loading={isPending}
                    type={"submit"}
                    className={"w-full"}
                >
                    Submit
                </LoadingButton>
            </form>
        </Form>
    );
}
