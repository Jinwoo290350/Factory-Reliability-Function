"use client"

import { useState } from "react"
import { Search, ChevronLeft } from "lucide-react"
import type { Component, FailureItem } from "./dashboard"

interface FailureItemDetailProps {
  component: Component
  onSelectFailureItem: (item: FailureItem) => void
  onBack: () => void
}

export function FailureItemDetail({ component, onSelectFailureItem, onBack }: FailureItemDetailProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCount, setShowCount] = useState(10)

  const failureItems: FailureItem[] = [
    {
      id: `fi-${component.componentId}-1`,
      failureItemId: `fi-11-001`,
      failureItemName: "Actuating device",
      componentId: component.componentId,
      createdDate: "Sep 26, 2022",
    },
    {
      id: `fi-${component.componentId}-2`,
      failureItemId: `fi-11-002`,
      failureItemName: "Antisurge system",
      componentId: component.componentId,
      createdDate: "Sep 26, 2022",
    },
    {
      id: `fi-${component.componentId}-3`,
      failureItemId: `fi-11-003`,
      failureItemName: "Balance piston",
      componentId: component.componentId,
      createdDate: "Sep 26, 2022",
    },
    {
      id: `fi-${component.componentId}-4`,
      failureItemId: `fi-11-004`,
      failureItemName: "Cabling & junction boxes",
      componentId: component.componentId,
      createdDate: "Sep 26, 2022",
    },
  ]

  const filteredData = failureItems.filter(
    (item) =>
      item.failureItemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.failureItemName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const displayedData = filteredData.slice(0, showCount)

  return (
    <div className="flex-1 p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-4 text-accent hover:text-accent/80 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-8 bg-secondary p-4 rounded-lg">
        <h3 className="text-sm text-muted-foreground mb-2">Component Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Machine Name</p>
            <p className="text-foreground font-semibold">{component.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Component ID</p>
            <p className="text-foreground font-semibold">{component.componentId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Component Name</p>
            <p className="text-foreground font-semibold">{component.componentName}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">Failure Lists</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Failure Item</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Component {component.componentId}</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Failure Item - Component {component.componentId}</h1>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Show</label>
          <select
            value={showCount}
            onChange={(e) => setShowCount(Number(e.target.value))}
            className="rounded border border-border bg-input px-3 py-1 text-sm text-foreground"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <label className="text-sm text-muted-foreground">All entries</label>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-border bg-input px-3 py-2 pl-10 text-sm text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-6 py-4 text-left font-semibold text-foreground">Failure Item ID</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Failure Item Name</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item) => (
              <tr key={item.id} className="border-b border-border hover:bg-secondary/50">
                <td className="px-6 py-4 text-foreground">{item.failureItemId}</td>
                <td className="px-6 py-4 text-foreground">{item.failureItemName}</td>
                <td className="px-6 py-4 text-foreground">{item.createdDate}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onSelectFailureItem(item)}
                    className="px-3 py-1 rounded bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90"
                  >
                    Failure Model & Parameters
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {failureItems.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {displayedData.length} of {filteredData.length} entries
        </div>
      )}
    </div>
  )
}
