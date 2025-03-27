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
} from "@components/ui/Form";
import { Textarea } from "@components/ui/Textarea";
import { LoadingButton } from "@components/ui/LoadingButton";
import { startTransition, useActionState, useEffect } from "react";
import sendTicketResponseAction from "@actions/sendTicketResponseAction";
import { sendTicketResponseFormSchema } from "@lib/formSchemas";
import { TicketStatusEnum } from "@lib/data/entities";

interface ConversationInputProps {
    ticketId: string;
    ticketStatus: TicketStatusEnum;
}

export default function ConversationInput({
    ticketId,
    ticketStatus,
}: ConversationInputProps) {
    const formSchema = z.object({
        content: z
            .string()
            .min(1, { message: "Content is required" })
            .max(500, {
                message: "Content must be at most 500 characters long",
            }),
    });

    const form = useForm<z.infer<typeof sendTicketResponseFormSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
            ticketId: parseInt(ticketId),
        },
    });

    const { reset } = form;

    const initialState: {
        message: string;
        success?: boolean;
        error?: boolean;
    } = {
        message: "",
    };

    const [state, formAction, isPending] = useActionState(
        sendTicketResponseAction,
        initialState,
    );

    useEffect(() => {
        if (state && "error" in state && state.message !== "") {
            toast.error(state.message);
        } else if (state && "success" in state && state.message !== "") {
            toast.success(state.message);
            reset();
        }
    }, [state, reset]);

    const onSubmit = (data: z.infer<typeof sendTicketResponseFormSchema>) => {
        const formData = new FormData();
        formData.append("ticketId", ticketId.toString());
        formData.append("content", data.content);

        startTransition(() => {
            formAction(formData);
        });
    };

    const isClosed = ticketStatus === TicketStatusEnum.Closed;

    return (
        <div className="container mx-auto rounded-xl border p-4">
            {!isClosed ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your response here"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <LoadingButton
                            type="submit"
                            loading={isPending}
                            name={"ticketId"}
                            value={ticketId}
                            className="mt-4"
                        >
                            Send
                        </LoadingButton>
                    </form>
                </Form>
            ) : (
                <div className="text-center text-muted-foreground">
                    This ticket is closed
                </div>
            )}
        </div>
    );
}
