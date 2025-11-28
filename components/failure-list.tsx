"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import type { Component } from "./dashboard"

interface FailureListProps {
  data: Component[]
  onSelectComponent: (component: Component) => void
}

export function FailureList({ data, onSelectComponent }: FailureListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCount, setShowCount] = useState(10)

  const groupedByType = data.reduce(
    (acc, component) => {
      if (!acc[component.type]) {
        acc[component.type] = []
      }
      acc[component.type].push(component)
      return acc
    },
    {} as Record<string, Component[]>,
  )

  const filteredData = data.filter(
    (record) =>
      record.componentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.componentName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const displayedData = filteredData.slice(0, showCount)

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">Failure Lists</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Failure Lists</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Failure Lists</h1>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Upload CSV file to view failure lists</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-4 text-left font-semibold text-foreground">Type</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Component ID</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Component Name</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((component) => (
                <tr key={component.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-6 py-4 font-bold text-foreground">{component.type}</td>
                  <td className="px-6 py-4 text-foreground">{component.componentId}</td>
                  <td className="px-6 py-4 text-foreground">{component.componentName}</td>
                  <td className="px-6 py-4 text-foreground">{component.createdDate}</td>
                  <td className="px-6 py-4 text-foreground">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectComponent(component)}
                        className="px-3 py-1 rounded bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90"
                      >
                        Failure Item
                      </button>
                      <button className="px-3 py-1 rounded bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
                        Functions
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {displayedData.length} of {filteredData.length} entries
        </div>
      )}
    </div>
  )
}
