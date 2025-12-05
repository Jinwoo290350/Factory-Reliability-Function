"use client"

import { useState } from "react"
import { Search, Info, X } from "lucide-react"
import type { Component } from "./dashboard"

interface FailureListProps {
  data: Component[]
  onSelectComponent: (component: Component) => void
}

export function FailureList({ data, onSelectComponent }: FailureListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCount, setShowCount] = useState(10)
  const [showFunctionsModal, setShowFunctionsModal] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)

  const handleShowFunctions = (component: Component) => {
    setSelectedComponent(component)
    setShowFunctionsModal(true)
  }

  // Group components by machine name
  const groupedByMachine = data.reduce(
    (acc, component) => {
      const machineName = component.type || "Unknown Machine"
      if (!acc[machineName]) {
        acc[machineName] = []
      }
      acc[machineName].push(component)
      return acc
    },
    {} as Record<string, Component[]>,
  )

  // Filter data
  const filteredData = data.filter(
    (record) =>
      record.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.componentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.componentName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Group filtered data by machine and deduplicate by component name
  const filteredGrouped = filteredData.reduce(
    (acc, component) => {
      const machineName = component.type || "Unknown Machine"
      if (!acc[machineName]) {
        acc[machineName] = []
      }

      // Check if component with same name already exists in this machine group
      const existingIndex = acc[machineName].findIndex(c => c.componentName === component.componentName)

      if (existingIndex === -1) {
        // New component, add it
        acc[machineName].push(component)
      }
      // If exists, skip it (deduplicate)

      return acc
    },
    {} as Record<string, Component[]>,
  )

  const machineNames = Object.keys(filteredGrouped)

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

      <div className="space-y-6">
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-12 rounded-lg border border-border bg-card">
            <p className="text-muted-foreground">Upload CSV file to view failure lists</p>
          </div>
        ) : machineNames.length === 0 ? (
          <div className="flex items-center justify-center py-12 rounded-lg border border-border bg-card">
            <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
          </div>
        ) : (
          machineNames.map((machineName) => {
            const components = filteredGrouped[machineName]
            return (
              <div key={machineName} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Machine Header */}
                <div className="bg-primary px-6 py-3">
                  <h2 className="text-lg font-bold text-primary-foreground">{machineName}</h2>
                </div>

                {/* Components Table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Component ID</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Component Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Created Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Tools</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((component) => (
                      <tr key={component.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 pl-12 pr-6">
                          <span className="text-foreground font-medium">{component.componentId || "-"}</span>
                        </td>
                        <td className="px-6 py-3 text-foreground font-medium">{component.componentName}</td>
                        <td className="px-6 py-3 text-foreground">{component.createdDate}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectComponent(component)}
                              className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-all"
                            >
                              Failure Item
                            </button>
                            <button
                              onClick={() => handleShowFunctions(component)}
                              className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all flex items-center gap-1"
                            >
                              <Info className="h-3.5 w-3.5" />
                              Functions
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })
        )}
      </div>

      {data.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground font-medium">
          Showing {filteredData.length} components from {machineNames.length} machines
        </div>
      )}

      {/* Functions Info Modal */}
      {showFunctionsModal && selectedComponent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowFunctionsModal(false)}>
          <div className="bg-card border border-border rounded-lg p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground">Available Functions</h2>
              <button
                onClick={() => setShowFunctionsModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">1</span>
                <span className="text-foreground">Failure Item Management</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">2</span>
                <span className="text-foreground">Failure Mode & Parameters</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">3</span>
                <span className="text-foreground">Risk Matrix Analysis</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">4</span>
                <span className="text-foreground">Weibull Graph Visualization</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">5</span>
                <span className="text-foreground">Machine Position Tracking</span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">6</span>
                <span className="text-foreground">Machine Picture Gallery</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowFunctionsModal(false)}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
