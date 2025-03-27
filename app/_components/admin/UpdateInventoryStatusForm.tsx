"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateInventoryStatusFormSchema } from "@lib/formSchemas";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@components/ui/Form";
import { Input } from "@components/ui/Input";
import { startTransition, useActionState, useEffect } from "react";
import { LoadingButton } from "@components/ui/LoadingButton";
import { toast } from "sonner";
import updateInventoryStatusAction from "@actions/updateInventoryStatusAction";
import { z } from "zod";
import { SaveIcon } from "lucide-react";

interface UpdateInventoryStatusFormProps {
    inventoryId: number;
    currentStatus: string;
}

export default function UpdateInventoryStatusForm({
    inventoryId,
    currentStatus,
}: UpdateInventoryStatusFormProps) {
    const form = useForm<z.infer<typeof updateInventoryStatusFormSchema>>({
        resolver: zodResolver(updateInventoryStatusFormSchema),
        defaultValues: {
            inventoryId: inventoryId,
            status: currentStatus,
        },
    });

    const initialState: {
        message: string;
        success?: boolean;
        error?: boolean;
    } = {
        message: "",
    };

    const [state, formAction, isPending] = useActionState(
        updateInventoryStatusAction,
        initialState,
    );

    const onSubmit = (
        data: z.infer<typeof updateInventoryStatusFormSchema>,
    ) => {
        console.log("Form submitted with data:", data); // Debug log
        const formData = new FormData();
        formData.append("inventoryId", data.inventoryId.toString());
        formData.append("status", data.status);
        startTransition(() => {
            formAction(formData);
        });
    };

    useEffect(() => {
        if (state && "error" in state && state.message !== "") {
            toast.error(state.message);
        } else if (state && "success" in state && state.message !== "") {
            toast.success(state.message);
        }
    }, [state]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full items-center gap-x-1"
            >
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder="Status" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <LoadingButton
                    loading={isPending}
                    type={"submit"}
                    size={"icon"}
                    variant={"ghost"}
                    className={"w-3/4"}
                >
                    <SaveIcon />
                </LoadingButton>
            </form>
        </Form>
    );
}
