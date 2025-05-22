// HistoryPeriodSelector.tsx
"use client";

import { getHistoryPeriodsResponseType } from "@/app/api/history-periods/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Period, Timeframe } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface Props {
  period: Period;
  setPeriod: (period: Period) => void;
  timeFrame: Timeframe;
  setTimeframe: (Timeframe: Timeframe) => void;
}

function HistoryPeriodSelector({
  period,
  setPeriod,
  timeFrame,
  setTimeframe,
}: Props) {
  // --- DEBUG LOGS START ---
  console.log("HistoryPeriodSelector.tsx: HistoryPeriodSelector rendering");
  console.log("HistoryPeriodSelector.tsx: received period prop:", period);
  // --- DEBUG LOGS END ---

  const historyPeriods = useQuery<getHistoryPeriodsResponseType>({
    queryKey: ["overview", "history", "periods"],
    queryFn: () => fetch(`/api/history-periods`).then((res) => res.json()),
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SkeletonWrapper isLoading={historyPeriods.isFetching} fullWidth={false}>
        <Tabs
          value={timeFrame}
          onValueChange={(value) => setTimeframe(value as Timeframe)}
        >
          <TabsList>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </SkeletonWrapper>
      <div className="flex flex-wrap items-center gap-2">
        <SkeletonWrapper
          isLoading={historyPeriods.isFetching}
          fullWidth={false}
        >
          <YearSelector
            period={period}
            setPeriod={setPeriod}
            years={historyPeriods.data || []}
          />
        </SkeletonWrapper>
        {timeFrame === "month" && (
          <SkeletonWrapper
            isLoading={historyPeriods.isFetching}
            fullWidth={false}
          >
            <MonthSelector period={period} setPeriod={setPeriod} />
          </SkeletonWrapper>
        )}
      </div>
    </div>
  );
}

export default HistoryPeriodSelector;

function YearSelector({
  period,
  setPeriod,
  years,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
  years: getHistoryPeriodsResponseType;
}) {
  // --- DEBUG LOGS START ---
  console.log("HistoryPeriodSelector.tsx: YearSelector rendering");
  console.log(
    "HistoryPeriodSelector.tsx: received period prop in YearSelector:",
    period
  );
  // --- DEBUG LOGS END ---

  // Temporarily add a safety check to avoid crashing if period is truly undefined
  if (!period) {
    console.error("YearSelector: period is undefined on render!");
    return null; // Don't render if period is missing
  }

  return (
    <Select
      value={period.year.toString()}
      onValueChange={(value) => {
        setPeriod({
          month: period.month,
          year: parseInt(value),
        });
      }}
    >
      <SelectTrigger className="w-[120px]">
        {" "}
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectTrigger>
    </Select>
  );
}

function MonthSelector({
  period,
  setPeriod,
}: {
  period: Period;
  setPeriod: (period: Period) => void;
}) {
  // --- DEBUG LOGS START (Keep these for now, they are harmless) ---
  console.log("HistoryPeriodSelector.tsx: MonthSelector rendering");
  console.log(
    "HistoryPeriodSelector.tsx: received period prop in MonthSelector:",
    period
  );
  // --- DEBUG LOGS END ---

  // Temporarily added safety check - can be removed once the main error is gone
  if (!period) {
    console.error("MonthSelector: period is undefined on render!");
    return null; // Don't render if period is missing
  }

  return (
    <Select
      value={period.month.toString()}
      onValueChange={(value) => {
        setPeriod({
          year: period.year,
          month: parseInt(value),
        });
      }} // <-- Ensure this is correctly closed: '}}'
    >
      <SelectTrigger className="w-[120px]">
        {" "}
        {/* The empty space here is harmless, but can be removed */}
        <SelectContent>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((monthIndex) => {
            const monthName = new Date(
              period.year, // Using period.year here, ensure it's not undefined in a later stage
              monthIndex,
              1
            ).toLocaleString("default", { month: "long" });

            return (
              <SelectItem key={monthIndex} value={monthIndex.toString()}>
                {monthName}
              </SelectItem>
            );
          })}
        </SelectContent>
      </SelectTrigger>
    </Select>
  );
}
