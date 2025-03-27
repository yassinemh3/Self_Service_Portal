"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@components/ui/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/Card";
import { Icons } from "@components/ui/Icons";

export function EmailCodeVerification({
    isGlobalLoading,
}: {
    isGlobalLoading: boolean;
}) {
    return (
        <SignIn.Strategy name="email_code">
            <Card className="w-full sm:w-96">
                <CardHeader>
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>
                        Enter the verification code sent to your email
                    </CardDescription>
                    <p className="text-sm text-muted-foreground">
                        Welcome back <SignIn.SafeIdentifier />
                    </p>
                </CardHeader>
                <CardContent className="grid gap-y-4">
                    <Clerk.Field name="code">
                        <Clerk.Label className="sr-only">
                            Email verification code
                        </Clerk.Label>
                        <div className="grid items-center justify-center gap-y-2">
                            <div className="flex justify-center text-center">
                                <Clerk.Input
                                    type="otp"
                                    autoSubmit
                                    className="flex justify-center has-[:disabled]:opacity-50"
                                    render={({ value, status }) => (
                                        <div
                                            data-status={status}
                                            className="relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md data-[status=cursor]:ring-1 data-[status=selected]:ring-1 data-[status=cursor]:ring-ring data-[status=selected]:ring-ring"
                                        >
                                            {value}
                                        </div>
                                    )}
                                />
                            </div>
                            <Clerk.FieldError className="block text-center text-sm text-destructive" />
                            <SignIn.Action
                                asChild
                                resend
                                className="text-muted-foreground"
                                fallback={({ resendableAfter }) => (
                                    <Button variant="link" size="sm" disabled>
                                        Didn&apos;t receive a code? Resend (
                                        <span className="tabular-nums">
                                            {resendableAfter}
                                        </span>
                                        )
                                    </Button>
                                )}
                            >
                                <Button variant="link" size="sm">
                                    Didn&apos;t receive a code? Resend
                                </Button>
                            </SignIn.Action>
                        </div>
                    </Clerk.Field>
                </CardContent>
                <CardFooter>
                    <div className="grid w-full gap-y-4">
                        <SignIn.Action submit asChild>
                            <Button disabled={isGlobalLoading}>
                                <Clerk.Loading>
                                    {(isLoading) =>
                                        isLoading ? (
                                            <Icons.spinner className="size-4 animate-spin" />
                                        ) : (
                                            "Continue"
                                        )
                                    }
                                </Clerk.Loading>
                            </Button>
                        </SignIn.Action>
                        <SignIn.Action navigate="choose-strategy" asChild>
                            <Button size="sm" variant="link">
                                Use another method
                            </Button>
                        </SignIn.Action>
                        <SignIn.Action navigate="start" asChild>
                            <Button size="sm" variant="link">
                                Not you? Sign in with a different email
                            </Button>
                        </SignIn.Action>
                    </div>
                </CardFooter>
            </Card>
        </SignIn.Strategy>
    );
}
