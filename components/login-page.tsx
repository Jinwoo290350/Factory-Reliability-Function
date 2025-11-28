"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { LoginForm } from "./login-form"

export function LoginPage() {
  const [activeNav, setActiveNav] = useState<string | null>(null)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <div className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  )
}
