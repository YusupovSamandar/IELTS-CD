"use server";

import { UserRole } from "@prisma/client";
import { currentRole } from "../auth/user";

export const admin = async () => {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return { success: "Allowed Server Action!" };
  }

  return { error: "Forbidden Server Action!" }
};