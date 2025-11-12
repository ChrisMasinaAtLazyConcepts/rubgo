"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Filter, Star, Clock, Award, Sparkles, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Therapist {
  id: string
  name: string
  image: string
  rating: number
  reviews: number
  rate: number
  specialization: string[]
  experience: number
  distance: number
  available: boolean
  nextAvailable: string
  location: string
  bio: string
  languages: string[]
  verified: boolean
}

interface FilterState {
  priceRange: [number, number]
  specialization: string[]
  rating: number
  experience: number
  availability: string
  distance: number
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [200, 800],
    specialization: [],
    rating: 0,
    experience: 0,
    availability: "any",
    distance: 10
  })

  // Mock data for therapists
  const therapists: Therapist[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 127,
      rate: 650,
      specialization: ["Swedish Massage", "Deep Tissue", "Sports Massage"],
      experience: 8,
      distance: 1.2,
      available: true,
      nextAvailable: "14:00",
      location: "Sandton",
      bio: "Certified massage therapist with 8 years of experience specializing in therapeutic and relaxation massage.",
      languages: ["English", "Zulu"],
      verified: true
    },
    {
      id: "2",
      name: "James Mbeki",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: 89,
      rate: 550,
      specialization: ["Deep Tissue", "Trigger Point", "Myofascial Release"],
      experience: 6,
      distance: 2.5,
      available: true,
      nextAvailable: "15:30",
      location: "Rosebank",
      bio: "Specialized in deep tissue and therapeutic massage for chronic pain relief.",
      languages: ["English", "Xhosa"],
      verified: true
    },
    {
      id: "3",
      name: "Priya Singh",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5.0,
      reviews: 203,
      rate: 750,
      specialization: ["Aromatherapy", "Hot Stone", "Prenatal Massage"],
      experience: 10,
      distance: 3.1,
      available: false,
      nextAvailable: "Tomorrow",
      location: "Parkhurst",
      bio: "Holistic massage therapist focusing on aromatherapy and stress relief techniques.",
      languages: ["English", "Hindi"],
      verified: true
    },
    {
      id: "4",
      name: "David Chen",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      reviews: 64,
      rate: 450,
      specialization: ["Thai Massage", "Reflexology", "Cupping Therapy"],
      experience: 5,
      distance: 4.2,
      available: true,
      nextAvailable: "16:00",
      location: "Melville",
      bio: "Traditional Thai massage specialist with modern therapeutic approaches.",
      languages: ["English", "Mandarin"],
      verified: false
    },
    {
      id: "5",
      name: "Amanda van der Merwe",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 156,
      rate: 600,
      specialization: ["Lymphatic Drainage", "Swedish Massage", "Geriatric Massage"],
      experience: 7,
      distance: 1.8,
      available: true,
      nextAvailable: "13:45",
      location: "Sandton",
      bio: "Medical massage therapist specializing in post-operative and lymphatic drainage massage.",
      languages: ["English", "Afrikaans"],
      verified: true
    }
  ]

  const specializations = [
    "Swedish Massage",
    "Deep Tissue",
    "Sports Massage",
    "Aromatherapy",
    "Hot Stone",
    "Thai Massage",
    "Prenatal Massage",
    "Reflexology",
    "Trigger Point",
    "Myofascial Release",
    "Lymphatic Drainage",
    "Cupping Therapy"
  ]

  const locations = ["Sandton", "Rosebank", "Parkhurst", "Melville", "Randburg", "Fourways"]

  // Filter therapists based on search and filters
  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         therapist.specialization.some(spec => 
                           spec.toLowerCase().includes(searchQuery.toLowerCase())
                         ) ||
                         therapist.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSpecialization = filters.specialization.length === 0 || 
                                filters.specialization.some(spec => 
                                  therapist.specialization.includes(spec)
                                )
    
    const matchesRating = therapist.rating >= filters.rating
    const matchesExperience = therapist.experience >= filters.experience
    const matchesPrice = therapist.rate >= filters.priceRange[0] && 
                        therapist.rate <= filters.priceRange[1]
    const matchesDistance = therapist.distance <= filters.distance
    const matchesAvailability = filters.availability === "any" || 
                               (filters.availability === "available" && therapist.available)

    return matchesSearch && matchesSpecialization && matchesRating && 
           matchesExperience && matchesPrice && matchesDistance && matchesAvailability
  })

  const handleSpecializationToggle = (spec: string) => {
    setFilters(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [200, 800],
      specialization: [],
      rating: 0,
      experience: 0,
      availability: "any",
      distance: 10
    })
  }

  const FilterModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Price Range</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>R{filters.priceRange[0]}</span>
                <span>R{filters.priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Specialization */}
          <div>
            <h3 className="font-medium mb-3">Specialization</h3>
            <div className="grid grid-cols-2 gap-2">
              {specializations.map(spec => (
                <Button
                  key={spec}
                  variant={filters.specialization.includes(spec) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSpecializationToggle(spec)}
                  className="justify-start text-xs h-auto py-2"
                >
                  {spec}
                </Button>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <h3 className="font-medium mb-3">Minimum Rating</h3>
            <div className="flex gap-2">
              {[4, 4.5, 4.7, 4.9].map(rating => (
                <Button
                  key={rating}
                  variant={filters.rating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, rating }))}
                >
                  ⭐ {rating}+
                </Button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="font-medium mb-3">Minimum Experience</h3>
            <div className="flex gap-2">
              {[0, 3, 5, 8].map(exp => (
                <Button
                  key={exp}
                  variant={filters.experience === exp ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, experience: exp }))}
                >
                  {exp === 0 ? "Any" : `${exp}+ years`}
                </Button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="font-medium mb-3">Availability</h3>
            <div className="flex gap-2">
              <Button
                variant={filters.availability === "any" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, availability: "any" }))}
              >
                Any Time
              </Button>
              <Button
                variant={filters.availability === "available" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, availability: "available" }))}
              >
                Available Now
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={clearAllFilters} className="flex-1">
              Clear All
            </Button>
            <Button onClick={() => setShowFilters(false)} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )

  const TherapistCard = ({ therapist }: { therapist: Therapist }) => (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={therapist.image}
                  alt={therapist.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                />
                {therapist.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                    <Award className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{therapist.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {therapist.rating} ({therapist.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">R{therapist.rate}</p>
              <p className="text-xs text-muted-foreground">per session</p>
            </div>
          </div>

          {/* Specialization & Location */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {therapist.specialization.slice(0, 2).map(spec => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {therapist.specialization.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{therapist.specialization.length - 2} more
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{therapist.location} • {therapist.distance}km away</span>
            </div>
          </div>

          {/* Experience & Availability */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span>{therapist.experience} years exp</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className={therapist.available ? "text-green-600" : "text-orange-600"}>
                  {therapist.available ? `Available at ${therapist.nextAvailable}` : `Available ${therapist.nextAvailable}`}
                </span>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Languages:</span>
            {therapist.languages.map(lang => (
              <span key={lang} className="bg-gray-100 px-2 py-1 rounded">
                {lang}
              </span>
            ))}
          </div>

          {/* Action Button */}
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setSelectedTherapist(therapist)}
          >
            Book Session
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Find Therapists" />

      {/* Search Bar */}
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search therapists, specializations, or areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(true)}
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {locations.map(location => (
            <Button
              key={location}
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery(location)}
              className="whitespace-nowrap"
            >
              {location}
            </Button>
          ))}
        </div>

        {/* Active Filters */}
        {(filters.specialization.length > 0 || filters.rating > 0 || filters.experience > 0) && (
          <div className="flex flex-wrap gap-2">
            {filters.specialization.map(spec => (
              <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                {spec}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleSpecializationToggle(spec)}
                />
              </Badge>
            ))}
            {filters.rating > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                ⭐ {filters.rating}+
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, rating: 0 }))}
                />
              </Badge>
            )}
            {filters.experience > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.experience}+ years
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setFilters(prev => ({ ...prev, experience: 0 }))}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {filteredTherapists.length} therapists found
          </p>
          {filteredTherapists.length === 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Therapists List */}
        <div className="space-y-4">
          {filteredTherapists.map(therapist => (
            <TherapistCard key={therapist.id} therapist={therapist} />
          ))}
        </div>

        {/* No Results */}
        {filteredTherapists.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">No therapists found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
            <Button onClick={clearAllFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && <FilterModal />}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}