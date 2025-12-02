"use client"

import { useState } from "react"
import { ChevronLeft, Edit, Trash2, Plus, Upload } from "lucide-react"
import type { Component, FailureItem, MachinePosition } from "./dashboard"

interface MachinePicture {
  id: string
  direction: string
  pictureUrl: string
  createdDate: string
}

interface MachinePictureDetailProps {
  component: Component
  failureItem: FailureItem
  position: MachinePosition
  onBack: () => void
}

export function MachinePictureDetail({ component, failureItem, position, onBack }: MachinePictureDetailProps) {
  const [pictures, setPictures] = useState<MachinePicture[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPicture, setEditingPicture] = useState<MachinePicture | null>(null)

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this picture?")) return
    setPictures(pictures.filter((p) => p.id !== id))
  }

  const handleAddPicture = (newPicture: Omit<MachinePicture, "id" | "createdDate">) => {
    const picture: MachinePicture = {
      id: `pic-${Date.now()}`,
      ...newPicture,
      createdDate: new Date().toLocaleDateString(),
    }
    setPictures([...pictures, picture])
    setShowAddModal(false)
  }

  const handleEditPicture = (updatedData: Omit<MachinePicture, "id" | "createdDate">) => {
    if (!editingPicture) return
    setPictures(
      pictures.map((p) =>
        p.id === editingPicture.id
          ? { ...p, direction: updatedData.direction, pictureUrl: updatedData.pictureUrl }
          : p
      )
    )
    setShowEditModal(false)
    setEditingPicture(null)
  }

  const handleEdit = (picture: MachinePicture) => {
    setEditingPicture(picture)
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
        <h3 className="text-sm text-muted-foreground mb-2">Position Detail</h3>
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
            <p className="text-xs text-muted-foreground">Failure Item ID</p>
            <p className="text-foreground font-semibold">{failureItem.failureItemId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Position Name</p>
            <p className="text-foreground font-semibold">{position.positionName}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">Failure Lists</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Machine Position</span>
          <span className="text-sm text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Machine Picture</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Machine Picture - {position.positionName}
        </h1>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Picture
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {pictures.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-muted-foreground text-base font-medium">No pictures yet.</p>
              <p className="text-muted-foreground text-sm mt-1">Click "New Picture" to add one.</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-6 py-4 text-left font-semibold text-foreground">Direction</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Picture</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Created Date</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground">Tools</th>
              </tr>
            </thead>
            <tbody>
              {pictures.map((picture) => (
                <tr key={picture.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-6 py-4 text-foreground">{picture.direction}</td>
                  <td className="px-6 py-4">
                    {picture.pictureUrl ? (
                      <img
                        src={picture.pictureUrl}
                        alt={picture.direction}
                        className="w-20 h-20 object-cover rounded border border-border"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-foreground">{picture.createdDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(picture)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(picture.id)}
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
        )}
      </div>

      {showAddModal && (
        <PictureModal
          title="Add New Picture"
          onSave={handleAddPicture}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && editingPicture && (
        <PictureModal
          title="Edit Picture"
          initialData={editingPicture}
          onSave={handleEditPicture}
          onClose={() => {
            setShowEditModal(false)
            setEditingPicture(null)
          }}
        />
      )}
    </div>
  )
}

// Picture Modal Component
interface PictureModalProps {
  title: string
  initialData?: MachinePicture
  onSave: (data: Omit<MachinePicture, "id" | "createdDate">) => void
  onClose: () => void
}

function PictureModal({ title, initialData, onSave, onClose }: PictureModalProps) {
  const [formData, setFormData] = useState({
    direction: initialData?.direction || "",
    pictureUrl: initialData?.pictureUrl || "",
  })
  const [previewUrl, setPreviewUrl] = useState(initialData?.pictureUrl || "")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewUrl(result)
        setFormData({ ...formData, pictureUrl: result })
      }
      reader.readAsDataURL(file)
    }
  }

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
            <label className="block text-sm font-medium text-foreground mb-2">Direction</label>
            <input
              type="text"
              value={formData.direction}
              onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground"
              required
              placeholder="e.g., Front, Back, Left, Right, Top"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Picture</label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Upload an image (JPG, PNG, GIF)
                </p>
              </div>
              {previewUrl && (
                <div className="w-32 h-32 border border-border rounded overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
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
