"use client"

import { useState } from "react"
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
              <th className="px-6 py-4 text-left font-semibold text-foreground">Probability</th>
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
                <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-600 text-xs font-medium">Medium</span>
              </td>
              <td className="px-6 py-4 text-foreground">น้อย</td>
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
                  <button className="px-3 py-1 rounded bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
                    Edit Risk
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showRiskMatrix && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-96 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Risk Assessment Matrix</h2>
              <button onClick={() => setShowRiskMatrix(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Failure Mode ID:</strong> {failureMode.failureModeId}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Failure Mode Name:</strong> {failureMode.failureMode}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Reliability:</strong> {failureMode.reliability}
              </p>
            </div>

            {/* Risk Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <td className="border border-border p-2 bg-secondary font-semibold text-foreground">
                      ระดับความเสี่ยง
                    </td>
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
                    { level: "5", label: "สูงมาก / หายนะ", values: [5, 10, 15, 20, 25] },
                    { level: "4", label: "สูง / วิกฤติ", values: [4, 8, 12, 16, 20] },
                    { level: "3", label: "ปานกลาง", values: [3, 6, 9, 12, 15] },
                    { level: "2", label: "น้อย", values: [2, 4, 6, 8, 10] },
                    { level: "1", label: "ไม่เป็นสาระสำคัญ / น้อยมาก", values: [1, 2, 3, 4, 5] },
                  ].map((row) => (
                    <tr key={row.level}>
                      <td className="border border-border p-2 bg-secondary font-semibold text-foreground text-xs">
                        {row.label}
                      </td>
                      {row.values.map((value, idx) => (
                        <td key={idx} className="border border-border p-2 text-center text-foreground bg-card">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
