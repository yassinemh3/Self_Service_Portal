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
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";
import { Icons } from "@components/ui/Icons";

export function PasswordVerification({
    isGlobalLoading,
}: {
    isGlobalLoading: boolean;
}) {
    return (
        <SignIn.Strategy name="password">
            <Card className="w-full sm:w-96">
                <CardHeader>
                    <CardTitle>Enter your password</CardTitle>
                    <CardDescription>
                        Enter your password to sign in
                    </CardDescription>
                    <p className="text-sm text-muted-foreground">
                        Welcome back <SignIn.SafeIdentifier />
                    </p>
                </CardHeader>
                <CardContent className="grid gap-y-4">
                    <Clerk.Field name="password" className="space-y-2">
                        <Clerk.Label asChild>
                            <Label>Password</Label>
                        </Clerk.Label>
                        <Clerk.Input type="password" asChild>
                            <Input />
                        </Clerk.Input>
                        <Clerk.FieldError className="block text-sm text-destructive" />
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
                            <Button type="button" size="sm" variant="link">
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
