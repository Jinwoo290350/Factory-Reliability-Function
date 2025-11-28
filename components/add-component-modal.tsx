"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import type { Component } from "./dashboard"
import type { Machine } from "./machine-list"

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
    createdDate: new Date().toISOString().split("T")[0],
  })

  const selectedMachine = machines.find((m) => m.id === formData.machineId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.machineId && formData.componentId && formData.componentName) {
      const newComponent: Component = {
        id: `comp-${Date.now()}`,
        type: selectedMachine?.name || "",
        componentId: formData.componentId,
        componentName: formData.componentName,
        createdDate: formData.createdDate,
      }
      onAdd(newComponent)
      setFormData({
        machineId: "",
        componentId: "",
        componentName: "",
        createdDate: new Date().toISOString().split("T")[0],
      })
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
            <label className="block text-sm font-semibold text-foreground mb-2.5">Machine Name</label>
            <select
              value={formData.machineId}
              onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            >
              <option value="">Select a machine</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">Component ID</label>
            <input
              type="text"
              value={formData.componentId}
              onChange={(e) => setFormData({ ...formData, componentId: e.target.value })}
              placeholder="Enter component ID"
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground text-sm font-medium placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">Component Name</label>
            <input
              type="text"
              value={formData.componentName}
              onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
              placeholder="Enter component name"
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground text-sm font-medium placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2.5">Created Date</label>
            <input
              type="date"
              value={formData.createdDate}
              onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              Add Component
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
