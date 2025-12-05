"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Edit, Trash2, Plus, Image } from "lucide-react"
import type { Component, FailureItem, MachinePosition } from "./dashboard"
import * as api from "@/lib/api"

interface MachinePositionDetailProps {
  component: Component
  failureItem: FailureItem
  onBack: () => void
  onNavigateToMachinePicture?: (position: MachinePosition) => void
}

export function MachinePositionDetail({ component, failureItem, onBack, onNavigateToMachinePicture }: MachinePositionDetailProps) {
  const [positions, setPositions] = useState<MachinePosition[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<MachinePosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load positions from API on mount
  useEffect(() => {
    loadPositions()
  }, [failureItem.id])

  const loadPositions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getMachinePositions(failureItem.id)
      // Map API response to local format
      const mappedPositions: MachinePosition[] = data.map(p => ({
        id: p.id,
        positionName: p.position_name,
        description: p.description || "",
        createdDate: new Date(p.created_at).toLocaleDateString(),
      }))
      setPositions(mappedPositions)
    } catch (err: any) {
      console.error("Failed to load positions:", err)
      setError(err.message || "Failed to load positions")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return
    try {
      await api.deleteMachinePosition(id)
      setPositions(positions.filter((p) => p.id !== id))
    } catch (err: any) {
      console.error("Failed to delete position:", err)
      alert("Failed to delete position: " + (err.message || "Unknown error"))
    }
  }

  const handleAddPosition = async (newPosition: Omit<MachinePosition, "id" | "createdDate">) => {
    try {
      const created = await api.createMachinePosition({
        failure_item_id: failureItem.id,
        position_name: newPosition.positionName,
        description: newPosition.description || undefined,
      })
      const mappedPosition: MachinePosition = {
        id: created.id,
        positionName: created.position_name,
        description: created.description || "",
        createdDate: new Date(created.created_at).toLocaleDateString(),
      }
      setPositions([...positions, mappedPosition])
      setShowAddModal(false)
    } catch (err: any) {
      console.error("Failed to create position:", err)
      alert("Failed to create position: " + (err.message || "Unknown error"))
    }
  }

  const handleEditPosition = async (updatedData: Omit<MachinePosition, "id" | "createdDate">) => {
    if (!editingPosition) return
    try {
      const updated = await api.updateMachinePosition(editingPosition.id, {
        position_name: updatedData.positionName,
        description: updatedData.description || undefined,
      })
      setPositions(
        positions.map((p) =>
          p.id === editingPosition.id
            ? {
                ...p,
                positionName: updated.position_name,
                description: updated.description || "",
              }
            : p
        )
      )
      setShowEditModal(false)
      setEditingPosition(null)
    } catch (err: any) {
      console.error("Failed to update position:", err)
      alert("Failed to update position: " + (err.message || "Unknown error"))
    }
  }

  const handleEdit = (position: MachinePosition) => {
    setEditingPosition(position)
    setShowEditModal(true)
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

      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Position
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-muted-foreground text-base font-medium">Loading positions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-destructive text-base font-medium">Error: {error}</p>
              <button
                onClick={loadPositions}
                className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        ) : positions.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-muted-foreground text-base font-medium">No positions yet.</p>
              <p className="text-muted-foreground text-sm mt-1">Click "New Position" to add one.</p>
            </div>
          </div>
        ) : (
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
                  <td className="px-6 py-4 text-foreground text-xs max-w-md">{position.description}</td>
                  <td className="px-6 py-4 text-foreground">{position.createdDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(position)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80"
                      >
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
                      <button
                        onClick={() => onNavigateToMachinePicture?.(position)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                      >
                        <Image className="h-3 w-3" />
                        Machine Picture
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <PositionModal
          title="Add New Position"
          onSave={handleAddPosition}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && editingPosition && (
        <PositionModal
          title="Edit Position"
          initialData={editingPosition}
          onSave={handleEditPosition}
          onClose={() => {
            setShowEditModal(false)
            setEditingPosition(null)
          }}
        />
      )}
    </div>
  )
}

// Position Modal Component
interface PositionModalProps {
  title: string
  initialData?: MachinePosition
  onSave: (data: Omit<MachinePosition, "id" | "createdDate">) => void
  onClose: () => void
}

function PositionModal({ title, initialData, onSave, onClose }: PositionModalProps) {
  const [formData, setFormData] = useState({
    positionName: initialData?.positionName || "",
    description: initialData?.description || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-lg border border-border p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Position Name</label>
            <input
              type="text"
              value={formData.positionName}
              onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground"
              required
              placeholder="e.g., Typical Vibration Inspection Right"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Position Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground min-h-32"
              required
              placeholder="Enter position description..."
            />
          </div>

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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
