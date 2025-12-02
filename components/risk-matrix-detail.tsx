"use client"

import { useState, useMemo } from "react"
import { ChevronLeft } from "lucide-react"
import type { Component, FailureItem, FailureMode } from "./dashboard"

interface RiskMatrixDetailProps {
  component: Component
  failureItem: FailureItem
  failureMode: FailureMode
  onBack: () => void
}

export function RiskMatrixDetail({ component, failureItem, failureMode, onBack }: RiskMatrixDetailProps) {
  const [showRiskMatrix, setShowRiskMatrix] = useState(false)

  // Calculate risk assessment from reliability
  const riskAssessment = useMemo(() => {
    const reliability = parseFloat(failureMode.reliability || "0")
    const probability = 1 - reliability // Probability of failure = 1 - Reliability

    // Calculate severity level (1-5) based on component type
    // This is a simplified model - in real system this would come from database/user input
    const severity = 3 // Default to medium severity

    // Calculate probability level (1-5)
    let probabilityLevel: number
    if (probability < 0.0001) probabilityLevel = 1 // Very Low
    else if (probability < 0.001) probabilityLevel = 2 // Low
    else if (probability < 0.01) probabilityLevel = 3 // Medium
    else if (probability < 0.1) probabilityLevel = 4 // High
    else probabilityLevel = 5 // Very High

    // Calculate risk score (1-25)
    const riskScore = severity * probabilityLevel

    // Determine risk level
    let riskLevel: string
    let riskColor: string
    if (riskScore <= 5) {
      riskLevel = "Low"
      riskColor = "bg-green-500/20 text-green-600"
    } else if (riskScore <= 10) {
      riskLevel = "Medium"
      riskColor = "bg-yellow-500/20 text-yellow-600"
    } else if (riskScore <= 15) {
      riskLevel = "High"
      riskColor = "bg-orange-500/20 text-orange-600"
    } else {
      riskLevel = "Very High"
      riskColor = "bg-red-500/20 text-red-600"
    }

    // Map probability level to Thai text
    const probabilityText = ["น้อยมาก", "น้อย", "ปานกลาง", "สูง", "สูงมาก"][probabilityLevel - 1]

    return {
      probability: probability.toFixed(6),
      probabilityLevel,
      probabilityText,
      severity,
      riskScore,
      riskLevel,
      riskColor,
    }
  }, [failureMode])

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
          <div>
            <p className="text-xs text-muted-foreground">Failure Mode ID</p>
            <p className="text-foreground font-semibold">{failureMode.failureModeId}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">Failure Lists</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Failure Item - Component {component.componentId}</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Risk Matrix</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Risk Matrix - {failureMode.failureModeId}</h1>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-6 py-4 text-left font-semibold text-foreground">Failure Mode ID</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Failure Mode</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Risk Level</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Risk Score</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Probability</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Severity</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Reliability</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border hover:bg-secondary/50">
              <td className="px-6 py-4 text-foreground">{failureMode.failureModeId}</td>
              <td className="px-6 py-4 text-foreground">{failureMode.failureMode}</td>
              <td className="px-6 py-4 text-foreground">
                <span className={`px-2 py-1 rounded text-xs font-medium ${riskAssessment.riskColor}`}>
                  {riskAssessment.riskLevel}
                </span>
              </td>
              <td className="px-6 py-4 text-foreground">
                <span className="font-semibold">{riskAssessment.riskScore}</span>
                <span className="text-xs text-muted-foreground ml-1">/ 25</span>
              </td>
              <td className="px-6 py-4 text-foreground">
                <div className="flex flex-col">
                  <span className="font-medium">{riskAssessment.probabilityText}</span>
                  <span className="text-xs text-muted-foreground">{riskAssessment.probability}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-foreground">
                <span className="font-medium">{riskAssessment.severity}</span>
                <span className="text-xs text-muted-foreground ml-1">/ 5</span>
              </td>
              <td className="px-6 py-4 text-foreground">{failureMode.reliability}</td>
              <td className="px-6 py-4 text-foreground">{failureMode.createdDate}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRiskMatrix(true)}
                    className="px-3 py-1 rounded bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/90"
                  >
                    Risk Matrix Table
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showRiskMatrix && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRiskMatrix(false)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Risk Assessment Matrix</h2>
              <button onClick={() => setShowRiskMatrix(false)} className="text-muted-foreground hover:text-foreground text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                ✕
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary rounded">
                <p className="text-xs text-muted-foreground mb-1">Failure Mode ID</p>
                <p className="text-sm font-semibold text-foreground">{failureMode.failureModeId}</p>
              </div>
              <div className="p-3 bg-secondary rounded">
                <p className="text-xs text-muted-foreground mb-1">Failure Mode</p>
                <p className="text-sm font-semibold text-foreground">{failureMode.failureMode}</p>
              </div>
              <div className="p-3 bg-secondary rounded">
                <p className="text-xs text-muted-foreground mb-1">Reliability</p>
                <p className="text-sm font-semibold text-foreground">{failureMode.reliability}</p>
              </div>
              <div className="p-3 bg-secondary rounded">
                <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
                <p className="text-sm font-semibold text-foreground">
                  {riskAssessment.riskScore} / 25
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${riskAssessment.riskColor}`}>
                    {riskAssessment.riskLevel}
                  </span>
                </p>
              </div>
            </div>

            {/* Risk Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <td className="border border-border p-2 bg-secondary font-semibold text-foreground" rowSpan={2}>
                      ความรุนแรง<br/>(Severity)
                    </td>
                    <td className="border border-border p-2 bg-secondary font-semibold text-foreground text-center" colSpan={5}>
                      ความน่าจะเป็น (Probability)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2 bg-secondary font-semibold text-foreground text-center">
                      1<br />
                      <span className="text-xs">น้อยมาก</span>
                    </td>
                    <td className="border border-border p-2 bg-secondary font-semibold text-foreground text-center">
                      2<br />
                      <span className="text-xs">น้อย</span>
                    </td>
                    <td className="border border-border p-2 bg-secondary font-semibold text-foreground text-center">
                      3<br />
                      <span className="text-xs">ปานกลาง</span>
                    </td>
                    <td className="border border-border p-2 bg-secondary font-semibold text-foreground text-center">
                      4<br />
                      <span className="text-xs">สูง</span>
                    </td>
                    <td className="border border-border p-2 bg-secondary font-semibold text-foreground text-center">
                      5<br />
                      <span className="text-xs">สูงมาก</span>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { level: 5, label: "สูงมาก / หายนะ", values: [5, 10, 15, 20, 25] },
                    { level: 4, label: "สูง / วิกฤติ", values: [4, 8, 12, 16, 20] },
                    { level: 3, label: "ปานกลาง", values: [3, 6, 9, 12, 15] },
                    { level: 2, label: "น้อย", values: [2, 4, 6, 8, 10] },
                    { level: 1, label: "ไม่เป็นสาระสำคัญ / น้อยมาก", values: [1, 2, 3, 4, 5] },
                  ].map((row) => (
                    <tr key={row.level}>
                      <td className="border border-border p-2 bg-secondary font-semibold text-foreground text-xs">
                        {row.level} - {row.label}
                      </td>
                      {row.values.map((value, idx) => {
                        // Highlight current risk score
                        const isCurrentCell = value === riskAssessment.riskScore &&
                                             row.level === riskAssessment.severity &&
                                             (idx + 1) === riskAssessment.probabilityLevel

                        // Color coding based on risk score
                        let cellColor = "bg-card"
                        if (value <= 5) cellColor = "bg-green-100 dark:bg-green-900/20"
                        else if (value <= 10) cellColor = "bg-yellow-100 dark:bg-yellow-900/20"
                        else if (value <= 15) cellColor = "bg-orange-100 dark:bg-orange-900/20"
                        else cellColor = "bg-red-100 dark:bg-red-900/20"

                        return (
                          <td
                            key={idx}
                            className={`border border-border p-2 text-center text-foreground ${cellColor} ${
                              isCurrentCell ? "ring-2 ring-blue-500 font-bold" : ""
                            }`}
                          >
                            {value}
                            {isCurrentCell && <div className="text-[10px] text-blue-600 dark:text-blue-400">● ปัจจุบัน</div>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-secondary rounded text-xs">
              <p className="font-semibold mb-2">Risk Score Calculation</p>
              <p className="mb-1">Risk Score = Severity × Probability Level</p>
              <p className="mb-1">Current: {riskAssessment.severity} × {riskAssessment.probabilityLevel} = <span className="font-bold">{riskAssessment.riskScore}</span></p>
              <div className="mt-2 grid grid-cols-4 gap-2 text-[10px]">
                <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded">Low (1-5)</div>
                <div className="p-1 bg-yellow-100 dark:bg-yellow-900/20 rounded">Medium (6-10)</div>
                <div className="p-1 bg-orange-100 dark:bg-orange-900/20 rounded">High (11-15)</div>
                <div className="p-1 bg-red-100 dark:bg-red-900/20 rounded">Very High (16-25)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
