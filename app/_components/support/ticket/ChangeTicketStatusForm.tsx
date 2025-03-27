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
import { TicketStatusEnum } from "@lib/data/entities";
import { startTransition, useActionState, useEffect } from "react";
import changeTicketStatusAction from "@actions/changeTicketStatusAction";

interface ChangeTicketStatusFormProps {
    ticketId: string;
    currentStatus: TicketStatusEnum;
}

const formSchema = z.object({
    status: z.nativeEnum(TicketStatusEnum, { message: "Invalid status" }),
});

export default function ChangeTicketStatusForm({
    ticketId,
    currentStatus,
}: ChangeTicketStatusFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: currentStatus,
        },
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
        changeTicketStatusAction,
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
        formData.append("status", data.status);
        formData.append("ticketId", ticketId);

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
                            <FormLabel>Change Status:</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    form.handleSubmit(onSubmit)();
                                }}
                                defaultValue={field.value}
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
                                            value={TicketStatusEnum.Open}
                                        >
                                            Open
                                        </SelectItem>
                                        <SelectItem
                                            value={TicketStatusEnum.InProgress}
                                        >
                                            In Progress
                                        </SelectItem>
                                        <SelectItem
                                            value={TicketStatusEnum.OnHold}
                                        >
                                            On Hold
                                        </SelectItem>
                                        <SelectItem
                                            value={TicketStatusEnum.Closed}
                                        >
                                            Closed
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
