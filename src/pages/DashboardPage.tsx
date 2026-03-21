import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardChartsSection } from "@/components/dashboard/DashboardChartsSection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardKpiSection } from "@/components/dashboard/DashboardKpiSection";
import { DashboardLatestTransactionsCard } from "@/components/dashboard/DashboardLatestTransactionsCard";
import { ForecastCard } from "@/components/dashboard/ForecastCard";
import { SeedExportPanel } from "@/components/dashboard/SeedExportPanel";
import { useCategorySummary } from "@/hooks/useCategorySummary";
import { useForecast } from "@/hooks/useSummary";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import { useSummary } from "@/hooks/useSummary";
import { useTransactions } from "@/hooks/useTransactions";
import type { ListTransactionsParams } from "@/types/transaction";
import { toMonthParam } from "@/utils/date";
import {
  PeriodSelector,
  type PeriodKey,
  extractMonthYearFromParam,
} from "@/components/PeriodSelector";

function monthFromPeriodKey(period: PeriodKey, specificMonth?: string) {
  const now = new Date();
  if (period === "previous") {
    const prev = new Date(now);
    prev.setMonth(prev.getMonth() - 1);
    return toMonthParam(prev);
  }
  if (period === "specific" && specificMonth) {
    return specificMonth;
  }
  return toMonthParam(now);
}

function transactionFiltersFromPeriod(
  period: PeriodKey,
  specificMonth?: string,
): ListTransactionsParams {
  if (period === "7d" || period === "30d") {
    const days = period === "7d" ? 7 : 30;
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
      page: 1,
      limit: 5,
    };
  }

  return {
    month: monthFromPeriodKey(period, specificMonth),
    page: 1,
    limit: 5,
  };
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const periodParam = searchParams.get("period");
  const activePeriod: PeriodKey =
    periodParam === "7d" ||
    periodParam === "30d" ||
    periodParam === "previous" ||
    periodParam === "month" ||
    periodParam?.includes("-")
      ? periodParam.includes("-")
        ? "specific"
        : (periodParam as PeriodKey)
      : "month";

  const { month: specificMonth } = extractMonthYearFromParam(periodParam);

  const transactionsFilters = useMemo(
    () => transactionFiltersFromPeriod(activePeriod, specificMonth),
    [activePeriod, specificMonth],
  );

  const summaryQuery = useSummary({
    period: activePeriod === "specific" ? undefined : activePeriod,
    month: activePeriod === "specific" ? specificMonth : undefined,
  });
  const monthlyQuery = useMonthlySummary();
  const categoryQuery = useCategorySummary({
    period: activePeriod === "specific" ? undefined : activePeriod,
    month: activePeriod === "specific" ? specificMonth : undefined,
  });
  const latestTransactionsQuery = useTransactions(transactionsFilters);
  const forecastQuery = useForecast();

  const summary = summaryQuery.data;
  const latestTransactions = latestTransactionsQuery.data?.data ?? [];

  const handlePeriodChange = (period: PeriodKey, newSpecificMonth?: string) => {
    const next = new URLSearchParams(searchParams);
    if (period === "specific" && newSpecificMonth) {
      next.set("period", newSpecificMonth);
    } else {
      next.set("period", period);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div>
      <DashboardHeader />
      <PeriodSelector
        activePeriod={activePeriod}
        specificMonth={specificMonth}
        onPeriodChange={handlePeriodChange}
      />
      <DashboardKpiSection
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        summary={summary}
        onRetry={summaryQuery.refetch}
      />
      <DashboardChartsSection
        monthly={{
          isLoading: monthlyQuery.isLoading,
          isError: monthlyQuery.isError,
          data: monthlyQuery.data,
          refetch: monthlyQuery.refetch,
        }}
        category={{
          isLoading: categoryQuery.isLoading,
          isError: categoryQuery.isError,
          data: categoryQuery.data,
          refetch: categoryQuery.refetch,
        }}
      />
      <ForecastCard
        isLoading={forecastQuery.isLoading}
        isError={forecastQuery.isError}
        forecast={forecastQuery.data}
        onRetry={forecastQuery.refetch}
      />
      <DashboardLatestTransactionsCard
        isLoading={latestTransactionsQuery.isLoading}
        isError={latestTransactionsQuery.isError}
        transactions={latestTransactions}
        onRetry={latestTransactionsQuery.refetch}
      />
      <SeedExportPanel />
    </div>
  );
}
