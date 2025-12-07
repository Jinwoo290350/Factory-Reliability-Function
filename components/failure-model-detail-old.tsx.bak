"use client"

import { useState, useEffect } from "react"
import { Search, ChevronLeft } from "lucide-react"
import type { Component, FailureItem, FailureMode } from "./dashboard"
import { WeibullGraphPopup } from "./weibull-graph-popup"
import { getComponents, type Component as ApiComponent } from "@/lib/api"

interface FailureModelDetailProps {
  component: Component
  failureItem: FailureItem
  onSelectFailureMode: (mode: FailureMode) => void
  onNavigateToRiskMatrix: () => void
  onNavigateToMachinePosition: () => void
  onBack: () => void
}

export function FailureModelDetail({
  component,
  failureItem,
  onSelectFailureMode,
  onNavigateToRiskMatrix,
  onNavigateToMachinePosition,
  onBack,
}: FailureModelDetailProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCount, setShowCount] = useState(10)
  const [showGraph, setShowGraph] = useState(false)
  const [selectedMode, setSelectedMode] = useState<FailureMode | null>(null)
  const [failureModes, setFailureModes] = useState<FailureMode[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch failure modes from database
  useEffect(() => {
    const fetchFailureModes = async () => {
      try {
        setLoading(true)
        // Get all components
        const allComponents = await getComponents()

        // Filter components matching: same component_name AND same sub_component (failure item name)
        const matchingComponents = allComponents.filter(
          (c) =>
            c.component_name === component.componentName &&
            c.sub_component === failureItem.failureItemName
        )

        // Group by failure_mode
        const failureModeMap = new Map<string, ApiComponent[]>()

        for (const comp of matchingComponents) {
          if (comp.failure_mode && comp.failure_hours) {
            const existing = failureModeMap.get(comp.failure_mode) || []
            existing.push(comp)
            failureModeMap.set(comp.failure_mode, existing)
          }
        }

        // Create failure mode records with calculations
        const modes: FailureMode[] = []
        let sequenceNumber = 1

        failureModeMap.forEach((components, failureModeName) => {
          // Calculate MT, Hours, Standard Reliability from failure_hours
          const failureHoursArray = components.map(c => c.failure_hours!).filter(h => h > 0)

          if (failureHoursArray.length > 0) {
            // Calculate Mean Time (MTBF)
            const mtHours = failureHoursArray.reduce((sum, h) => sum + h, 0) / failureHoursArray.length

            // Calculate Standard Reliability (simplified: e^(-1/MTBF))
            // Assuming 1 hour operation time
            const reliability = Math.exp(-1 / mtHours)

            // Generate failure mode ID: fm-11-001-001
            const failureModeId = `${failureItem.failureItemId.replace('fi-', 'fm-')}-${sequenceNumber.toString().padStart(3, '0')}`

            // Use first component's date
            const firstComp = components[0]

            modes.push({
              id: `fm-${component.id}-${failureModeName}`,
              failureModeId: failureModeId,
              failureMode: failureModeName,
              note: "",  // Empty as requested
              mtHours: mtHours.toFixed(2),
              reliability: reliability.toFixed(12),
              createdDate: new Date(firstComp.created_at).toLocaleDateString(),
            })

            sequenceNumber++
          }
        })

        setFailureModes(modes)
      } catch (error) {
        console.error("Failed to fetch failure modes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFailureModes()
  }, [component, failureItem])

  const filteredData = failureModes.filter(
    (mode) =>
      mode.failureModeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mode.failureMode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const displayedData = filteredData.slice(0, showCount)

  const handleGraphClick = (mode: FailureMode) => {
    setSelectedMode(mode)
    setShowGraph(true)
  }

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
        <h3 className="text-sm text-muted-foreground mb-2">Component Detail</h3>
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
          <div>
            <p className="text-xs text-muted-foreground">Failure Item ID</p>
            <p className="text-foreground font-semibold">{failureItem.failureItemId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Failure Item Name</p>
            <p className="text-foreground font-semibold">{failureItem.failureItemName}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">Failure Lists</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Failure Item - Component {component.componentId}</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Failure Model & Parameters</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Failure Model & Parameters</h1>
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground text-base font-medium">Loading failure modes...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-4 text-left font-semibold text-foreground">Failure Mode ID</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Failure Mode</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Note</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">MT Hours</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Standard Reliability</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Calculate Mode</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((mode) => {
                // Check if data is ready for calculations (has MT hours and reliability)
                const isActive = mode.mtHours && mode.reliability && parseFloat(mode.mtHours) > 0

                return (
                  <tr key={mode.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="px-6 py-4 text-foreground">{mode.failureModeId}</td>
                    <td className="px-6 py-4 text-foreground">{mode.failureMode}</td>
                    <td className="px-6 py-4 text-foreground">{mode.note || "-"}</td>
                    <td className="px-6 py-4 text-foreground">{mode.mtHours}</td>
                    <td className="px-6 py-4 text-foreground">{mode.reliability}</td>
                    <td className="px-6 py-4 text-foreground">{mode.createdDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGraphClick(mode)}
                          disabled={!isActive}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            isActive
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                          }`}
                        >
                          Graph
                        </button>
                        <button
                          onClick={() => {
                            onSelectFailureMode(mode)
                            onNavigateToRiskMatrix()
                          }}
                          disabled={!isActive}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            isActive
                              ? "bg-accent text-accent-foreground hover:bg-accent/90"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                          }`}
                        >
                          Risk Matrix
                        </button>
                        <button
                          onClick={() => {
                            onSelectFailureMode(mode)
                            onNavigateToMachinePosition()
                          }}
                          disabled={!isActive}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            isActive
                              ? "bg-secondary text-foreground hover:bg-secondary/80"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                          }`}
                        >
                          Machine Position
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {failureModes.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {displayedData.length} of {filteredData.length} entries
        </div>
      )}

      {showGraph && selectedMode && (
        <WeibullGraphPopup
          failureMode={selectedMode}
          onClose={() => {
            setShowGraph(false)
            setSelectedMode(null)
          }}
        />
      )}
    </div>
  )
}
