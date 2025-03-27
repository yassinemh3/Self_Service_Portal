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

export function SignInStart({ isGlobalLoading }: { isGlobalLoading: boolean }) {
    return (
        <SignIn.Step name="start">
            <Card className="w-full sm:w-96">
                <CardHeader>
                    <CardTitle>Sign in to Self Service</CardTitle>
                    <CardDescription>
                        Welcome back! Please sign in to continue
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-y-4">
                    <div className="grid grid-cols-2 gap-x-4">
                        <Clerk.Connection name="github" asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                disabled={isGlobalLoading}
                            >
                                <Clerk.Loading scope="provider:github">
                                    {(isLoading) =>
                                        isLoading ? (
                                            <Icons.spinner className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Icons.gitHub className="mr-2 size-4" />{" "}
                                                GitHub
                                            </>
                                        )
                                    }
                                </Clerk.Loading>
                            </Button>
                        </Clerk.Connection>
                        <Clerk.Connection name="google" asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                type="button"
                                disabled={isGlobalLoading}
                            >
                                <Clerk.Loading scope="provider:google">
                                    {(isLoading) =>
                                        isLoading ? (
                                            <Icons.spinner className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Icons.google className="mr-2 size-4" />{" "}
                                                Google
                                            </>
                                        )
                                    }
                                </Clerk.Loading>
                            </Button>
                        </Clerk.Connection>
                    </div>
                    <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                        or
                    </p>
                    <Clerk.Field name="identifier" className="space-y-2">
                        <Clerk.Label asChild>
                            <Label>Email address</Label>
                        </Clerk.Label>
                        <Clerk.Input type="email" required asChild>
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
                    </div>
                </CardFooter>
            </Card>
        </SignIn.Step>
    );
}
