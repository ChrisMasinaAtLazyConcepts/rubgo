"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { StorageUnit } from "@/lib/storage-data"
import { MapPin, Ruler } from "lucide-react"
import Image from "next/image"

interface UnitCardProps {
  unit: StorageUnit
  onBook: (unit: StorageUnit) => void
}

export function UnitCard({ unit, onBook }: UnitCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={unit.image || "/placeholder.svg"} alt={unit.name} fill className="object-cover" />
        {!unit.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="secondary" className="text-base">
              Not Available
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">{unit.name}</h3>
            <Badge variant="outline" className="capitalize shrink-0">
              {unit.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Ruler className="h-4 w-4" />
            <span>{unit.size}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Dam Safe</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {unit.features.slice(0, 3).map((feature) => (
            <Badge key={feature} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {unit.features.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{unit.features.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-2xl font-bold text-primary">R{unit.price}</p>
            <p className="text-xs text-muted-foreground">per {unit.priceUnit}</p>
          </div>
          <Button
            onClick={() => onBook(unit)}
            disabled={!unit.available}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {unit.available ? "Book Now" : "Unavailable"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
