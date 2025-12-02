"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Trash2, Edit, Plus } from "lucide-react"
import type { Component } from "./dashboard"
import type { Machine } from "./machine-list"
import { AddComponentModal } from "./add-component-modal"
import { getComponents, deleteComponent, updateComponent, type Component as ApiComponent } from "@/lib/api"

interface ComponentListProps {
  data: Component[]
  setData: React.Dispatch<React.SetStateAction<Component[]>>
  machines: Machine[]
  onNavigateToMachines?: () => void
}

export function ComponentList({ data, setData, machines, onNavigateToMachines }: ComponentListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCount, setShowCount] = useState(10)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Convert API component to UI component format with machine name lookup
  const convertApiComponent = (apiComp: ApiComponent): Component => {
    return {
      id: apiComp.id,
      type: apiComp.machine_name || "Unassigned",
      componentId: apiComp.component_id || apiComp.id,  // Use component_id from API
      componentName: apiComp.component_name,
      subComponent: apiComp.sub_component,  // Fixed: was sup_component, should be sub_component
      failureMode: apiComp.failure_mode,
      failureHours: apiComp.failure_hours?.toString(),
      createdDate: new Date(apiComp.created_at).toLocaleDateString(),
    }
  }

  // Fetch components from API on mount
  useEffect(() => {
    fetchComponents()
  }, [machines])

  const fetchComponents = async () => {
    try {
      setLoading(true)
      setError("")
      const apiComponents = await getComponents()
      const uiComponents = apiComponents.map(convertApiComponent)
      setData(uiComponents)
    } catch (err) {
      console.error("Failed to fetch components:", err)
      setError("Failed to load components. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (component: Component) => {
    setEditingComponent(component)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (updatedData: Partial<Component>) => {
    if (!editingComponent) return

    try {
      // Find selected machine to get machine_id
      const selectedMachine = machines.find((m) => m.name === updatedData.type)

      await updateComponent(editingComponent.id, {
        component_name: updatedData.componentName || "",
        component_id: updatedData.componentId || "",
        machine_name: updatedData.type || "Unassigned",
        machine_id: selectedMachine?.id || null,
        sub_component: updatedData.subComponent,  // Fixed: was sup_component, should be sub_component
        failure_mode: updatedData.failureMode,
        failure_hours: updatedData.failureHours ? parseFloat(updatedData.failureHours) : undefined,
      })

      setShowEditModal(false)
      setEditingComponent(null)
      // Refresh to get latest data
      fetchComponents()
    } catch (err) {
      console.error("Failed to update component:", err)
      alert("Failed to update component. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this component?")) return

    try {
      await deleteComponent(id)
      setData(data.filter((c) => c.id !== id))
    } catch (err) {
      console.error("Failed to delete component:", err)
      alert("Failed to delete component. Please try again.")
    }
  }

  const handleAddComponent = (newComponent: Component) => {
    setData([...data, newComponent])
    setShowAddModal(false)
    // Refresh to get latest data
    fetchComponents()
  }

  // Filter data
  const filteredData = data.filter(
    (component) =>
      component.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.componentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.componentName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Group filtered data by machine and deduplicate by component name
  const groupedByMachine = filteredData.reduce(
    (acc, component) => {
      const machineName = component.type || "Unknown Machine"
      if (!acc[machineName]) {
        acc[machineName] = []
      }

      // Check if component with same name already exists in this machine group
      const existingIndex = acc[machineName].findIndex(c => c.componentName === component.componentName)

      if (existingIndex === -1) {
        // New component, add it
        acc[machineName].push(component)
      }
      // If exists, skip it (deduplicate)

      return acc
    },
    {} as Record<string, Component[]>,
  )

  const machineNames = Object.keys(groupedByMachine)

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Component Lists</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">Component Lists</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Component Lists</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Component
          </button>
          <button
            onClick={onNavigateToMachines}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Machine
          </button>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">Show</label>
            <select
              value={showCount}
              onChange={(e) => setShowCount(Number(e.target.value))}
              className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground font-medium"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <label className="text-sm font-medium text-foreground">All entries</label>
          </div>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 pl-10 text-sm text-foreground placeholder-muted-foreground font-medium"
          />
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 rounded-lg border border-border bg-card">
            <p className="text-muted-foreground text-base font-medium">Loading components...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center py-16 rounded-lg border border-border bg-card">
            <div className="text-center">
              <p className="text-muted-foreground text-base font-medium">No components yet.</p>
              <p className="text-muted-foreground text-sm mt-1">Upload a CSV or click "Add Component" to add one.</p>
            </div>
          </div>
        ) : machineNames.length === 0 ? (
          <div className="flex items-center justify-center py-16 rounded-lg border border-border bg-card">
            <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
          </div>
        ) : (
          machineNames.slice(0, showCount).map((machineName) => {
            const components = groupedByMachine[machineName]
            return (
              <div key={machineName} className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                {/* Machine Header */}
                <div className="bg-primary px-6 py-3">
                  <h2 className="text-lg font-bold text-primary-foreground">{machineName}</h2>
                </div>

                {/* Components Table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Component ID</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Component Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Created Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Tools</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((component) => (
                      <tr key={component.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 pl-12 pr-6">
                          <span className="text-foreground font-medium">{component.componentId || "-"}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-foreground font-medium">{component.componentName}</span>
                        </td>
                        <td className="px-6 py-3 text-foreground">{component.createdDate}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(component)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(component.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })
        )}
      </div>

      {data.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground font-medium">
          Showing {filteredData.length} components from {machineNames.length} machines
        </div>
      )}

      {showAddModal && (
        <AddComponentModal onAdd={handleAddComponent} onClose={() => setShowAddModal(false)} machines={machines} />
      )}

      {showEditModal && editingComponent && (
        <EditComponentModal
          component={editingComponent}
          machines={machines}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false)
            setEditingComponent(null)
          }}
        />
      )}
    </div>
  )
}

// Edit Component Modal
interface EditComponentModalProps {
  component: Component
  machines: Machine[]
  onSave: (data: Partial<Component>) => void
  onClose: () => void
}

function EditComponentModal({ component, machines, onSave, onClose }: EditComponentModalProps) {
  const [formData, setFormData] = useState({
    componentId: component.componentId || "",
    componentName: component.componentName || "",
    type: component.type || "Unassigned",
  })

  // Common component IDs and names
  const componentOptions = [
    { id: '1.1 Gear pump', name: 'Gear pump' },
    { id: '1.2 Single screw extruder', name: 'Single screw extruder' },
    { id: '1.3 Gearbox', name: 'Gearbox' },
    { id: '1.4 Electric Cabinet', name: 'Electric Cabinet' },
    { id: '1.5 Conveyor system', name: 'Conveyor system' },
    { id: '1.6 Cutter assembly', name: 'Cutter assembly' },
    { id: '1.7 Others', name: 'Others' },
  ]

  // When Component ID is selected, auto-fill Component Name
  const handleComponentIdChange = (componentId: string) => {
    const selected = componentOptions.find(opt => opt.id === componentId)
    setFormData({
      ...formData,
      componentId: componentId,
      componentName: selected?.name || ""
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-foreground mb-4">Edit Component</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Component ID */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Component ID</label>
            <select
              value={formData.componentId}
              onChange={(e) => handleComponentIdChange(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground"
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

          {/* Component Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Component Name</label>
            <input
              type="text"
              value={formData.componentName}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-muted-foreground cursor-not-allowed"
              disabled
              placeholder="Auto-filled from Component ID"
            />
            <p className="mt-1 text-xs text-muted-foreground">Component Name is auto-filled when you select Component ID</p>
          </div>

          {/* Machine Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Machine</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground"
              required
            >
              <option value="Unassigned">Unassigned</option>
              {machines.map((machine) => (
                <option key={machine.id} value={machine.name}>
                  {machine.name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
