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
import { Input } from "@components/ui/Input";
import { ShopItemCategory } from "@lib/data/entities/ShopItemCategory";
import { startTransition, useActionState, useEffect, useState } from "react";
import editCategoryAction from "@actions/editCategoryAction";
import { LoadingButton } from "@components/ui/LoadingButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@components/ui/Button";

const editCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
});

interface EditCategoryFormProps {
    category: ShopItemCategory;
}

export default function EditCategoryForm({ category }: EditCategoryFormProps) {
    const form = useForm<z.infer<typeof editCategorySchema>>({
        resolver: zodResolver(editCategorySchema),
        defaultValues: {
            name: category.name || "",
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
        editCategoryAction,
        initialState,
    );

    const [toDelete, setToDelete] = useState(false);

    const onSubmit = (data: z.infer<typeof editCategorySchema>) => {
        const formData = new FormData();
        formData.append("id", category.id.toString());
        formData.append("name", data.name);

        if (toDelete) {
            formData.append("delete", "true");
        }
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
                                <Input placeholder="Category Name" {...field} />
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
