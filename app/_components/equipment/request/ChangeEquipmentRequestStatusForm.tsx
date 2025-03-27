"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from "@components/ui/Form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from "@components/ui/Select";
import { ItemInRequestStatusEnum, RequestStatusEnum } from "@lib/data/entities";
import { startTransition, useActionState, useEffect } from "react";
import changeEquipmentRequestStatusAction from "@actions/changeEquipmentRequestStatusAction";

interface ChangeRequestStatusFormProps {
    requestId: string;
    itemInRequestId?: string;
}

export default function ChangeEquipmentRequestStatusForm({
    requestId,
    itemInRequestId,
}: ChangeRequestStatusFormProps) {
    const formSchema = z.object({
        status: z.nativeEnum(
            itemInRequestId ? ItemInRequestStatusEnum : RequestStatusEnum,
            { message: "Invalid status" },
        ),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const initialState: {
        message: string;
        success?: boolean;
        error?: boolean;
        info?: boolean;
    } = {
        message: "",
    };

    const [state, formAction] = useActionState(
        changeEquipmentRequestStatusAction,
        initialState,
    );

    useEffect(() => {
        if (state && "error" in state && state.message !== "") {
            toast.error(state.message);
        } else if (state && "info" in state && state.message !== "") {
            toast.info(state.message);
        } else if (state && "success" in state && state.message !== "") {
            toast.success(state.message);
        }
    }, [state]);

    function onSubmit(data: z.infer<typeof formSchema>) {
        const formData = new FormData();
        if (itemInRequestId) {
            formData.append("itemInRequestId", itemInRequestId);
        }
        formData.append("status", data.status);
        formData.append("requestId", requestId);

        startTransition(() => {
            formAction(formData);
        });
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={"w-[180px] rounded-md"}
            >
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            {!itemInRequestId && (
                                <FormLabel>Quick Response:</FormLabel>
                            )}
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    form.handleSubmit(onSubmit)();
                                }}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Status</SelectLabel>
                                        <SelectItem
                                            value={RequestStatusEnum.Processing}
                                        >
                                            Processing
                                        </SelectItem>
                                        <SelectItem
                                            value={RequestStatusEnum.Accepted}
                                        >
                                            Accepted
                                        </SelectItem>
                                        <SelectItem
                                            value={RequestStatusEnum.Declined}
                                        >
                                            Declined
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
