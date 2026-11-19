"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Inbox, TriangleAlert } from "lucide-react"

import { api, type Pagination } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { CATEGORIES } from "@/lib/constants"
import {
  EMPTY_PAGINATION,
  isServiceSort,
  type Service,
  type ServiceSort,
} from "@/lib/services"
import ServiceCard from "./service-card"
import ServiceFilters from "./service-filters"

const PAGE_SIZE = 9

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-wedplan-sage/60 bg-card">
      <div className="aspect-[4/3] animate-pulse bg-wedplan-sage/30" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded bg-muted" />
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="h-9 w-28 animate-pulse rounded bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export default function ServiceBrowser() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const rawSearch = searchParams.get("search") ?? ""
  const rawLocation = searchParams.get("location") ?? ""
  const rawCategory = searchParams.get("category") ?? ""
  const rawSort = searchParams.get("sort") ?? "newest"
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10)

  const search = rawSearch.trim()
  const location = rawLocation.trim()
  const category = CATEGORIES.some((item) => item.name === rawCategory)
    ? rawCategory
    : ""
  const sort: ServiceSort = isServiceSort(rawSort) ? rawSort : "newest"
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  const [searchInput, setSearchInput] = useState(search)
  const [locationInput, setLocationInput] = useState(location)
  const [lastSearch, setLastSearch] = useState(search)
  const [lastLocation, setLastLocation] = useState(location)
  const [services, setServices] = useState<Service[]>([])
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION)
  const [error, setError] = useState<string | null>(null)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // React's "adjust state when props change" pattern. Keeping the fields in
  // sync during render avoids a cascading-render effect (and keeps focus).
  if (search !== lastSearch) {
    setLastSearch(search)
    setSearchInput(search)
  }
  if (location !== lastLocation) {
    setLastLocation(location)
    setLocationInput(location)
  }

  const buildHref = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      const query = params.toString()

      return query ? `${pathname}?${query}` : pathname
    },
    [pathname, searchParams],
  )

  // Debounce only the keyword field; the Search button commits immediately.
  useEffect(() => {
    if (searchInput === search) {
      return
    }

    const timer = window.setTimeout(() => {
      router.replace(
        buildHref({ search: searchInput.trim() || null, page: null }),
        { scroll: false },
      )
    }, 400)

    return () => window.clearTimeout(timer)
  }, [searchInput, search, buildHref, router])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (category) params.set("category", category)
    if (location) params.set("location", location)
    if (sort !== "newest") params.set("sort", sort)
    params.set("page", String(page))
    params.set("limit", String(PAGE_SIZE))

    return params.toString()
  }, [search, category, location, sort, page])

  const requestKey = `${queryString}|${reloadKey}`
  const isLoading = loadedKey !== requestKey
  const isError = !isLoading && error !== null
  const isReady = !isLoading && !isError

  useEffect(() => {
    const controller = new AbortController()

    api
      .publicGet<Service[]>(`/services?${queryString}`, {
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted) return

        setServices(response.data ?? [])
        setPagination(response.pagination ?? EMPTY_PAGINATION)
        setError(null)
        setLoadedKey(requestKey)
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return

        setError(
          reason instanceof Error
            ? reason.message
            : "We could not load services. Please try again.",
        )
        setLoadedKey(requestKey)
      })

    return () => controller.abort()
  }, [queryString, requestKey])

  const goToPage = (nextPage: number) =>
    router.push(buildHref({ page: String(nextPage) }), { scroll: false })

  const clearFilters = () => {
    setSearchInput("")
    setLocationInput("")
    router.push(pathname, { scroll: false })
  }

  const detailHref = (id: string) =>
    session?.user
      ? `/services/${id}`
      : `/sign-in?callbackUrl=${encodeURIComponent(`/services/${id}`)}`

  const isFiltered = Boolean(
    search || category || location || sort !== "newest",
  )

  return (
    <div className="space-y-8">
      <ServiceFilters
        search={searchInput}
        location={locationInput}
        category={category}
        sort={sort}
        onSearchChange={setSearchInput}
        onLocationChange={setLocationInput}
        onCategoryChange={(value) =>
          router.push(buildHref({ category: value || null, page: null }), {
            scroll: false,
          })
        }
        onSortChange={(value) =>
          router.push(
            buildHref({ sort: value === "newest" ? null : value, page: null }),
            { scroll: false },
          )
        }
        onSubmit={() =>
          router.push(
            buildHref({
              search: searchInput.trim() || null,
              location: locationInput.trim() || null,
              page: null,
            }),
            { scroll: false },
          )
        }
        onClear={clearFilters}
        isFiltered={isFiltered}
      />

      <div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {isReady ? (
            <>
              Showing <strong className="text-foreground">{services.length}</strong>{" "}
              of <strong className="text-foreground">{pagination.total}</strong>{" "}
              approved wedding services
            </>
          ) : (
            "Finding wedding services for you…"
          )}
        </p>

        {isLoading && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        )}

        {isError && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-destructive/25 bg-destructive/5 px-6 py-14 text-center">
            <TriangleAlert size={30} className="text-destructive" />
            <h2 className="mt-4 font-heading text-2xl text-foreground">
              We could not load services
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error ?? "Please check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className="mt-6 rounded-lg bg-wedplan-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark"
            >
              Try again
            </button>
          </div>
        )}

        {isReady && services.length === 0 && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-wedplan-sage bg-wedplan-sage/10 px-6 py-16 text-center">
            <Inbox size={32} className="text-wedplan-muted" />
            <h2 className="mt-4 font-heading text-2xl text-foreground">
              No services found
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Nothing matched those filters yet. Try a broader keyword, another
              category, or a different location.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-lg border border-wedplan-sage bg-background px-5 py-2.5 text-sm font-semibold text-wedplan-primary transition-colors hover:bg-muted"
            >
              Clear filters
            </button>
          </div>
        )}

        {isReady && services.length > 0 && (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  href={detailHref(service._id)}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-10 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page <strong className="text-foreground">{page}</strong> of{" "}
                  {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
