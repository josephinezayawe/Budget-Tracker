import { GetBalanceStateResponseType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import { userSettings } from "@/lib/generated/prisma";
import { DateToUTCDate, GetFormatterForCurrency } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

import React, { useCallback, useMemo } from "react";
import { ReactNode } from "react";
import CountUp from "react-countup";

interface Props {
  from: Date;
  to: Date;
  userSettings: userSettings;
}

function StatsCards({ from, to, userSettings }: Props) {
  const stastQuery = useQuery<GetBalanceStateResponseType>({
    queryKey: ["overview", "stats", from, to],
    queryFn: async () => {
      const url = `/api/stats/balance?from=${DateToUTCDate(
        from
      )}&to=${DateToUTCDate(to)}`;
      const res = await fetch(url);

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`API Error: ${res.status} ${error}`);
      }

      return res.json();
    },
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);
  const income = stastQuery.data?.income || 0;
  const expense = stastQuery.data?.expense || 0;
  const balance = income - expense;
  return (
    <div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap ">
      <SkeletonWrapper isLoading={stastQuery.isFetching} fullWidth={true}>
        <StatCard
          formatter={formatter}
          value={income}
          tittle="income"
          icon={
            <TrendingUp className=" h-12 w-12 items-center rounded-lg p-2 text-emerald-500 bg-emerald-400/10" /> // FIXED HERE
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={stastQuery.isFetching} fullWidth={true}>
        <StatCard
          formatter={formatter}
          value={expense}
          tittle="expense"
          icon={
            <TrendingDown className=" h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10" />
          }
        />
      </SkeletonWrapper>

      <SkeletonWrapper isLoading={stastQuery.isFetching} fullWidth={true}>
        <StatCard
          formatter={formatter}
          value={balance}
          tittle="balance"
          icon={
            <Wallet className=" h-12 w-12 items-center rounded-lg p-2 text-violet-500 bg-violet-400/10" />
          }
        />
      </SkeletonWrapper>
    </div>
  );
}

export default StatsCards;

function StatCard({
  formatter,
  value,
  icon,
  tittle,
}: {
  formatter: Intl.NumberFormat;
  icon: ReactNode;
  tittle: string;
  value: number;
}) {
  const formatFn = useCallback(
    (value: number) => {
      return formatter.format(value);
    },
    [formatter]
  );
  return (
    <Card className="flex h-24 w-full items-center gap-2 p-4">
      <div className="flex flex-col items-start gap-0">
        <p className="text-muted-foreground ">{tittle}</p>
        <CountUp
          preserveValue
          redraw={false}
          end={value}
          decimals={2}
          formattingFn={formatFn}
          className="text-2xl"
        />
      </div>
    </Card>
  );
}
