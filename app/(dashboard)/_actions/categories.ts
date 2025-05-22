"use server";

import prisma from "@/lib/prisma";
import {
  createCategorySchema,
  createCategorySchemaType,
} from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateCategory(form: createCategorySchemaType) {
  const parsedBody = createCategorySchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("Bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const { name, icon, type } = parsedBody.data;
  return prisma.category.create({
    data: {
      userId: user.id,
      name,
      icon,
      type,
    },
  });
}
