"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { storageTypes } from "@/lib/storage-data"
import { useRouter } from "next/navigation"

export default function BrowsePage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    // Navigate to home with filter applied
    router.push(`/home?type=${type}`)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Browse Storage" />

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">What are you storing?</h2>
          <p className="text-muted-foreground">Choose a category to find the perfect storage solution</p>
        </div>

        <div className="grid gap-4">
          {storageTypes
            .filter((type) => type.value !== "all")
            .map((type) => (
              <Button
                key={type.value}
                variant="outline"
                className="h-auto p-6 justify-start text-left hover:border-primary hover:bg-primary/5 bg-transparent"
                onClick={() => handleTypeSelect(type.value)}
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {type.value === "container" && "Secure container storage for household and business items"}
                    {type.value === "vehicle" && "Protected parking for cars, motorcycles, and more"}
                    {type.value === "boat" && "Covered storage for boats and watercraft"}
                    {type.value === "lockbox" && "High-security storage for valuables and documents"}
                  </p>
                </div>
              </Button>
            ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
