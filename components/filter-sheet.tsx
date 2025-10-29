// components/filter-sheet.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Filter } from "lucide-react"
import { FilterOptions } from "@/lib/types"

interface FilterSheetProps {
  onFilterChange: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

export function FilterSheet({ onFilterChange, currentFilters }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters)

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      serviceType: "all",
      maxPrice: 1000,
      rating: 0,
      genderPreference: "any",
      availableNow: false,
      type: ""
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Therapists</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Service Type Filter */}
          <div className="space-y-3">
            <Label htmlFor="service-type">Service Type</Label>
            <select
              id="service-type"
              value={localFilters.serviceType}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="all">All Services</option>
              <option value="swedish">Swedish Massage</option>
              <option value="deep-tissue">Deep Tissue</option>
              <option value="sports">Sports Massage</option>
              <option value="prenatal">Prenatal</option>
              <option value="couples">Couples</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div className="space-y-3">
            <Label htmlFor="max-price">
              Max Price: R{localFilters.maxPrice}
            </Label>
            <input
              type="range"
              id="max-price"
              min="100"
              max="2000"
              step="50"
              value={localFilters.maxPrice}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>R100</span>
              <span>R2000</span>
            </div>
          </div>

          {/* Minimum Rating Filter */}
          <div className="space-y-3">
            <Label>Minimum Rating</Label>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  type="button"
                  variant={localFilters.rating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalFilters(prev => ({ ...prev, rating }))}
                >
                  {rating === 0 ? 'Any' : `${rating}+`}
                </Button>
              ))}
            </div>
          </div>

          {/* Gender Preference Filter */}
          <div className="space-y-3">
            <Label>Gender Preference</Label>
            <div className="space-y-2">
              {[
                { value: "any", label: "Any Gender" },
                { value: "male", label: "Male Therapists" },
                { value: "female", label: "Female Therapists" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`gender-${option.value}`}
                    name="gender-preference"
                    checked={localFilters.genderPreference === option.value}
                    onChange={() => setLocalFilters(prev => ({ ...prev, genderPreference: option.value as any }))}
                    className="h-4 w-4 text-primary"
                  />
                  <Label htmlFor={`gender-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Available Now Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="available-now"
              checked={localFilters.availableNow}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, availableNow: e.target.checked }))}
              className="h-4 w-4 text-primary"
            />
            <Label htmlFor="available-now" className="text-sm">
              Show only available therapists
            </Label>
          </div>
        </div>

        <SheetFooter className="flex gap-2 pt-6">
          <Button variant="outline" onClick={handleResetFilters} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}