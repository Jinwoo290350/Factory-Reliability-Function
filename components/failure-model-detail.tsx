"use client"

import { useState, useEffect } from "react"
import { Search, ChevronLeft, Edit } from "lucide-react"
import type { Component, FailureItem, FailureMode } from "./dashboard"
import { WeibullGraphPopup } from "./weibull-graph-popup"
import { getComponents, updateComponent, type Component as ApiComponent } from "@/lib/api"

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
  const [editingModeId, setEditingModeId] = useState<string | null>(null)
  const [currentHours, setCurrentHours] = useState<string>("")
  const [currentMinutes, setCurrentMinutes] = useState<string>("")

  // Calculate Weibull parameters using provided method
  const calculateWeibullParams = (
    manualHours: number[] | null | undefined,
    mtHours: number,
    sdHours: number = 0
  ): { alpha: number; beta: number; reliability: number } => {
    // If manual hours exist and has values, use Method 2 (MLE simulation)
    if (manualHours && manualHours.length > 0) {
      // Simple MLE approximation (in production, call Python backend)
      const mean = manualHours.reduce((sum, h) => sum + h, 0) / manualHours.length
      const variance = manualHours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / manualHours.length
      const sd = Math.sqrt(variance)

      // Approximate Weibull parameters from mean and variance
      const cv = sd / mean // Coefficient of variation
      // For Weibull: CV ≈ sqrt(Γ(1+2/k)/Γ(1+1/k)^2 - 1)
      // Approximation: k ≈ 1/cv^1.086 for cv < 1
      const alpha = cv > 0 ? Math.pow(cv, -1.086) : 2.0
      const beta = mean / gamma(1 + 1/alpha)
      const reliability = Math.exp(-Math.pow(1 / beta, alpha))

      return { alpha, beta, reliability }
    }

    // Method 1: Default using MT and SD (simplified exponential if SD not available)
    if (sdHours > 0) {
      // Use mean and SD (approximation)
      const cv = sdHours / mtHours
      const alpha = cv > 0 ? Math.pow(cv, -1.086) : 2.0
      const beta = mtHours / gamma(1 + 1/alpha)
      const reliability = Math.exp(-Math.pow(1 / beta, alpha))
      return { alpha, beta, reliability }
    }

    // Fallback: Simple exponential (alpha=1)
    const reliability = Math.exp(-1 / mtHours)
    return { alpha: 1.0, beta: mtHours, reliability }
  }

  // Gamma function approximation
  const gamma = (z: number): number => {
    // Stirling's approximation for Gamma function
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z))
    z -= 1
    const g = 7
    const C = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ]
    let x = C[0]
    for (let i = 1; i < g + 2; i++) {
      x += C[i] / (z + i)
    }
    const t = z + g + 0.5
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
  }

  // Fetch failure modes from database
  const fetchFailureModes = async () => {
    try {
      setLoading(true)
      const allComponents = await getComponents()

        // Filter components matching: same component_name AND same sub_component
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

        // Create failure mode records with NEW calculations
        const modes: FailureMode[] = []
        let sequenceNumber = 1

        failureModeMap.forEach((components, failureModeName) => {
          const failureHoursArray = components.map(c => c.failure_hours!).filter(h => h > 0)

          if (failureHoursArray.length > 0) {
            // Calculate Mean Time (MTBF)
            const mtHours = failureHoursArray.reduce((sum, h) => sum + h, 0) / failureHoursArray.length

            // Calculate SD (standard deviation)
            const variance = failureHoursArray.reduce((sum, h) => sum + Math.pow(h - mtHours, 2), 0) / failureHoursArray.length
            const sdHours = Math.sqrt(variance)

            // Check if first component has manual_hours
            const firstComp = components[0]
            const manualHours = firstComp.manual_hours

            // Calculate using appropriate method
            const { alpha, beta, reliability } = calculateWeibullParams(manualHours, mtHours, sdHours)

            // Generate failure mode ID
            const failureModeId = `${failureItem.failureItemId.replace('fi-', 'fm-')}-${sequenceNumber.toString().padStart(3, '0')}`

            modes.push({
              id: `fm-${component.id}-${failureModeName}`,
              failureModeId: failureModeId,
              failureMode: failureModeName,
              note: "",
              mtHours: mtHours.toFixed(2),
              reliability: reliability.toFixed(12),
              createdDate: new Date(firstComp.created_at).toLocaleDateString(),
              // Store for reference
              alpha: alpha.toFixed(4),
              beta: beta.toFixed(4),
              manualHours: manualHours,
              componentId: firstComp.id, // Store component ID for editing
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

  useEffect(() => {
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

  const handleEditManualHours = (mode: FailureMode) => {
    const manualHours = (mode as any).manualHours as number[] | undefined

    // Load existing value if available
    if (manualHours && manualHours.length > 0) {
      const hours = Math.floor(manualHours[0])
      const minutes = Math.round((manualHours[0] - hours) * 60)
      setCurrentHours(hours.toString())
      setCurrentMinutes(minutes.toString())
    } else {
      setCurrentHours("")
      setCurrentMinutes("")
    }

    setEditingModeId(mode.id)
  }

  const handleSaveDirectly = async (mode: FailureMode) => {
    const componentId = (mode as any).componentId

    if (!componentId) {
      alert("Error: Component ID not found")
      return
    }

    const hours = parseInt(currentHours || "0") || 0
    const minutes = parseInt(currentMinutes || "0") || 0

    if (hours <= 0) {
      alert("กรุณากรอกชั่วโมง")
      return
    }

    if (minutes < 0 || minutes >= 60) {
      alert("นาทีต้องอยู่ระหว่าง 0-59")
      return
    }

    try {
      const decimalHours = hours + (minutes / 60)

      const response = await updateComponent(componentId, {
        manual_hours: [decimalHours]
      })

      setEditingModeId(null)
      setCurrentHours("")
      setCurrentMinutes("")

      await fetchFailureModes()
      alert(`✅ บันทึกสำเร็จ: ${hours}:${minutes.toString().padStart(2, '0')}`)
    } catch (error) {
      console.error("Failed to save:", error)
      alert(`Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }


  const handleCancelEdit = () => {
    setEditingModeId(null)
    setCurrentHours("")
    setCurrentMinutes("")
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

      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground text-base font-medium">Loading failure modes...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-3 py-3 text-left font-semibold text-foreground text-xs">FM ID</th>
                <th className="px-3 py-3 text-left font-semibold text-foreground text-xs">Failure Mode</th>
                <th className="px-3 py-3 text-left font-semibold text-foreground text-xs w-20">MT Hours</th>
                <th className="px-3 py-3 text-left font-semibold text-foreground text-xs">Manual Hours</th>
                <th className="px-3 py-3 text-left font-semibold text-foreground text-xs">Reliability</th>
                <th className="px-3 py-3 text-left font-semibold text-foreground text-xs w-24">Mode</th>
                <th className="px-3 py-3 text-left font-semibold text-foreground text-xs">Tools</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((mode) => {
                const isActive = mode.mtHours && mode.reliability && parseFloat(mode.mtHours) > 0
                const manualHours = (mode as any).manualHours as number[] | undefined
                const hasManualHours = manualHours && manualHours.length > 0

                return (
                  <tr key={mode.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="px-3 py-2 text-foreground text-xs">{mode.failureModeId}</td>
                    <td className="px-3 py-2 text-foreground text-xs">{mode.failureMode}</td>
                    <td className="px-3 py-2 text-foreground text-xs">{mode.mtHours}</td>
                    <td className="px-3 py-2">
                      {editingModeId === mode.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            value={currentHours}
                            onChange={(e) => setCurrentHours(e.target.value)}
                            placeholder="500"
                            min="0"
                            className="w-14 px-1 py-1 text-xs border rounded bg-input text-foreground"
                            autoFocus
                          />
                          <span className="text-xs">ชม</span>
                          <input
                            type="number"
                            value={currentMinutes}
                            onChange={(e) => setCurrentMinutes(e.target.value)}
                            placeholder="30"
                            min="0"
                            max="59"
                            className="w-10 px-1 py-1 text-xs border rounded bg-input text-foreground"
                          />
                          <span className="text-xs">นาที</span>
                          <button
                            type="button"
                            onClick={() => handleSaveDirectly(mode)}
                            className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-1 py-1 rounded bg-gray-500 text-white text-xs hover:bg-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {hasManualHours ? (
                            <span className="text-xs font-mono text-purple-700 dark:text-purple-300">
                              {manualHours![0].toFixed(1)}h
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                          <button
                            onClick={() => handleEditManualHours(mode)}
                            className="px-1 py-0.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-foreground text-xs">{mode.reliability}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          hasManualHours
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {hasManualHours ? "Manual" : isActive ? "Default" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleGraphClick(mode)}
                          disabled={!isActive}
                          className={`px-2 py-1 rounded text-xs transition-all ${
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
                          className={`px-2 py-1 rounded text-xs transition-all ${
                            isActive
                              ? "bg-accent text-accent-foreground hover:bg-accent/90"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                          }`}
                        >
                          Risk
                        </button>
                        <button
                          onClick={() => {
                            onSelectFailureMode(mode)
                            onNavigateToMachinePosition()
                          }}
                          disabled={!isActive}
                          className={`px-2 py-1 rounded text-xs transition-all ${
                            isActive
                              ? "bg-secondary text-foreground hover:bg-secondary/80"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                          }`}
                        >
                          Position
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
