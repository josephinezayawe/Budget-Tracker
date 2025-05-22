import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const { searchParams } = new URL(request.url);
  const paramType = searchParams.get("type");
  const validator = z.enum(["expense", "income"]).nullable();
  const queryparams = validator.safeParse(paramType);
  if (!queryparams.success) {
    return Response.json(queryparams.error, {
      status: 400,
    });
  }
  const type = queryparams.data;
  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
      ...(type && { type }), // include type in the filters if it's defined
    },
    orderBy: {
      name: "asc",
    },
  });
  return Response.json(categories);
}
