"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { ProfileSection } from "./profile-section"
import type { Component } from "./dashboard"
import { uploadCSV } from "@/lib/api"

interface DevBarProps {
  components: Component[]
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>
  onUploadSuccess?: () => void
}

export function DevBar({ components, setComponents, onUploadSuccess }: DevBarProps) {
  const { theme, setTheme } = useTheme()
  const [uploading, setUploading] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const response = await uploadCSV(file)
      console.log("Upload successful:", response)

      // Show success message
      alert(`CSV uploaded successfully!\n\nMachines created: ${response.machines_created}\nComponents created: ${response.components_created}`)

      // Trigger refresh callback
      if (onUploadSuccess) {
        onUploadSuccess()
      }

      // Reset input
      e.target.value = ""
    } catch (error) {
      console.error("Upload failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      alert(`Failed to upload CSV: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-8 py-4">
        <ProfileSection />

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <div className="flex items-center gap-2 border-l border-border pl-4">
            <label
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 rounded bg-secondary text-foreground transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary/80"}`}
            >
              <Upload className="h-4 w-4" />
              <span className="text-xs font-medium">{uploading ? "Uploading..." : "Upload CSV"}</span>
              <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
