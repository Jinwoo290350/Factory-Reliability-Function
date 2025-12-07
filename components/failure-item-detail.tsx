"use client"

import { useState, useEffect } from "react"
import { Search, ChevronLeft, Trash2, Edit } from "lucide-react"
import type { Component, FailureItem } from "./dashboard"
import { getComponents, deleteComponent, updateComponent, type Component as ApiComponent } from "@/lib/api"

interface FailureItemDetailProps {
  component: Component
  onSelectFailureItem: (item: FailureItem) => void
  onBack: () => void
}

export function FailureItemDetail({ component, onSelectFailureItem, onBack }: FailureItemDetailProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCount, setShowCount] = useState(10)
  const [failureItems, setFailureItems] = useState<FailureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [subComponentMap, setSubComponentMap] = useState<Map<string, ApiComponent[]>>(new Map())
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<FailureItem | null>(null)

  // Fetch all components with the same component_name and group by sub_component
  useEffect(() => {
    fetchFailureItems()
  }, [component])

  const fetchFailureItems = async () => {
    try {
      setLoading(true)
      // Get all components
      const allComponents = await getComponents()

      // Filter components with the same component_name
      const matchingComponents = allComponents.filter(
        (c) => c.component_name === component.componentName
      )

      // Group by sub_component (SupComponent)
      const newSubComponentMap = new Map<string, ApiComponent[]>()

      for (const comp of matchingComponents) {
        if (comp.sub_component) {
          const existing = newSubComponentMap.get(comp.sub_component) || []
          existing.push(comp)
          newSubComponentMap.set(comp.sub_component, existing)
        }
      }

      setSubComponentMap(newSubComponentMap)

      // Create failure items from unique sub_components with sequential IDs
      const items: FailureItem[] = []

      // Extract numeric part from component ID (e.g., "1.3 Gearbox" -> "13")
      const componentIdNumeric = component.componentId.split(' ')[0].replace(/\./g, '')

      let sequenceNumber = 1
      newSubComponentMap.forEach((components, subComponentName) => {
        // Use the first component with this sub_component for dates
        const firstComp = components[0]

        // Generate failure item ID: fi-13-001, fi-13-002, etc.
        const failureItemId = `fi-${componentIdNumeric}-${sequenceNumber.toString().padStart(3, '0')}`

        items.push({
          id: `fi-${component.id}-${subComponentName}`,
          failureItemId: failureItemId,
          failureItemName: subComponentName,
          componentId: component.componentId,
          createdDate: new Date(firstComp.created_at).toLocaleDateString(),
        })

        sequenceNumber++
      })

      // If no sub-components found, show a message
      if (items.length === 0) {
        items.push({
          id: `fi-${component.id}-empty`,
          failureItemId: component.componentId,
          failureItemName: "No sub-components found",
          componentId: component.componentId,
          createdDate: component.createdDate,
        })
      }

      setFailureItems(items)
    } catch (error) {
      console.error("Failed to fetch failure items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditFailureItem = (item: FailureItem) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleSaveEdit = async (newSubComponentName: string) => {
    if (!editingItem) return

    const componentsToUpdate = subComponentMap.get(editingItem.failureItemName) || []
    if (componentsToUpdate.length === 0) return

    try {
      // Update all components with this sub_component to new name
      for (const comp of componentsToUpdate) {
        await updateComponent(comp.id, {
          sub_component: newSubComponentName,
        })
      }

      // Refresh the list
      await fetchFailureItems()
      setShowEditModal(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Failed to update failure item:", error)
      alert("Failed to update failure item. Please try again.")
    }
  }

  const handleDeleteFailureItem = async (item: FailureItem) => {
    // Get all component IDs that have this sub_component
    const componentsToDelete = subComponentMap.get(item.failureItemName) || []

    if (componentsToDelete.length === 0) return

    const message = `Are you sure you want to delete "${item.failureItemName}"?\nThis will delete ${componentsToDelete.length} record(s) from the database.`

    if (!confirm(message)) return

    try {
      // Delete all components with this sub_component
      for (const comp of componentsToDelete) {
        await deleteComponent(comp.id)
      }

      // Refresh the list
      await fetchFailureItems()
    } catch (error) {
      console.error("Failed to delete failure item:", error)
      alert("Failed to delete failure item. Please try again.")
    }
  }

  const filteredData = failureItems.filter(
    (item) =>
      item.failureItemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.failureItemName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const displayedData = filteredData.slice(0, showCount)

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
        <h3 className="text-sm text-muted-foreground mb-2">Component Details</h3>
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
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">Failure Lists</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Failure Item</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Component {component.componentId}</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Failure Item - Component {component.componentId}</h1>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Show</label>
          <select
            value={showCount}
            onChange={(e) => setShowCount(Number(e.target.value))}
            className="rounded border border-border bg-input px-3 py-1 text-sm text-foreground"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <label className="text-sm text-muted-foreground">All entries</label>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-border bg-input px-3 py-2 pl-10 text-sm text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground text-base font-medium">Loading failure items...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-4 text-left font-semibold text-foreground">Failure Item ID</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Failure Item Name</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-6 py-4 text-foreground">{item.failureItemId}</td>
                  <td className="px-6 py-4 text-foreground">{item.failureItemName}</td>
                  <td className="px-6 py-4 text-foreground">{item.createdDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectFailureItem(item)}
                        className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-all"
                      >
                        Failure Model & Parameters
                      </button>
                      <button
                        onClick={() => handleEditFailureItem(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFailureItem(item)}
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
        )}
      </div>

      {failureItems.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {displayedData.length} of {filteredData.length} entries
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <EditFailureItemModal
          item={editingItem}
          componentsCount={subComponentMap.get(editingItem.failureItemName)?.length || 0}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditModal(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

// Edit Failure Item Modal Component
interface EditFailureItemModalProps {
  item: FailureItem
  componentsCount: number
  onSave: (newName: string) => void
  onClose: () => void
}

function EditFailureItemModal({ item, componentsCount, onSave, onClose }: EditFailureItemModalProps) {
  const [newName, setNewName] = useState(item.failureItemName)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      onSave(newName.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-foreground mb-4">Edit Failure Item</h2>

        <div className="mb-4 p-3 bg-secondary rounded">
          <p className="text-xs text-muted-foreground">This will update {componentsCount} record(s)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Failure Item Name (Sub-Component)</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
              placeholder="Enter new sub-component name"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
