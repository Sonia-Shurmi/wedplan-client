"use client"

import { RotateCcw, Search } from "lucide-react"

import { CATEGORIES } from "@/lib/constants"
import { SERVICE_SORTS, type ServiceSort } from "@/lib/services"

interface ServiceFiltersProps {
  search: string
  location: string
  category: string
  sort: ServiceSort
  onSearchChange: (value: string) => void
  onLocationChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortChange: (value: ServiceSort) => void
  onSubmit: () => void
  onClear: () => void
  isFiltered: boolean
}

const controlClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-wedplan-muted focus:ring-2 focus:ring-wedplan-sage/50"

const labelClass =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"

export default function ServiceFilters({
  search,
  location,
  category,
  sort,
  onSearchChange,
  onLocationChange,
  onCategoryChange,
  onSortChange,
  onSubmit,
  onClear,
  isFiltered,
}: ServiceFiltersProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="rounded-2xl border border-wedplan-sage/60 bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] lg:items-end">
        <div>
          <label htmlFor="service-search" className={labelClass}>
            Search
          </label>
          <input
            id="service-search"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Photographer, florist, venue…"
            className={controlClass}
          />
        </div>

        <div>
          <label htmlFor="service-category" className={labelClass}>
            Category
          </label>
          <select
            id="service-category"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className={controlClass}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item.slug} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="service-location" className={labelClass}>
            Location
          </label>
          <input
            id="service-location"
            type="text"
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="City or area"
            className={controlClass}
          />
        </div>

        <div>
          <label htmlFor="service-sort" className={labelClass}>
            Sort by
          </label>
          <select
            id="service-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as ServiceSort)}
            className={controlClass}
          >
            {SERVICE_SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-wedplan-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-wedplan-dark lg:flex-none"
          >
            <Search size={16} />
            Search
          </button>
          {isFiltered && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear all filters"
              title="Clear all filters"
              className="inline-flex size-11 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
