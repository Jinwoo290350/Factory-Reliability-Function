"use client"

import { useState } from "react"
import { ChevronLeft, Edit, Trash2 } from "lucide-react"
import type { Component, FailureItem, MachinePosition } from "./dashboard"

interface MachinePositionDetailProps {
  component: Component
  failureItem: FailureItem
  onBack: () => void
}

export function MachinePositionDetail({ component, failureItem, onBack }: MachinePositionDetailProps) {
  const [positions, setPositions] = useState<MachinePosition[]>([
    {
      id: "pos-1",
      positionName: "Typical Vibration Inspection Right",
      description:
        "Forced vibration: A forced vibration occurs when an alternating force disrupts a mechanical or structural system. An excellent example of forced vibration is a building's vibration during an earthquake — the building's frequency remains stable until the earthquake strikes and its energy undergoes a forced change.",
      createdDate: "Jan 16, 2025",
    },
  ])

  const handleDelete = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id))
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
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">Failure Lists</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Failure Item - Component {component.componentId}</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Machine Position</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Machine Position - Failure Item {failureItem.failureItemId}
        </h1>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-6 py-4 text-left font-semibold text-foreground">Position Name</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Description</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id} className="border-b border-border hover:bg-secondary/50">
                <td className="px-6 py-4 text-foreground">{position.positionName}</td>
                <td className="px-6 py-4 text-foreground text-xs max-w-md truncate">{position.description}</td>
                <td className="px-6 py-4 text-foreground">{position.createdDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 rounded bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(position.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
