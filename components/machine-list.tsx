"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Trash2, Edit, Plus, ArrowLeft } from "lucide-react"
import { AddMachineModal } from "./add-machine-modal"
import { getMachines, deleteMachine, updateMachine, type Machine as ApiMachine } from "@/lib/api"

export interface Machine {
  id: string
  sequence: number
  componentId: string  // Component ID format like "1.1", "1.2"
  name: string
  createdDate: string
}

interface MachineListProps {
  data: Machine[]
  setData: React.Dispatch<React.SetStateAction<Machine[]>>
  onBack?: () => void
}

// Convert API machine to UI machine format
function convertApiMachine(apiMachine: ApiMachine): Machine {
  return {
    id: apiMachine.id,
    sequence: apiMachine.sequence_number,
    componentId: `1.${apiMachine.sequence_number}`,  // Generate Component ID from sequence
    name: apiMachine.name,
    createdDate: new Date(apiMachine.created_at).toLocaleDateString(),
  }
}

export function MachineList({ data, setData, onBack }: MachineListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCount, setShowCount] = useState(10)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch machines from API on mount
  useEffect(() => {
    fetchMachines()
  }, [])

  const fetchMachines = async () => {
    try {
      setLoading(true)
      setError("")
      const apiMachines = await getMachines()
      const uiMachines = apiMachines.map(convertApiMachine)
      setData(uiMachines)
    } catch (err) {
      console.error("Failed to fetch machines:", err)
      setError("Failed to load machines. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (machine: Machine) => {
    setEditingId(machine.id)
    setEditName(machine.name)
  }

  const handleSaveEdit = async (id: string) => {
    try {
      await updateMachine(id, { name: editName })
      setData(
        data.map((m) =>
          m.id === id ? { ...m, name: editName, createdDate: new Date().toLocaleDateString() } : m,
        ),
      )
      setEditingId(null)
      setEditName("")
    } catch (err) {
      console.error("Failed to update machine:", err)
      alert("Failed to update machine. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this machine?")) return

    try {
      await deleteMachine(id)
      setData(data.filter((m) => m.id !== id))
    } catch (err) {
      console.error("Failed to delete machine:", err)
      alert("Failed to delete machine. Please try again.")
    }
  }

  const handleAddMachine = (name: string) => {
    // This will be handled by the modal
    setShowAddModal(false)
    // Refresh to get latest data
    fetchMachines()
  }

  const filteredData = data.filter((machine) => machine.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const displayedData = filteredData.slice(0, showCount)

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Component Lists</span>
          </button>
        )}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Manage Machine</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">Manage Machine</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Manage Machine</h1>
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
            New Machine
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
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 pl-10 text-sm text-foreground placeholder-muted-foreground font-medium"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground text-base font-medium">Loading machines...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-muted-foreground text-base font-medium">No machines yet.</p>
              <p className="text-muted-foreground text-sm mt-1">Click "New Machine" to add one.</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-4 text-left font-semibold text-foreground">Component ID</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Machine Name</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((machine) => (
                <tr key={machine.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">{machine.componentId}</td>
                  <td className="px-6 py-4">
                    {editingId === machine.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-input px-3 py-1.5 text-foreground text-sm font-medium"
                        autoFocus
                      />
                    ) : (
                      <span className="text-foreground font-medium">{machine.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">{machine.createdDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {editingId === machine.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(machine.id)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditName("")
                            }}
                            className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(machine)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-all"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(machine.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground font-medium">
          Showing {displayedData.length} to {Math.min(showCount, filteredData.length)} of {filteredData.length} entries
        </div>
      )}

      {showAddModal && <AddMachineModal onAdd={handleAddMachine} onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
