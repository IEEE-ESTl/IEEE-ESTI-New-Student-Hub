"use client";

import {
  SignInButton,
  useOrganizationList,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import React from "react";
import { Button } from "@/components/ui/button";
import { montserrat } from "@/lib/fonts";
import { Loader2 } from "lucide-react";

function loginbutton() {
  const { isSignedIn, user, isLoaded } = useUser();
  const {} = useOrganizationList;

  if (!isLoaded) {
    return (
      <div className="w-[30px] h-[30px] cursor-pointer transition-all duration-300 hover:-translate-y-1">
        <Loader2 className="h-5 w-5 animate-spin text-[#0371a4]" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <>
        <SignInButton mode="modal">
          <Button
            className={`${montserrat.className} bg-[#0371a4] text-white hover:bg-[#0371a4]/80 rounded-full py-4 px-6 cursor-pointer transition-all duration-300 hover:-translate-y-1`}
          >
            INICIAR SESIÓN
          </Button>
        </SignInButton>
      </>
    );
  }

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: {
            width: "30px",
            height: "30px",
          },
          userButtonAvatarImage: {
            width: "100%",
            height: "100%",
          },
        },
      }}
    />
  );
}

export default loginbutton;
