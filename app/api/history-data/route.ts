import prisma from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/type";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

const getHistoryDataSchema = z.object({
  timeFrame: z.enum(["month", "year"]),
  month: z.coerce.number().min(0).max(11).default(0),
  year: z.coerce.number().min(2000).max(3000),
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const timeFrame = searchParams.get("timeFrame");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  const queryParams = getHistoryDataSchema.safeParse({
    timeFrame,
    month,
    year,
  });

  if (!queryParams.success) {
    // It's good practice to log the error in development
    console.error("Invalid query parameters:", queryParams.error.message);
    return Response.json(
      { error: "Invalid query parameters", details: queryParams.error.message },
      {
        status: 400,
      }
    );
  }

  // --- FIX START: Call getHistoryData function instead of schema ---
  const data = await getHistoryData(
    user.id, // user.id is guaranteed to exist here due to the redirect
    queryParams.data.timeFrame, // Access data from the successful parse result
    {
      month: queryParams.data.month,
      year: queryParams.data.year,
    }
  );
  // --- FIX END ---

  return Response.json(data);
}

export type GetHistoryDataResponseType = Awaited<
  ReturnType<typeof getHistoryData>
>;

async function getHistoryData(
  userId: string,
  timeFrame: Timeframe,
  period: Period
) {
  switch (timeFrame) {
    case "year":
      return await getYearHistoryData(userId, period.year);
    case "month":
      return await getMonthHistoryData(userId, period.year, period.month); // Ensure await
    default:
      // Should not happen if timeFrame is validated by schema, but good practice
      throw new Error("Invalid timeframe");
  }
}

type HistoryData = {
  expense: number;
  income: number;
  year: number;
  month: number;
  day?: number;
};

async function getYearHistoryData(userId: string, year: number) {
  const result = await prisma.yearHistory.groupBy({
    by: ["month"],
    where: {
      userId,
      year,
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: [
      {
        month: "asc",
      },
    ],
  });
  if (!result || result.length === 0) return [];

  const history: HistoryData[] = [];
  for (let i = 0; i < 12; i++) {
    let expense = 0;
    let income = 0;

    const month = result.find((row) => row.month === i);
    if (month) {
      expense = month._sum.expense || 0;
      income = month._sum.income || 0;
    }
    history.push({
      year,
      month: i,
      expense,
      income,
    });
  }
  return history;
}

async function getMonthHistoryData(
  userId: string,
  year: number,
  month: number
) {
  const result = await prisma.monthHistory.groupBy({
    by: ["day"],
    where: {
      userId,
      year,
      month,
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: {
      day: "asc",
    },
  });
  if (!result || result.length === 0) return [];

  const history: HistoryData[] = [];

  const daysInmonth = getDaysInMonth(new Date(year, month));
  // --- FIX START: Changed loop condition to include the last day ---
  for (let i = 1; i <= daysInmonth; i++) {
    // --- FIX END ---
    let expense = 0;
    let income = 0;

    const day = result.find((row) => row.day === i);
    if (day) {
      expense = day._sum.expense || 0;
      income = day._sum.income || 0;
    }
    history.push({
      expense,
      income,
      year,
      month,
      day: i,
    });
  }
  // --- FIX START: Missing return statement ---
  return history;
  // --- FIX END ---
}
