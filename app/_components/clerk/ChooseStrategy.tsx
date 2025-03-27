"use client";

import * as SignIn from "@clerk/elements/sign-in";
import * as Clerk from "@clerk/elements/common";
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

export function ChooseStrategy({
    isGlobalLoading,
}: {
    isGlobalLoading: boolean;
}) {
    return (
        <SignIn.Step name="choose-strategy">
            <Card className="w-full sm:w-96">
                <CardHeader>
                    <CardTitle>Use another method</CardTitle>
                    <CardDescription>
                        Facing issues? You can use any of these methods to sign
                        in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-y-4">
                    <SignIn.SupportedStrategy name="email_code" asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isGlobalLoading}
                        >
                            Email code
                        </Button>
                    </SignIn.SupportedStrategy>
                    <SignIn.SupportedStrategy name="password" asChild>
                        <Button
                            type="button"
                            variant="link"
                            disabled={isGlobalLoading}
                        >
                            Password
                        </Button>
                    </SignIn.SupportedStrategy>
                </CardContent>
                <CardFooter>
                    <div className="grid w-full gap-y-4">
                        <SignIn.Action navigate="previous" asChild>
                            <Button disabled={isGlobalLoading}>
                                <Clerk.Loading>
                                    {(isLoading) =>
                                        isLoading ? (
                                            <Icons.spinner className="size-4 animate-spin" />
                                        ) : (
                                            "Go back"
                                        )
                                    }
                                </Clerk.Loading>
                            </Button>
                        </SignIn.Action>
                    </div>
                </CardFooter>
            </Card>
        </SignIn.Step>
    );
}
