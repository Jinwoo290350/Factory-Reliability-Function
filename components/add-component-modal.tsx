"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import type { Component } from "./dashboard"
import type { Machine } from "./machine-list"
import { createComponent } from "@/lib/api"

interface AddComponentModalProps {
  onAdd: (component: Component) => void
  onClose: () => void
  machines: Machine[]
}

export function AddComponentModal({ onAdd, onClose, machines }: AddComponentModalProps) {
  const [formData, setFormData] = useState({
    machineId: "",
    componentId: "",
    componentName: "",
  })
  const [submitting, setSubmitting] = useState(false)

  // Common component IDs and names from the CSV data
  const componentOptions = [
    { id: '1.1 Gear pump', name: 'Gear pump' },
    { id: '1.2 Single screw extruder', name: 'Single screw extruder' },
    { id: '1.3 Gearbox', name: 'Gearbox' },
    { id: '1.4 Electric Cabinet', name: 'Electric Cabinet' },
    { id: '1.5 Conveyor system', name: 'Conveyor system' },
    { id: '1.6 Cutter assembly', name: 'Cutter assembly' },
    { id: '1.7 Others', name: 'Others' },
  ]

  const selectedMachine = machines.find((m) => m.id === formData.machineId)

  // When Component ID is selected, auto-fill Component Name
  const handleComponentIdChange = (componentId: string) => {
    const selected = componentOptions.find(opt => opt.id === componentId)
    setFormData({
      ...formData,
      componentId: componentId,
      componentName: selected?.name || ""
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.componentId && formData.componentName) {
      setSubmitting(true)
      try {
        // Send component_id and component_name to backend
        const apiComponent = await createComponent({
          component_id: formData.componentId,
          component_name: formData.componentName,
          machine_name: selectedMachine?.name || "Unassigned",
          machine_id: formData.machineId || null,
        })

        const newComponent: Component = {
          id: apiComponent.id,
          type: apiComponent.machine_name,
          componentId: apiComponent.component_id || apiComponent.id,
          componentName: apiComponent.component_name,
          createdDate: new Date(apiComponent.created_at).toLocaleDateString(),
        }

        onAdd(newComponent)
        setFormData({
          machineId: "",
          componentId: "",
          componentName: "",
        })
      } catch (error) {
        console.error("Failed to create component:", error)
        alert("Failed to create component. Please try again.")
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Add New Component</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-all">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">Component ID</label>
            <select
              value={formData.componentId}
              onChange={(e) => handleComponentIdChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            >
              <option value="">Select Component ID</option>
              {componentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">Component Name</label>
            <input
              type="text"
              value={formData.componentName}
              onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
              placeholder="Enter component name or select Component ID to auto-fill"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Select Component ID to auto-fill, or type your own component name
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">Machine</label>
            <select
              value={formData.machineId}
              onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">Unassigned</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Component"}
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
