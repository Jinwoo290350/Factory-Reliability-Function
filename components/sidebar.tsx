"use client"

interface SidebarProps {
  activeNav: string | null
  setActiveNav: (nav: string | null) => void
}

export function Sidebar({ activeNav, setActiveNav }: SidebarProps) {
  const menuItems = [
    { id: "manage", label: "MANAGE", disabled: true },
    { id: "componentLists", label: "Component Lists", disabled: false },
    { id: "failureLists", label: "Failure Lists", disabled: false },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col p-6">
      {/* Logo/Header Area */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-foreground">Factory System</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && setActiveNav(item.id)}
            disabled={item.disabled}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all text-sm ${
              item.disabled
                ? "text-sidebar-foreground/40 cursor-not-allowed bg-transparent"
                : activeNav === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20 cursor-pointer"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/60">Factory System v1.0</p>
      </div>
    </aside>
  )
}
