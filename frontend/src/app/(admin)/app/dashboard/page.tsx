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

const formatAmount = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0.00";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isNaN(numeric) ? String(value) : numeric.toFixed(2);
};

export default function DashboardPage() {
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
          Dashboard
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard title="Accounts" desc="Current balances">
          {accountsQuery.isError && (
            <Alert
              variant="error"
              title="Accounts unavailable"
              message={getApiErrorMessage(accountsQuery.error)}
            />
          )}
          {!accountsQuery.isError && accountsQuery.isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading accounts...
            </p>
          )}
          {!accountsQuery.isError && !accountsQuery.isLoading && (
            <div className="space-y-3">
              {accounts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No accounts found.
                </p>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {account.name || "Unnamed account"}
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

        <ComponentCard title="Credit Cards" desc="Current balances">
          {creditCardsQuery.isError && (
            <Alert
              variant="error"
              title="Cards unavailable"
              message={getApiErrorMessage(creditCardsQuery.error)}
            />
          )}
          {!creditCardsQuery.isError && creditCardsQuery.isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading credit cards...
            </p>
          )}
          {!creditCardsQuery.isError && !creditCardsQuery.isLoading && (
            <div className="space-y-3">
              {creditCards.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No credit cards found.
                </p>
              ) : (
                creditCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {card.name || "Unnamed card"}
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

      <ComponentCard title="Recent Transactions" desc="Latest 5 updates">
        {transactionsQuery.isError && (
          <Alert
            variant="error"
            title="Transactions unavailable"
            message={getApiErrorMessage(transactionsQuery.error)}
          />
        )}
        {!transactionsQuery.isError && transactionsQuery.isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading transactions...
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
                      Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Description
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Source
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No recent transactions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((transaction) => {
                      const sourceLabel =
                        transaction.transactionSource === "account"
                          ? accountMap.get(transaction.accountId ?? -1) ||
                            "Account"
                          : cardMap.get(transaction.creditCardId ?? -1) ||
                            "Credit Card";
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                            {transaction.observation || "Transaction"}
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
