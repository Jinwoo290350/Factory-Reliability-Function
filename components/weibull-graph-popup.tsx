"use client"

import { useEffect, useRef } from "react"
import type { FailureMode } from "./dashboard"

interface WeibullGraphPopupProps {
  failureMode: FailureMode
  onClose: () => void
}

export function WeibullGraphPopup({ failureMode, onClose }: WeibullGraphPopupProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Canvas dimensions
    const width = 600
    const height = 400
    canvas.width = width
    canvas.height = height

    // Parameters: η (eta) = scale parameter, β (beta) = shape parameter
    const eta = 100 // scale parameter
    const beta = 1.5 // shape parameter

    // Set background
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, width, height)

    // Draw axes
    const padding = 60
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.stroke()

    // Draw axis labels
    ctx.fillStyle = "#000"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Time (t)", width / 2, height - 20)

    ctx.save()
    ctx.translate(20, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Reliability R(t)", 0, 0)
    ctx.restore()

    // Draw grid and tick marks
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * (width - 2 * padding)
      const y = height - padding - (i / 10) * (height - 2 * padding)

      // Vertical grid lines
      ctx.beginPath()
      ctx.moveTo(x, height - padding)
      ctx.lineTo(x, padding)
      ctx.stroke()

      // Horizontal grid lines
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()

      // X axis ticks
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, height - padding + 5)
      ctx.lineTo(x, height - padding - 5)
      ctx.stroke()

      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(String((i / 10) * 200), x, height - padding + 20)

      // Y axis ticks
      ctx.beginPath()
      ctx.moveTo(padding - 5, y)
      ctx.lineTo(padding + 5, y)
      ctx.stroke()

      ctx.textAlign = "right"
      ctx.fillText((1 - i / 10).toFixed(1), padding - 10, y + 4)
    }

    // Draw Weibull curve
    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 2.5
    ctx.beginPath()

    const maxT = 200
    for (let t = 0; t <= maxT; t += 1) {
      // Weibull reliability formula: R(t) = e^(-(t/η)^β)
      const reliability = Math.exp(-Math.pow(t / eta, beta))

      const x = padding + (t / maxT) * (width - 2 * padding)
      const y = height - padding - reliability * (height - 2 * padding)

      if (t === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Add title
    ctx.fillStyle = "#000"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`Weibull Reliability Graph - ${failureMode.failureMode}`, width / 2, 30)

    // Add formula
    ctx.font = "11px Arial"
    ctx.fillText(`R(t) = e^(-(t/η)^β), η=${eta}, β=${beta}`, width / 2, 50)

    // Add current reliability marker
    const currentReliability = Number.parseFloat(failureMode.reliability || "0.99")
    if (currentReliability > 0) {
      const tAtCurrentReliability = eta * Math.pow(-Math.log(currentReliability), 1 / beta)
      const x = padding + (tAtCurrentReliability / maxT) * (width - 2 * padding)
      const y = height - padding - currentReliability * (height - 2 * padding)

      ctx.fillStyle = "#dc2626"
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#dc2626"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`Current: R=${currentReliability.toFixed(6)}`, x + 10, y - 5)
    }
  }, [failureMode])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Weibull Reliability Graph</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">
            ✕
          </button>
        </div>

        <div className="flex justify-center">
          <canvas ref={canvasRef} className="border border-border rounded" />
        </div>

        <div className="mt-4 p-3 bg-secondary rounded text-sm text-foreground">
          <p className="font-semibold mb-2">Weibull Reliability Formula</p>
          <p>R(t) = e^(-(t/η)^β)</p>
          <p className="text-xs text-muted-foreground mt-2">
            Where: t = time, η (eta) = scale parameter, β (beta) = shape parameter
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-accent text-accent-foreground font-medium hover:bg-accent/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
