"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from "recharts"
import type { FailureMode } from "./dashboard"

interface WeibullGraphPopupProps {
  failureMode: FailureMode
  onClose: () => void
}

export function WeibullGraphPopup({ failureMode, onClose }: WeibullGraphPopupProps) {
  // Use actual calculated Weibull parameters
  // α (alpha) = shape parameter
  // β (beta) = scale parameter (η in some notations)
  const alpha = parseFloat(failureMode.alpha || "1.5") // shape
  const betaScale = parseFloat(failureMode.beta || "100") // scale

  // Generate data points for Weibull curve
  const data = useMemo(() => {
    const maxT = betaScale * 2.5 // Show up to 2.5x scale parameter
    const points = []
    const numPoints = 100

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * maxT

      // Weibull reliability formula: R(t) = e^(-(t/β)^α)
      const reliability = Math.exp(-Math.pow(t / betaScale, alpha))

      points.push({
        time: parseFloat(t.toFixed(2)),
        reliability: parseFloat(reliability.toFixed(6)),
      })
    }

    return points
  }, [betaScale, alpha])

  // Calculate current reliability marker position (at t=1 hour)
  const currentReliability = parseFloat(failureMode.reliability || "0.99")
  const currentTime = currentReliability > 0 ? betaScale * Math.pow(-Math.log(currentReliability), 1 / alpha) : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Weibull Reliability Graph - {failureMode.failureMode}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-border">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="time"
                label={{ value: "Time (hours)", position: "insideBottom", offset: -10 }}
                stroke="#666"
              />
              <YAxis
                label={{ value: "Reliability R(t)", angle: -90, position: "insideLeft" }}
                domain={[0, 1]}
                stroke="#666"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                formatter={(value: number) => [value.toFixed(6), "Reliability"]}
                labelFormatter={(label) => `Time: ${label} hours`}
              />
              <Line
                type="monotone"
                dataKey="reliability"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#2563eb" }}
                name="Weibull Reliability"
              />
              {currentReliability > 0 && currentTime > 0 && (
                <ReferenceDot
                  x={currentTime}
                  y={currentReliability}
                  r={6}
                  fill="#dc2626"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
