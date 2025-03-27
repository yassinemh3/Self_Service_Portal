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
import { startTransition, useActionState, useEffect } from "react";
import { LoadingButton } from "@components/ui/LoadingButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import addCategoryAction from "@actions/addCategoryAction";

const addCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
});

export default function AddCategoriesForm() {
    const form = useForm<z.infer<typeof addCategorySchema>>({
        resolver: zodResolver(addCategorySchema),
        defaultValues: {
            name: "",
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
        addCategoryAction,
        initialState,
    );

    const onSubmit = (data: z.infer<typeof addCategorySchema>) => {
        const formData = new FormData();
        formData.append("name", data.name);
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
