"use client"

import { useState } from "react"

export function ProfileSection() {
  const [isOnline, setIsOnline] = useState(true)

  return (
    <div className="flex items-center gap-3">
      {/* Profile Avatar */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
        <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      {/* Username and Status */}
      <div className="flex flex-col">
        <p className="text-sm font-medium text-foreground">Admin User</p>
        <div className="flex items-center gap-1">
          <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
          <p className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>
    </div>
  )
}
