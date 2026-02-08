// lib/massage-data.ts
import { Therapist, MassageService } from './types'

// Add FilterOptions type definition at the top
 interface FilterOptions {
  serviceType: string
  maxPrice: number
  rating: number
  genderPreference: "any" | "male" | "female"
  availableNow: boolean
  category?: string
}

export const massageServices: any[] = [
  {
    id: "swedish",
    name: "Swedish Massage",
    type: "swedish",
    duration: 60,
    price: 350,
    description: "Relaxing full-body massage with long, flowing strokes",
    category: "relaxation"
  },
  {
    id: "deep-tissue",
    name: "Deep Tissue",
    type: "deep-tissue",
    duration: 60,
    price: 450,
    description: "Targeted pressure for chronic pain and muscle tension",
    category: "therapeutic"
  },
  {
    id: "sports-massage",
    name: "Sports Massage",
    type: "sports",
    duration: 60,
    price: 500,
    description: "Enhances athletic performance and aids recovery",
    category: "therapeutic"
  },
  {
    id: "prenatal",
    name: "Prenatal Massage",
    type: "prenatal",
    duration: 50,
    price: 400,
    description: "Specialized massage for expecting mothers",
    category: "specialized"
  },
  {
    id: "couples",
    name: "Couples Massage",
    type: "couples",
    duration: 90,
    price: 700,
    description: "Side-by-side massage experience for two people",
    category: "relaxation"
  },
  {
    id: "aromatherapy",
    name: "Aromatherapy",
    type: "aromatherapy",
    duration: 60,
    price: 420,
    description: "Combines massage with essential oils for enhanced relaxation",
    category: "relaxation",
  },
  {
    id: "reflexology",
    name: "Reflexology",
    type: "reflexology",
    duration: 45,
    price: 300,
    description: "Foot massage targeting pressure points for whole-body benefits",
    category: "therapeutic"
  }
]

export const therapists: Therapist[] = [
  {
    id: "1",
    name: "Alsonia Duroy",
    address: "Sandton, Johannesburg",
    rating: 0.0,
    reviews: 0,
    specialty: "Deep Tissue & Sports Therapy & Swedish",
    experience: 8,
    gender: "female",
    location: {
      lat: -26.1076,
      lng: 28.0567
    },
    services: [
      massageServices[0], // Swedish
      massageServices[1], // Deep Tissue
      massageServices[2], // Sports
      massageServices[5]  // Aromatherapy
    ],
    image: "",
    verification: "verified",
    languages: ["English", "Zulu"],
    description: "Certified therapeutic massage specialist.",
    responseTime: 0,
    price: 550,
    distance: 0,
    availability: "Available Today"
  }
]

// Helper functions
export const getTherapistById = (id: string): Therapist | undefined => {
  return therapists.find(therapist => therapist.id === id)
}

export const getServiceById = (id: string): MassageService | undefined => {
  return massageServices.find(service => service.id === id)
}

export const getTherapistsByServiceType = (serviceType: string): Therapist[] => {
  return therapists.filter(therapist => 
    therapist.services?.some(service => service.type === serviceType)
  )
}

export const getAvailableTherapists = (): Therapist[] => {
  return therapists.filter(therapist => therapist.availability)
}

// Export types for use in other components
export type { Therapist, MassageService }