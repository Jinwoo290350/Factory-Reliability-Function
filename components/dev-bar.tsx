"use client"

import type React from "react"
import { Upload } from "lucide-react"
import { ProfileSection } from "./profile-section"
import type { Component } from "./dashboard"

interface DevBarProps {
  components: Component[]
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>
}

export function DevBar({ components, setComponents }: DevBarProps) {
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target?.result as string
      const lines = csv.split("\n").slice(1)

      const parsed: Component[] = lines
        .filter((line) => line.trim())
        .map((line, idx) => {
          const cols = line.split(",").map((col) => col.trim())
          // CSV format: Type, Component ID, Component Name, Sub-component, Failure Mode, Failure Hours, Created Date
          const [type, componentId, componentName, subComponent, failureMode, failureHours, createdDate] = cols
          return {
            id: `comp-${idx}`,
            type,
            componentId,
            componentName,
            subComponent,
            failureMode,
            failureHours,
            createdDate,
          }
        })

      setComponents(parsed)
    }
    reader.readAsText(file)
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-8 py-4">
        <ProfileSection />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <label className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
              <Upload className="h-4 w-4" />
              <span className="text-xs font-medium">Upload CSV</span>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
