"use client"

import type React from "react"
import { useState } from "react"
import { Search, Trash2, Edit, Plus } from "lucide-react"
import { AddMachineModal } from "./add-machine-modal"

export interface Machine {
  id: string
  sequence: number
  name: string
  createdDate: string
}

interface MachineListProps {
  data: Machine[]
  setData: React.Dispatch<React.SetStateAction<Machine[]>>
}

export function MachineList({ data, setData }: MachineListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCount, setShowCount] = useState(10)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const handleEdit = (machine: Machine) => {
    setEditingId(machine.id)
    setEditName(machine.name)
  }

  const handleSaveEdit = (id: string) => {
    setData(
      data.map((m) =>
        m.id === id ? { ...m, name: editName, createdDate: new Date().toISOString().split("T")[0] } : m,
      ),
    )
    setEditingId(null)
    setEditName("")
  }

  const handleDelete = (id: string) => {
    setData(data.filter((m) => m.id !== id))
  }

  const handleAddMachine = (name: string) => {
    const newMachine: Machine = {
      id: `machine-${Date.now()}`,
      sequence: data.length + 1,
      name: name,
      createdDate: new Date().toISOString().split("T")[0],
    }
    setData([...data, newMachine])
    setShowAddModal(false)
  }

  const filteredData = data.filter((machine) => machine.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const displayedData = filteredData.slice(0, showCount)

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Manage Machine</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">Manage Machine</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Manage Machine</h1>
      </div>

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
        {data.length === 0 ? (
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
                <th className="px-6 py-4 text-left font-semibold text-foreground">Machine Sequence</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Machine Name</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((machine) => (
                <tr key={machine.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium">{machine.sequence}</td>
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
