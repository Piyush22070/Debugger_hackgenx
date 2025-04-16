"use client"

import { useState } from "react"
import { ArrowUp, Calculator, Download, Save, Sparkles, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Initial sector data
const initialSectorData = [
  { id: 1, name: "Education", allocation: 28.4, impact: 85, color: "#22c55e" },
  { id: 2, name: "Healthcare", allocation: 26.2, impact: 88, color: "#3b82f6" },
  { id: 3, name: "Infrastructure", allocation: 20.2, impact: 76, color: "#f59e0b" },
  { id: 4, name: "Public Safety", allocation: 11.5, impact: 82, color: "#ef4444" },
  { id: 5, name: "Social Services", allocation: 8.2, impact: 79, color: "#8b5cf6" },
  { id: 6, name: "Environment", allocation: 5.5, impact: 72, color: "#06b6d4" },
]

// Impact metrics
const initialImpactMetrics = [
  { name: "Economic Growth", value: 3.2 },
  { name: "Job Creation", value: 12500 },
  { name: "Poverty Reduction", value: 2.8 },
  { name: "Public Health Index", value: 76.4 },
  { name: "Education Outcomes", value: 82.1 },
  { name: "Infrastructure Quality", value: 68.9 },
]

// Scenario presets
const scenarioPresets = [
  {
    id: 1,
    name: "Economic Growth Focus",
    description: "Prioritize sectors that drive economic development",
    allocations: {
      Education: 25.0,
      Healthcare: 20.0,
      Infrastructure: 30.0,
      "Public Safety": 10.0,
      "Social Services": 7.0,
      Environment: 8.0,
    },
  },
  {
    id: 2,
    name: "Social Welfare Priority",
    description: "Focus on healthcare, education and social services",
    allocations: {
      Education: 32.0,
      Healthcare: 30.0,
      Infrastructure: 15.0,
      "Public Safety": 8.0,
      "Social Services": 12.0,
      Environment: 3.0,
    },
  },
  {
    id: 3,
    name: "Balanced Approach",
    description: "Even distribution across all sectors",
    allocations: {
      Education: 25.0,
      Healthcare: 25.0,
      Infrastructure: 20.0,
      "Public Safety": 10.0,
      "Social Services": 10.0,
      Environment: 10.0,
    },
  },
  {
    id: 4,
    name: "Sustainability Focus",
    description: "Prioritize environmental and sustainable development",
    allocations: {
      Education: 25.0,
      Healthcare: 20.0,
      Infrastructure: 18.0,
      "Public Safety": 7.0,
      "Social Services": 10.0,
      Environment: 20.0,
    },
  },
]

export function ScenarioBuilder() {
  const [sectorData, setSectorData] = useState(initialSectorData)
  const [impactMetrics, setImpactMetrics] = useState(initialImpactMetrics)
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)
  const [scenarioName, setScenarioName] = useState("")
  const [activeTab, setActiveTab] = useState("builder")
  const [simulationYears, setSimulationYears] = useState(5)
  const [simulationFocus, setSimulationFocus] = useState("balanced")

  // Function to handle slider changes
  const handleAllocationChange = (id: number, newValue: number[]) => {
    const value = newValue[0]

    // Calculate the difference from the current value
    const currentSector = sectorData.find((s) => s.id === id)
    if (!currentSector) return

    const difference = value - currentSector.allocation

    // If increasing allocation, decrease others proportionally
    if (difference > 0) {
      setSectorData((prev) => {
        const otherSectors = prev.filter((s) => s.id !== id)
        const totalOtherAllocation = otherSectors.reduce((sum, s) => sum + s.allocation, 0)

        return prev.map((sector) => {
          if (sector.id === id) {
            return { ...sector, allocation: value }
          } else {
            // Proportionally decrease other sectors
            const decreaseFactor = (totalOtherAllocation - difference) / totalOtherAllocation
            return {
              ...sector,
              allocation: Math.max(0.5, sector.allocation * decreaseFactor),
            }
          }
        })
      })
    }
    // If decreasing allocation, increase others proportionally
    else if (difference < 0) {
      setSectorData((prev) => {
        const otherSectors = prev.filter((s) => s.id !== id)
        const totalOtherAllocation = otherSectors.reduce((sum, s) => sum + s.allocation, 0)

        return prev.map((sector) => {
          if (sector.id === id) {
            return { ...sector, allocation: value }
          } else {
            // Proportionally increase other sectors
            const increaseFactor = (totalOtherAllocation - difference) / totalOtherAllocation
            return {
              ...sector,
              allocation: sector.allocation * increaseFactor,
            }
          }
        })
      })
    }

    // Reset selected scenario when manual changes are made
    setSelectedScenario(null)

    // Update impact metrics based on allocation changes
    updateImpactMetrics()
  }

  // Apply scenario preset
  const applyScenario = (scenarioId: number) => {
    const scenario = scenarioPresets.find((s) => s.id === scenarioId)
    if (!scenario) return

    setSectorData((prev) =>
      prev.map((sector) => ({
        ...sector,
        allocation: scenario.allocations[sector.name as keyof typeof scenario.allocations] || sector.allocation,
      })),
    )

    setSelectedScenario(scenarioId)
    setScenarioName(scenario.name)

    // Update impact metrics based on new allocations
    updateImpactMetrics()
  }

  // Update impact metrics based on allocation changes
  const updateImpactMetrics = () => {
    // Education affects Education Outcomes
    const educationAllocation = sectorData.find((s) => s.name === "Education")?.allocation || 0
    const healthcareAllocation = sectorData.find((s) => s.name === "Healthcare")?.allocation || 0
    const infrastructureAllocation = sectorData.find((s) => s.name === "Infrastructure")?.allocation || 0
    const socialAllocation = sectorData.find((s) => s.name === "Social Services")?.allocation || 0

    setImpactMetrics((prev) => {
      const newMetrics = [...prev]

      // Update Economic Growth
      const economicIndex = newMetrics.findIndex((m) => m.name === "Economic Growth")
      if (economicIndex >= 0) {
        const baseValue = 2.5
        const infraFactor = (infrastructureAllocation / 20) * 0.5
        const eduFactor = (educationAllocation / 25) * 0.3
        const healthFactor = (healthcareAllocation / 25) * 0.2
        newMetrics[economicIndex].value = Number.parseFloat(
          (baseValue + (infraFactor + eduFactor + healthFactor) * 2).toFixed(1),
        )
      }

      // Update Job Creation
      const jobIndex = newMetrics.findIndex((m) => m.name === "Job Creation")
      if (jobIndex >= 0) {
        const baseValue = 10000
        const infraFactor = (infrastructureAllocation / 20) * 0.4
        const eduFactor = (educationAllocation / 25) * 0.3
        const socialFactor = (socialAllocation / 8) * 0.3
        newMetrics[jobIndex].value = Math.round(baseValue * (1 + infraFactor + eduFactor + socialFactor))
      }

      // Update Poverty Reduction
      const povertyIndex = newMetrics.findIndex((m) => m.name === "Poverty Reduction")
      if (povertyIndex >= 0) {
        const baseValue = 2.0
        const socialFactor = (socialAllocation / 8) * 0.5
        const healthFactor = (healthcareAllocation / 25) * 0.3
        const eduFactor = (educationAllocation / 25) * 0.2
        newMetrics[povertyIndex].value = Number.parseFloat(
          (baseValue + (socialFactor + healthFactor + eduFactor) * 2).toFixed(1),
        )
      }

      // Update Public Health Index
      const healthIndex = newMetrics.findIndex((m) => m.name === "Public Health Index")
      if (healthIndex >= 0) {
        const baseValue = 70
        const healthFactor = healthcareAllocation / 25
        newMetrics[healthIndex].value = Number.parseFloat((baseValue + healthFactor * 10).toFixed(1))
      }

      // Update Education Outcomes
      const eduIndex = newMetrics.findIndex((m) => m.name === "Education Outcomes")
      if (eduIndex >= 0) {
        const baseValue = 75
        const eduFactor = educationAllocation / 25
        newMetrics[eduIndex].value = Number.parseFloat((baseValue + eduFactor * 10).toFixed(1))
      }

      // Update Infrastructure Quality
      const infraIndex = newMetrics.findIndex((m) => m.name === "Infrastructure Quality")
      if (infraIndex >= 0) {
        const baseValue = 60
        const infraFactor = infrastructureAllocation / 20
        newMetrics[infraIndex].value = Number.parseFloat((baseValue + infraFactor * 10).toFixed(1))
      }

      return newMetrics
    })
  }

  // Generate projection data for simulation
  const generateProjectionData = () => {
    const projectionData: Array<{
      year: number
      budget: number
      EconomicGrowth?: number
      JobCreation?: number
      PovertyReduction?: number
      PublicHealthIndex?: number
      EducationOutcomes?: number
      InfrastructureQuality?: number
    }> = []
    const currentYear = new Date().getFullYear()

    // Calculate base growth rate based on economic growth metric
    const economicGrowth = impactMetrics.find((m) => m.name === "Economic Growth")?.value || 3.0
    const baseGrowthRate = economicGrowth / 100

    // Adjust growth rate based on simulation focus
    let adjustedGrowthRate = baseGrowthRate
    if (simulationFocus === "economic") {
      adjustedGrowthRate = baseGrowthRate * 1.2
    } else if (simulationFocus === "social") {
      adjustedGrowthRate = baseGrowthRate * 0.9
    }

    // Generate data for each year
    let cumulativeBudget = 24.5 // Starting budget in billions
    for (let i = 0; i < simulationYears; i++) {
      const year = currentYear + i

      // Calculate growth for this year
      cumulativeBudget = cumulativeBudget * (1 + adjustedGrowthRate)

      // Calculate sector allocations
      const sectorAllocations = sectorData.map((sector) => ({
        name: sector.name,
        value: (sector.allocation / 100) * cumulativeBudget,
      }))

      // Calculate metrics for this year
      const yearMetrics: Record<string, number> = {}
      impactMetrics.forEach((metric) => {
        const growthFactor = 1 + adjustedGrowthRate * (i + 1) * 0.5
        if (metric.name === "Economic Growth") {
          yearMetrics[metric.name.replace(/\s+/g, "")] = Number.parseFloat((metric.value * growthFactor).toFixed(1))
        } else if (metric.name === "Job Creation") {
          yearMetrics[metric.name.replace(/\s+/g, "")] = Math.round(metric.value * growthFactor)
        } else if (metric.name === "Poverty Reduction") {
          yearMetrics[metric.name.replace(/\s+/g, "")] = Number.parseFloat((metric.value * growthFactor).toFixed(1))
        } else {
          // For index metrics, cap at 100
          yearMetrics[metric.name.replace(/\s+/g, "")] = Math.min(
            100,
            Number.parseFloat((metric.value * growthFactor).toFixed(1)),
          )
        }
      })

      projectionData.push({
        year,
        budget: Number.parseFloat(cumulativeBudget.toFixed(1)),
        ...yearMetrics,
      })
    }

    return projectionData
  }

  // Run simulation
  const runSimulation = () => {
    setActiveTab("simulation")
  }

  // Save scenario
  const saveScenario = () => {
    // In a real application, this would save the scenario to a database
    alert(`Scenario "${scenarioName || "Untitled"}" saved successfully!`)
  }

  // Generate projection data for charts
  const projectionData = generateProjectionData()

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="builder">Scenario Builder</TabsTrigger>
          <TabsTrigger value="simulation">Simulation Results</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Scenario Builder</CardTitle>
                    <CardDescription>Create and test different budget allocation scenarios</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={saveScenario}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="scenario-name">Scenario Name</Label>
                    <Input
                      id="scenario-name"
                      placeholder="Enter scenario name"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Scenario Presets</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {scenarioPresets.map((scenario) => (
                        <Button
                          key={scenario.id}
                          variant={selectedScenario === scenario.id ? "default" : "outline"}
                          className="justify-start h-auto py-2"
                          onClick={() => applyScenario(scenario.id)}
                        >
                          <div className="text-left">
                            <div className="font-medium">{scenario.name}</div>
                            <div className="text-xs text-muted-foreground">{scenario.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Budget Allocation</h3>
                    {sectorData.map((sector) => (
                      <div key={sector.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                            <span className="font-medium">{sector.name}</span>
                          </div>
                          <span className="font-bold text-sm">{sector.allocation.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[sector.allocation]}
                            min={0.5}
                            max={50}
                            step={0.1}
                            onValueChange={(value) => handleAllocationChange(sector.id, value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Simulation Parameters</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="simulation-years">Simulation Years</Label>
                        <Select
                          value={simulationYears.toString()}
                          onValueChange={(value) => setSimulationYears(Number.parseInt(value))}
                        >
                          <SelectTrigger id="simulation-years">
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="10">10 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="simulation-focus">Simulation Focus</Label>
                        <Select value={simulationFocus} onValueChange={setSimulationFocus}>
                          <SelectTrigger id="simulation-focus">
                            <SelectValue placeholder="Select focus" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balanced">Balanced Growth</SelectItem>
                            <SelectItem value="economic">Economic Focus</SelectItem>
                            <SelectItem value="social">Social Welfare Focus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center justify-between w-full">
                  <Button variant="outline">
                    <Calculator className="mr-2 h-4 w-4" />
                    Reset Scenario
                  </Button>
                  <Button onClick={runSimulation}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run Simulation
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Impact Preview</CardTitle>
                <CardDescription>Projected outcomes based on current allocation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Projected Impact Metrics</h3>
                  <div className="space-y-3">
                    {impactMetrics.map((metric, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{metric.name}</span>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {typeof metric.value === "number" && metric.value > 1000
                                ? metric.value.toLocaleString()
                                : metric.value}
                            </span>
                            {metric.name === "Economic Growth" && <span className="ml-1">%</span>}
                          </div>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${
                                metric.name === "Economic Growth"
                                  ? (metric.value / 5) * 100
                                  : metric.name === "Job Creation"
                                    ? (metric.value / 20000) * 100
                                    : metric.name === "Poverty Reduction"
                                      ? (metric.value / 5) * 100
                                      : (metric.value / 100) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">First Year Budget Allocation</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sectorData.map((sector) => ({
                          name: sector.name,
                          value: (sector.allocation / 100) * 24.5,
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Budget (Billions ₹)", angle: -90, position: "insideLeft" }} />
                        <Tooltip formatter={(value) => [typeof value === "number" ? `₹${value.toFixed(1)}B` : value, "Budget"]} />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="simulation" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{scenarioName || "Untitled Scenario"} - Simulation Results</CardTitle>
                  <CardDescription>
                    Projected outcomes over {simulationYears} years with{" "}
                    {simulationFocus === "balanced"
                      ? "balanced growth"
                      : simulationFocus === "economic"
                        ? "economic focus"
                        : "social welfare focus"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Budget Growth Projection</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis label={{ value: "Budget (Billions ₹)", angle: -90, position: "insideLeft" }} />
                      <Tooltip formatter={(value) => [`₹${value}B`, "Total Budget"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        name="Total Budget"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Economic Impact Metrics</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="EconomicGrowth"
                        name="Economic Growth (%)"
                        stroke="#22c55e"
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="PovertyReduction" name="Poverty Reduction (%)" stroke="#8b5cf6" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Social Impact Metrics</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="PublicHealthIndex" name="Public Health Index" stroke="#ef4444" />
                      <Line type="monotone" dataKey="EducationOutcomes" name="Education Outcomes" stroke="#f59e0b" />
                      <Line
                        type="monotone"
                        dataKey="InfrastructureQuality"
                        name="Infrastructure Quality"
                        stroke="#06b6d4"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Job Creation Projection</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), "Jobs Created"]} />
                      <Legend />
                      <Bar dataKey="JobCreation" name="Jobs Created" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {impactMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Current:</span>
                        <span className="font-bold">
                          {typeof metric.value === "number" && metric.value > 1000
                            ? metric.value.toLocaleString()
                            : metric.value}
                          {metric.name === "Economic Growth" && "%"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">After {simulationYears} years:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {typeof projectionData[projectionData.length - 1][metric.name.replace(/\s+/g, "") as keyof typeof projectionData[0]] ===
                              "number" &&
                            (projectionData[projectionData.length - 1][metric.name.replace(/\s+/g, "") as keyof typeof projectionData[0]] ?? 0) > 1000
                              ? projectionData[projectionData.length - 1][
                                  metric.name.replace(/\s+/g, "") as keyof typeof projectionData[0]
                                ]?.toLocaleString()
                              : projectionData[projectionData.length - 1][metric.name.replace(/\s+/g, "") as keyof typeof projectionData[0]]}
                            {metric.name === "Economic Growth" && "%"}
                          </span>
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${
                              metric.name === "Economic Growth"
                                ? (metric.value / 5) * 100
                                : metric.name === "Job Creation"
                                  ? (metric.value / 20000) * 100
                                  : metric.name === "Poverty Reduction"
                                    ? (metric.value / 5) * 100
                                    : (metric.value / 100) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${
                              metric.name === "Economic Growth"
                                ? (projectionData[projectionData.length - 1][metric.name.replace(/\s+/g, "") as keyof typeof projectionData[0]] as number / 5) * 100
                                : metric.name === "Job Creation"
                                  ? ((projectionData[projectionData.length - 1][metric.name.replace(/\s+/g, "") as keyof typeof projectionData[0]] ?? 0) / 20000) * 100
                                  : metric.name === "Poverty Reduction"
                                    ? ((projectionData[projectionData.length - 1] as Record<string, number>)[metric.name.replace(/\s+/g, "")] / 5) * 100
                                    : ((projectionData[projectionData.length - 1][metric.name.replace(/\s+/g, "") as keyof typeof projectionData[0]] ?? 0) / 100) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Projected growth: +
                        {(
                          (((projectionData[projectionData.length - 1] as Record<string, number>)[metric.name.replace(/\s+/g, "")] - metric.value) / metric.value) * 100
                        ).toFixed(1)}
                        %
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("builder")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Builder
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Scenario
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
