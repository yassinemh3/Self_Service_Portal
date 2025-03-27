"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { SignInStart } from "@components/clerk/SignInStart";
import { ChooseStrategy } from "@components/clerk/ChooseStrategy";
import { PasswordVerification } from "@components/clerk/PasswordVerification";
import { EmailCodeVerification } from "@components/clerk/EmailCodeVerification";

export default function UserSignIn() {
    return (
        <div className="my-20 grid w-full grow items-center px-4 sm:justify-center">
            <SignIn.Root>
                <Clerk.Loading>
                    {(isGlobalLoading) => (
                        <>
                            <SignInStart isGlobalLoading={isGlobalLoading} />
                            <ChooseStrategy isGlobalLoading={isGlobalLoading} />
                            <SignIn.Step name="verifications">
                                <PasswordVerification
                                    isGlobalLoading={isGlobalLoading}
                                />
                                <EmailCodeVerification
                                    isGlobalLoading={isGlobalLoading}
                                />
                            </SignIn.Step>
                        </>
                    )}
                </Clerk.Loading>
            </SignIn.Root>
        </div>
    );
}
