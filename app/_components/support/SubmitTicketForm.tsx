"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@components/ui/Form";
import { Input } from "@components/ui/Input";
import { Textarea } from "@components/ui/Textarea";
import { useActionState, useEffect, startTransition } from "react";
import { submitTicketFormSchema } from "@lib/formSchemas";
import submitTicketAction from "@actions/submitTicketAction";
import { LoadingButton } from "@components/ui/LoadingButton";
import { toast } from "sonner";
import { FileUploader } from "@components/support/FileUploader";
import { useRouter } from "next/navigation";

export default function SubmitTicketForm() {
    const form = useForm<z.infer<typeof submitTicketFormSchema>>({
        resolver: zodResolver(submitTicketFormSchema),
        defaultValues: {
            ticketTitle: "",
            ticketDescription: "",
            images: [],
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
        submitTicketAction,
        initialState,
    );

    const onSubmit = (data: z.infer<typeof submitTicketFormSchema>) => {
        const formData = new FormData();
        formData.append("ticketTitle", data.ticketTitle);
        formData.append("ticketDescription", data.ticketDescription);
        data.images.forEach((file) => {
            formData.append("images", file);
        });
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
            <h1 className="text-center text-3xl font-semibold">
                Submit a Ticket
            </h1>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto my-10 max-w-4xl grid-cols-1 items-center justify-center space-y-8"
            >
                <FormField
                    control={form.control}
                    name="ticketTitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Topic"
                                    type="text"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Short description of Issue
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="ticketDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your issue here"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Max. 500 chars, min. 10 chars
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload Screenshots</FormLabel>
                            <FormControl>
                                <FileUploader
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    maxFileCount={4}
                                    maxSize={8 * 1024 * 1024}
                                />
                            </FormControl>
                            <FormDescription>
                                Max. 4 images, 8MB each
                            </FormDescription>
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
