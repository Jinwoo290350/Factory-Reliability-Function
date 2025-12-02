"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { FailureList } from "./failure-list"
import { ComponentList } from "./component-list"
import { DevBar } from "./dev-bar"
import { FailureItemDetail } from "./failure-item-detail"
import { FailureModelDetail } from "./failure-model-detail"
import { RiskMatrixDetail } from "./risk-matrix-detail"
import { MachinePositionDetail } from "./machine-position-detail"
import { MachineList } from "./machine-list"

export interface ComponentType {
  type: string
  components: Component[]
}

export interface Component {
  id: string
  type: string
  componentId: string
  componentName: string
  subComponent?: string
  failureMode?: string
  failureHours?: string
  createdDate: string
}

export interface FailureItem {
  id: string
  failureItemId: string
  failureItemName: string
  componentId: string
  createdDate: string
}

export interface FailureMode {
  id: string
  failureModeId: string
  failureMode: string
  note?: string
  mtHours?: string
  reliability?: string
  createdDate?: string
}

export interface RiskData {
  failureModeId: string
  failureMode: string
  riskLevel: string
  probability: string
  reliability: string
  createdDate: string
}

export interface MachinePosition {
  id: string
  positionName: string
  description: string
  createdDate: string
}

export interface Machine {
  id: string
  machineName: string
  description: string
  createdDate: string
}

export function Dashboard() {
  const [activeNav, setActiveNav] = useState<string | null>("componentLists")
  const [components, setComponents] = useState<Component[]>([])
  const [machines, setMachines] = useState<Machine[]>([])

  const [currentPage, setCurrentPage] = useState<
    "main" | "failureItems" | "failureModels" | "riskMatrix" | "machinePosition" | "manageMachines"
  >("main")
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [selectedFailureItem, setSelectedFailureItem] = useState<FailureItem | null>(null)
  const [selectedFailureMode, setSelectedFailureMode] = useState<FailureMode | null>(null)

  const handleSelectComponent = (component: Component) => {
    setSelectedComponent(component)
    setCurrentPage("failureItems")
  }

  const handleSelectFailureItem = (item: FailureItem) => {
    setSelectedFailureItem(item)
    setCurrentPage("failureModels")
  }

  const handleSelectFailureMode = (mode: FailureMode) => {
    setSelectedFailureMode(mode)
  }

  const navigateToRiskMatrix = () => {
    setCurrentPage("riskMatrix")
  }

  const navigateToMachinePosition = () => {
    setCurrentPage("machinePosition")
  }

  const navigateToManageMachines = () => {
    setCurrentPage("manageMachines")
  }

  const goBack = () => {
    if (currentPage === "failureItems") {
      setCurrentPage("main")
      setSelectedComponent(null)
    } else if (currentPage === "failureModels") {
      setCurrentPage("failureItems")
      setSelectedFailureItem(null)
    } else if (currentPage === "riskMatrix") {
      setCurrentPage("failureModels")
      setSelectedFailureMode(null)
    } else if (currentPage === "machinePosition") {
      setCurrentPage("failureModels")
      setSelectedFailureMode(null)
    } else if (currentPage === "manageMachines") {
      setCurrentPage("main")
      setActiveNav("componentLists")
    }
  }

  const renderContent = () => {
    switch (currentPage) {
      case "main":
        switch (activeNav) {
          case "componentLists":
            return <ComponentList data={components} setData={setComponents} machines={machines} onNavigateToMachines={navigateToManageMachines} />
          case "failureLists":
            return <FailureList data={components} onSelectComponent={handleSelectComponent} />
          default:
            return <ComponentList data={components} setData={setComponents} machines={machines} onNavigateToMachines={navigateToManageMachines} />
        }
      case "manageMachines":
        return <MachineList data={machines} setData={setMachines} onBack={goBack} />
      case "failureItems":
        return (
          <FailureItemDetail
            component={selectedComponent!}
            onSelectFailureItem={handleSelectFailureItem}
            onBack={goBack}
          />
        )
      case "failureModels":
        return (
          <FailureModelDetail
            component={selectedComponent!}
            failureItem={selectedFailureItem!}
            onSelectFailureMode={handleSelectFailureMode}
            onNavigateToRiskMatrix={navigateToRiskMatrix}
            onNavigateToMachinePosition={navigateToMachinePosition}
            onBack={goBack}
          />
        )
      case "riskMatrix":
        return (
          <RiskMatrixDetail
            component={selectedComponent!}
            failureItem={selectedFailureItem!}
            failureMode={selectedFailureMode!}
            onBack={goBack}
          />
        )
      case "machinePosition":
        return (
          <MachinePositionDetail component={selectedComponent!} failureItem={selectedFailureItem!} onBack={goBack} />
        )
    }
  }

  const handleUploadSuccess = () => {
    // Refresh components and machines after successful CSV upload
    window.location.reload()
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <DevBar components={components} setComponents={setComponents} onUploadSuccess={handleUploadSuccess} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}
