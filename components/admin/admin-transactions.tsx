"use client"

import { useEffect, useState } from "react"
import {
  BadgeDollarSign,
  CheckCircle2,
  ReceiptText,
  TriangleAlert,
} from "lucide-react"

import { AdminPagination } from "@/components/admin/admin-pagination"
import { EmptyState } from "@/components/bookings/empty-state"
import { ApiError, api, type Pagination } from "@/lib/api"
import {
  EMPTY_ADMIN_PAGINATION,
  formatAdminDate,
  formatTransactionAmount,
  isSuccessfulStatus,
  transactionStatusText,
  type AdminTransaction,
  type AdminTransactionSummary,
} from "@/lib/admin"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20
type StatusFilter = "all" | "succeeded" | "pending" | "failed"

interface ListResult {
  key: string
  items: AdminTransaction[]
  pagination: Pagination
  summary: AdminTransactionSummary
  error: string | null
}

const EMPTY_SUMMARY: AdminTransactionSummary = {
  count: 0,
  successfulCount: 0,
  revenueCents: 0,
}

const filters: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "succeeded", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
]

/** Read-only ledger; every row was written by the verified Stripe webhook. */
export function AdminTransactions() {
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)

  const requestKey = `${status}|${page}|${reloadKey}`
  const isLoading = !result || result.key !== requestKey
  const transactions = isLoading ? [] : (result?.items ?? [])
  const pagination = isLoading
    ? EMPTY_ADMIN_PAGINATION
    : (result?.pagination ?? EMPTY_ADMIN_PAGINATION)
  const summary = isLoading
    ? EMPTY_SUMMARY
    : (result?.summary ?? EMPTY_SUMMARY)
  const error = isLoading ? null : (result?.error ?? null)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    })
    if (status !== "all") params.set("status", status)

    api
      .get<AdminTransaction[]>(`/admin/transactions?${params.toString()}`, {
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted) return

        const payload = response as typeof response & {
          summary?: AdminTransactionSummary
        }

        setResult({
          key: requestKey,
          items: response.data ?? [],
          pagination: response.pagination ?? EMPTY_ADMIN_PAGINATION,
          summary: payload.summary ?? EMPTY_SUMMARY,
          error: null,
        })
      })
      .catch((failure: unknown) => {
        if (controller.signal.aborted) return

        setResult({
          key: requestKey,
          items: [],
          pagination: EMPTY_ADMIN_PAGINATION,
          summary: EMPTY_SUMMARY,
          error:
            failure instanceof ApiError
              ? failure.message
              : "We could not load transactions.",
        })
      })

    return () => controller.abort()
  }, [page, reloadKey, requestKey, status])

  const changeStatus = (next: StatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-foreground sm:text-4xl">
          Transactions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          A read-only record of Premium upgrades. Only payments confirmed by
          Stripe&apos;s webhook appear here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Records
          </p>
          <p className="mt-2 font-heading text-3xl text-foreground">
            {summary.count}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Successful
          </p>
          <p className="mt-2 font-heading text-3xl text-foreground">
            {summary.successfulCount}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-wedplan-sage/20 p-5">
          <p className="text-xs font-semibold tracking-wide text-wedplan-muted uppercase">
            Revenue
          </p>
          <p className="mt-2 font-heading text-3xl text-wedplan-dark">
            {formatTransactionAmount(summary.revenueCents, "USD")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter transactions by status">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => changeStatus(filter.value)}
            aria-pressed={status === filter.value}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              status === filter.value
                ? "border-wedplan-primary bg-wedplan-primary text-white"
                : "border-wedplan-sage/70 bg-card text-muted-foreground hover:border-wedplan-muted hover:text-foreground",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading transactions">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
        >
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<ReceiptText size={24} />}
          title="No transactions yet"
          description={
            status === "all"
              ? "Premium payments confirmed by Stripe will be recorded here automatically."
              : "No transactions match this status filter."
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Stripe session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {transaction.vendorName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {transaction.vendorEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {transaction.plan}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-foreground">
                      {formatTransactionAmount(
                        transaction.amount,
                        transaction.currency,
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
                          isSuccessfulStatus(transaction.status)
                            ? "bg-emerald-500/10 text-emerald-700"
                            : transaction.status.toLowerCase() === "failed"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/15 text-amber-800",
                        )}
                      >
                        {isSuccessfulStatus(transaction.status) ? (
                          <CheckCircle2 size={11} />
                        ) : null}
                        {transactionStatusText(transaction.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatAdminDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {transaction.stripeSessionId || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-4">
            <AdminPagination
              pagination={pagination}
              onPageChange={setPage}
              label={`${pagination.total} ${pagination.total === 1 ? "transaction" : "transactions"}`}
            />
          </div>
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <BadgeDollarSign size={14} />
        This ledger is intentionally read-only. There are no edit or delete
        controls.
      </p>
    </section>
  )
}
