"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@components/ui/Button";
import { TicketStatusEnum } from "@lib/data/entities";
import { startTransition, useActionState, useEffect } from "react";
import changeTicketStatusAction from "@actions/changeTicketStatusAction";

interface CloseTicketFormProps {
    ticketId: string;
}

const formSchema = z.object({
    status: z.literal(TicketStatusEnum.Closed),
});

export default function CloseTicketForm({ ticketId }: CloseTicketFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: TicketStatusEnum.Closed,
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Button type="submit" variant={"destructive"}>
                Close Ticket
            </Button>
        </form>
    );
}
