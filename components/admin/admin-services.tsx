"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Loader2,
  Search,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { AdminPagination } from "@/components/admin/admin-pagination"
import { EmptyState } from "@/components/bookings/empty-state"
import { Modal } from "@/components/bookings/modal"
import { ApiError, api, type Pagination } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import {
  EMPTY_ADMIN_PAGINATION,
  formatAdminDate,
} from "@/lib/admin"
import {
  formatServicePrice,
  serviceImage,
  vendorLabel,
  type Service,
} from "@/lib/services"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20
type StatusFilter = "all" | Service["status"]

interface ListResult {
  key: string
  items: Service[]
  pagination: Pagination
  error: string | null
}

const statusStyles: Record<Service["status"], string> = {
  approved: "bg-emerald-500/10 text-emerald-700",
  pending: "bg-amber-500/15 text-amber-800",
  rejected: "bg-destructive/10 text-destructive",
}

const filters: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
]

/** Admin moderation queue for every service, regardless of vendor. */
export function AdminServices() {
  const { data: session } = authClient.useSession()
  const canManage = session?.user?.role === "admin"

  const [status, setStatus] = useState<StatusFilter>("all")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<ListResult | null>(null)

  const [rejectTarget, setRejectTarget] = useState<Service | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
  const [reason, setReason] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput])

  const requestKey = `${status}|${search}|${page}|${reloadKey}`
  const isLoading = !result || result.key !== requestKey
  const services = isLoading ? [] : (result?.items ?? [])
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
    if (status !== "all") params.set("status", status)
    if (search) params.set("search", search)

    api
      .get<Service[]>(`/admin/services?${params.toString()}`, {
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
      .catch((failure: unknown) => {
        if (controller.signal.aborted) return

        setResult({
          key: requestKey,
          items: [],
          pagination: EMPTY_ADMIN_PAGINATION,
          error:
            failure instanceof ApiError
              ? failure.message
              : "We could not load services.",
        })
      })

    return () => controller.abort()
  }, [page, reloadKey, requestKey, search, status])

  const refresh = () => setReloadKey((value) => value + 1)

  const approve = async (service: Service) => {
    setBusyId(service._id)

    try {
      await api.patch<Service>(`/admin/services/${service._id}`, {
        status: "approved",
        isActive: true,
      })
      toast.success(`${service.serviceName} is now public.`)
      refresh()
    } catch (failure) {
      toast.error(
        failure instanceof ApiError
          ? failure.message
          : "We could not approve this service.",
      )
    } finally {
      setBusyId(null)
    }
  }

  const confirmReject = async () => {
    if (!rejectTarget) return

    setBusyId(rejectTarget._id)

    try {
      await api.patch<Service>(`/admin/services/${rejectTarget._id}`, {
        status: "rejected",
        isActive: false,
        rejectionReason: reason.trim() || undefined,
      })
      toast.success(`${rejectTarget.serviceName} has been rejected.`)
      setRejectTarget(null)
      setReason("")
      refresh()
    } catch (failure) {
      toast.error(
        failure instanceof ApiError
          ? failure.message
          : "We could not reject this service.",
      )
    } finally {
      setBusyId(null)
    }
  }

  const toggleAvailability = async (service: Service) => {
    setBusyId(service._id)

    try {
      await api.patch<Service>(`/admin/services/${service._id}`, {
        isActive: !service.isActive,
      })
      toast.success(
        service.isActive
          ? `${service.serviceName} is now hidden.`
          : `${service.serviceName} is now active.`,
      )
      refresh()
    } catch (failure) {
      toast.error(
        failure instanceof ApiError
          ? failure.message
          : "We could not update this service.",
      )
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setBusyId(deleteTarget._id)

    try {
      await api.delete(`/admin/services/${deleteTarget._id}`)
      toast.success(`${deleteTarget.serviceName} has been deleted.`)
      setDeleteTarget(null)
      refresh()
    } catch (failure) {
      toast.error(
        failure instanceof ApiError
          ? failure.message
          : "We could not delete this service.",
      )
    } finally {
      setBusyId(null)
    }
  }

  const changeStatus = (next: StatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-foreground sm:text-4xl">
          Service moderation
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Approve new listings, hide or restore published services, and remove
          content that breaks the marketplace rules.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter services by status">
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

        <label className="relative lg:w-72">
          <span className="sr-only">Search services</span>
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or location…"
            className="h-10 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-wedplan-primary"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Loading services">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl border border-border bg-card/60"
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
              onClick={refresh}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert size={24} />}
          title="No services found"
          description="Try another status tab or search term. New vendor listings appear here automatically."
        />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Visibility</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={serviceImage(service)}
                          alt=""
                          width={44}
                          height={44}
                          className="size-11 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {service.serviceName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {service.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate text-foreground">
                        {vendorLabel(service)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {service.location}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground">
                      {formatServicePrice(service.price, service.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
                          statusStyles[service.status],
                        )}
                      >
                        {service.status}
                      </span>
                      {service.rejectionReason ? (
                        <p
                          className="mt-1 max-w-44 truncate text-xs text-muted-foreground"
                          title={service.rejectionReason}
                        >
                          {service.rejectionReason}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {service.isActive ? "Active" : "Hidden"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatAdminDate(service.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3 text-xs font-semibold whitespace-nowrap">
                        {canManage ? (
                          <>
                            {service.status !== "approved" ? (
                              <button
                                type="button"
                                onClick={() => approve(service)}
                                disabled={busyId === service._id}
                                className="inline-flex items-center gap-1 text-emerald-700 hover:underline disabled:opacity-50"
                              >
                                <CheckCircle2 size={13} />
                                Approve
                              </button>
                            ) : null}
                            {service.status !== "rejected" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectTarget(service)
                                  setReason("")
                                }}
                                disabled={busyId === service._id}
                                className="inline-flex items-center gap-1 text-amber-700 hover:underline disabled:opacity-50"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => toggleAvailability(service)}
                              disabled={busyId === service._id}
                              className="text-wedplan-primary hover:underline disabled:opacity-50"
                            >
                              {service.isActive ? "Hide" : "Activate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(service)}
                              disabled={busyId === service._id}
                              className="inline-flex items-center gap-1 text-destructive hover:underline disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-muted-foreground">View only</span>
                        )}
                      </div>
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
              label={`${pagination.total} ${pagination.total === 1 ? "service" : "services"}`}
            />
          </div>
        </div>
      )}

      <Modal
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        title="Reject this service?"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRejectTarget(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmReject}
              disabled={busyId !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
            >
              {busyId ? <Loader2 size={14} className="animate-spin" /> : null}
              Reject service
            </button>
          </>
        }
      >
        {rejectTarget ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">
                {rejectTarget.serviceName}
              </span>{" "}
              will be hidden from the marketplace. You can leave the vendor an
              optional reason to help them fix the listing.
            </p>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                Reason for rejection (optional)
              </span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={300}
                rows={4}
                placeholder="Explain what needs to be changed…"
                className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-wedplan-primary"
              />
              <span className="mt-1 block text-right text-xs text-muted-foreground">
                {reason.length}/300
              </span>
            </label>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this service?"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={busyId !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:opacity-60"
            >
              {busyId ? <Loader2 size={14} className="animate-spin" /> : null}
              Delete permanently
            </button>
          </>
        }
      >
        {deleteTarget ? (
          <p className="text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">
              {deleteTarget.serviceName}
            </span>{" "}
            and its images will be removed from WedPlan. This cannot be undone.
          </p>
        ) : null}
      </Modal>
    </section>
  )
}
