"use server";

import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export const logout = async () => {
  try {
    await signOut({
      redirectTo: "/auth/login"
    });
  } catch (error) {
    console.error("Server-side logout error:", error);
    // Force redirect if signOut fails
    redirect("/auth/login");
  }
};