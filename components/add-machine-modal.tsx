"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { createMachine } from "@/lib/api"

interface AddMachineModalProps {
  onAdd: (name: string) => void
  onClose: () => void
}

export function AddMachineModal({ onAdd, onClose }: AddMachineModalProps) {
  const [machineeName, setMachineName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (machineeName.trim()) {
      setSubmitting(true)
      try {
        await createMachine({ name: machineeName })
        onAdd(machineeName)
        setMachineName("")
      } catch (error) {
        console.error("Failed to create machine:", error)
        alert("Failed to create machine. Please try again.")
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Add New Machine</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-all">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Machine Name</label>
            <input
              type="text"
              value={machineeName}
              onChange={(e) => setMachineName(e.target.value)}
              placeholder="Enter machine name"
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground text-sm font-medium placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Machine"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
