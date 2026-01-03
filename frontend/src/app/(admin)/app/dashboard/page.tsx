"use client";

import React, { useMemo } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Alert from "@/components/ui/alert/Alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useAccountsByUser } from "@/api/accounts.hooks";
import { useCreditCardsByUser } from "@/api/creditCards.hooks";
import { useTransactionsByUser } from "@/api/transactions.hooks";
import { getApiErrorMessage } from "@/api/errorHandling";
import { useTranslation } from "react-i18next";

const formatAmount = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0.00";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numeric) ? String(value) : numeric.toFixed(2);
};

export default function DashboardPage() {
  const { t } = useTranslation([
    "resource-dashboard",
    "resource-common",
    "resource-accounts",
    "resource-creditCards",
    "resource-transactions",
  ]);
  const { userId } = useAuth();
  const accountsQuery = useAccountsByUser(userId);
  const creditCardsQuery = useCreditCardsByUser(userId);
  const transactionsQuery = useTransactionsByUser(userId, {
    limit: 5,
    sort: "date",
    order: "desc",
  });

  const accounts = accountsQuery.data?.data ?? [];
  const creditCards = creditCardsQuery.data?.data ?? [];
  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts]
  );
  const cardMap = useMemo(
    () => new Map(creditCards.map((card) => [card.id, card.name])),
    [creditCards]
  );

  const recentTransactions = useMemo(() => {
    const grouped = transactionsQuery.data?.data ?? [];
    const flattened = grouped.flatMap((group) => group.transactions ?? []);
    return flattened
      .slice()
      .sort(
        (left, right) =>
          new Date(right.date).getTime() - new Date(left.date).getTime()
      )
      .slice(0, 5);
  }, [transactionsQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {t("resource.dashboard.title")}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard
          title={t("resource.dashboard.accounts.title")}
          desc={t("resource.dashboard.accounts.desc")}
        >
          {accountsQuery.isError && (
            <Alert
              variant="error"
              title={t("resource.dashboard.accounts.unavailable")}
              message={getApiErrorMessage(
                accountsQuery.error,
                t("resource.common.errors.generic")
              )}
            />
          )}
          {!accountsQuery.isError && accountsQuery.isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("resource.dashboard.accounts.loading")}
            </p>
          )}
          {!accountsQuery.isError && !accountsQuery.isLoading && (
            <div className="space-y-3">
              {accounts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("resource.dashboard.accounts.empty")}
                </p>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {account.name ||
                          t("resource.dashboard.accounts.unnamed")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {account.type}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {formatAmount(account.balance)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </ComponentCard>

        <ComponentCard
          title={t("resource.dashboard.creditCards.title")}
          desc={t("resource.dashboard.creditCards.desc")}
        >
          {creditCardsQuery.isError && (
            <Alert
              variant="error"
              title={t("resource.dashboard.creditCards.unavailable")}
              message={getApiErrorMessage(
                creditCardsQuery.error,
                t("resource.common.errors.generic")
              )}
            />
          )}
          {!creditCardsQuery.isError && creditCardsQuery.isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("resource.dashboard.creditCards.loading")}
            </p>
          )}
          {!creditCardsQuery.isError && !creditCardsQuery.isLoading && (
            <div className="space-y-3">
              {creditCards.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("resource.dashboard.creditCards.empty")}
                </p>
              ) : (
                creditCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {card.name || t("resource.dashboard.creditCards.unnamed")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {card.flag}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {formatAmount(card.balance)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </ComponentCard>
      </div>

      <ComponentCard
        title={t("resource.dashboard.recentTransactions.title")}
        desc={t("resource.dashboard.recentTransactions.desc")}
      >
        {transactionsQuery.isError && (
          <Alert
            variant="error"
            title={t("resource.dashboard.recentTransactions.unavailable")}
            message={getApiErrorMessage(
              transactionsQuery.error,
              t("resource.common.errors.generic")
            )}
          />
        )}
        {!transactionsQuery.isError && transactionsQuery.isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("resource.dashboard.recentTransactions.loading")}
          </p>
        )}
        {!transactionsQuery.isError && !transactionsQuery.isLoading && (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.dashboard.recentTransactions.table.date")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t(
                        "resource.dashboard.recentTransactions.table.description"
                      )}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.dashboard.recentTransactions.table.source")}
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {t("resource.dashboard.recentTransactions.table.amount")}
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {t("resource.dashboard.recentTransactions.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((transaction) => {
                      const sourceLabel =
                        transaction.transactionSource === "account"
                          ? accountMap.get(transaction.accountId ?? -1) ||
                            t("resource.dashboard.recentTransactions.source.account")
                          : cardMap.get(transaction.creditCardId ?? -1) ||
                            t("resource.dashboard.recentTransactions.source.card");
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                            {transaction.observation ||
                              t(
                                "resource.dashboard.recentTransactions.fallbackTransaction"
                              )}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {sourceLabel}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                            {formatAmount(transaction.value)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
