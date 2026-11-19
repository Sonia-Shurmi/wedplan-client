"use client"

import { useEffect, useState } from "react"
import {
  Ban,
  CheckCircle2,
  Eye,
  Loader2,
  Search,
  ShieldAlert,
  TriangleAlert,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/bookings/empty-state"
import { Modal } from "@/components/bookings/modal"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { ApiError, api, type Pagination } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import {
  EMPTY_ADMIN_PAGINATION,
  formatAdminDate,
  roleText,
  type AdminUser,
  type AdminUserDetail,
} from "@/lib/admin"
import type { UserRole } from "@/lib/constants"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20
type RoleFilter = "all" | UserRole

interface ListResult {
  key: string
  items: AdminUser[]
  pagination: Pagination
  error: string | null
}

export function AdminUsers() {
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id
  const canManage = session?.user?.role === "admin"

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<RoleFilter>("all")
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)

  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [blockTarget, setBlockTarget] = useState<{
    user: AdminUser
    next: boolean
  } | null>(null)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const requestKey = `${search}|${role}|${page}|${reloadKey}`
  const isLoading = !result || result.key !== requestKey
  const users = isLoading ? [] : (result?.items ?? [])
  const pagination = isLoading
    ? EMPTY_ADMIN_PAGINATION
    : (result?.pagination ?? EMPTY_ADMIN_PAGINATION)
  const error = isLoading ? null : (result?.error ?? null)

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    })
    if (search) params.set("search", search)
    if (role !== "all") params.set("role", role)

    api
      .get<AdminUser[]>(`/admin/users?${params.toString()}`, {
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted) return

        setResult({
          key: requestKey,
          items: response.data ?? [],
          pagination: response.pagination ?? EMPTY_ADMIN_PAGINATION,
          error: null,
        })
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return

        setResult({
          key: requestKey,
          items: [],
          pagination: EMPTY_ADMIN_PAGINATION,
          error:
            reason instanceof ApiError
              ? reason.message
              : "We could not load users.",
        })
      })

    return () => controller.abort()
  }, [page, role, reloadKey, requestKey, search])

  const openDetail = async (id: string) => {
    setDetail(null)
    setDetailLoading(true)

    try {
      const response = await api.get<AdminUserDetail>(`/admin/users/${id}`)
      setDetail(response.data ?? null)
    } catch (reason) {
      toast.error(
        reason instanceof ApiError
          ? reason.message
          : "We could not load this user's profile.",
      )
    } finally {
      setDetailLoading(false)
    }
  }

  const confirmBlock = async () => {
    if (!blockTarget) return

    setBusyUserId(blockTarget.user._id)

    try {
      const response = await api.patch<AdminUserDetail>(
        `/admin/users/${blockTarget.user._id}/block`,
        { isBlocked: blockTarget.next },
      )
      toast.success(
        blockTarget.next
          ? `${blockTarget.user.name} has been blocked.`
          : `${blockTarget.user.name} has been unblocked.`,
      )
      setBlockTarget(null)
      if (detail?._id === blockTarget.user._id && response.data) {
        setDetail(response.data)
      }
      setReloadKey((value) => value + 1)
    } catch (reason) {
      toast.error(
        reason instanceof ApiError
          ? reason.message
          : "We could not update this account.",
      )
    } finally {
      setBusyUserId(null)
    }
  }

  const resetFilters = () => {
    setSearchInput("")
    setRole("all")
    setPage(1)
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-foreground sm:text-4xl">
          Users
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review everyone on WedPlan, check their activity and restrict accounts
          that break the marketplace rules.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search users by name or email</span>
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or email…"
            className="h-10 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-wedplan-primary"
          />
        </label>
        <label>
          <span className="sr-only">Filter by role</span>
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value as RoleFilter)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-wedplan-primary"
          >
            <option value="all">All roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Administrators</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading users">
          {[0, 1, 2, 3].map((index) => (
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
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title="No users found"
          description="Try a different name, email or role filter."
          action={
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => {
                const isSelf = user._id === currentUserId

                return (
                  <tr key={user._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wedplan-sage/40 text-xs font-semibold text-wedplan-dark">
                          {user.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {roleText(user.role)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.subscriptionPlan === "premium" ? "Premium" : "Free"}
                    </td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-destructive uppercase">
                          <Ban size={11} />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase">
                          <CheckCircle2 size={11} />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatAdminDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => openDetail(user._id)}
                          className="inline-flex items-center gap-1 text-wedplan-primary hover:underline"
                        >
                          <Eye size={13} />
                          View
                        </button>
                        {canManage && !isSelf ? (
                          <button
                            type="button"
                            onClick={() =>
                              setBlockTarget({ user, next: !user.isBlocked })
                            }
                            className={cn(
                              "hover:underline",
                              user.isBlocked
                                ? "text-emerald-700"
                                : "text-destructive",
                            )}
                          >
                            {user.isBlocked ? "Unblock" : "Block"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="px-4 py-4">
            <AdminPagination
              pagination={pagination}
              onPageChange={setPage}
              label={`${pagination.total} ${pagination.total === 1 ? "user" : "users"}`}
            />
          </div>
        </div>
      )}

      <Modal
        open={detailLoading || detail !== null}
        onClose={() => setDetail(null)}
        title="User profile"
      >
        {detailLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading profile">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : detail ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-wedplan-sage/40 font-semibold text-wedplan-dark">
                {detail.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-heading text-xl text-foreground">
                  {detail.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {detail.email}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <dt className="text-xs text-muted-foreground">Role</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {roleText(detail.role)}
                </dd>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <dt className="text-xs text-muted-foreground">Plan</dt>
                <dd className="mt-1 font-medium text-foreground capitalize">
                  {detail.subscriptionPlan}
                </dd>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <dt className="text-xs text-muted-foreground">Services</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {detail.services} ({detail.pendingServices} pending)
                </dd>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <dt className="text-xs text-muted-foreground">Bookings</dt>
                <dd className="mt-1 font-medium text-foreground">
                  {detail.bookings} ({detail.acceptedBookings} accepted)
                </dd>
              </div>
            </dl>

            {detail.businessName ? (
              <p className="text-sm text-muted-foreground">
                Business: <span className="text-foreground">{detail.businessName}</span>
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Joined {formatAdminDate(detail.createdAt)}
              {detail.isBlocked ? " · Account is blocked" : ""}
            </p>

            {canManage && detail._id !== currentUserId ? (
              <button
                type="button"
                onClick={() =>
                  setBlockTarget({ user: detail, next: !detail.isBlocked })
                }
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors",
                  detail.isBlocked
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : "bg-destructive hover:bg-destructive/90",
                )}
              >
                {detail.isBlocked ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <ShieldAlert size={15} />
                )}
                {detail.isBlocked ? "Unblock account" : "Block account"}
              </button>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={blockTarget !== null}
        onClose={() => setBlockTarget(null)}
        title={blockTarget?.next ? "Block this user?" : "Unblock this user?"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setBlockTarget(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmBlock}
              disabled={busyUserId !== null}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60",
                blockTarget?.next
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-emerald-700 hover:bg-emerald-800",
              )}
            >
              {busyUserId ? <Loader2 size={14} className="animate-spin" /> : null}
              {blockTarget?.next ? "Block account" : "Unblock account"}
            </button>
          </>
        }
      >
        {blockTarget ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {blockTarget.next
              ? `${blockTarget.user.name} will lose access to all protected pages and APIs immediately. Their dashboard sessions will be blocked on the next request.`
              : `${blockTarget.user.name} will be able to sign in and use WedPlan again immediately.`}
          </p>
        ) : null}
      </Modal>
    </section>
  )
}
