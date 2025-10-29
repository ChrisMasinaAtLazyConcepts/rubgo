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
    name: "Sarah Johnson",
    address: "Sandton, Johannesburg",
    rating: 4.9,
    reviews: 127,
    specialty: "Deep Tissue & Sports Therapy",
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
    image: "/therapists/sarah-johnson.jpg",
    verification: "verified",
    languages: ["English", "Zulu"],
    description: "Certified therapeutic massage specialist with 8 years of experience helping clients recover from injuries and manage chronic pain.",
    responseTime: 15,
    price: 550,
    distance: 15,
    availability: "Available Today"
  },
  {
    id: "2",
    address: "Rivonia, Johannesburg",
    name: "James Mbeki",
    rating: 4.7,
    reviews: 89,
    specialty: "Swedish & Relaxation Therapy",
    experience: 5,
    gender: "male",
    location: {
      lat: -26.1076,
      lng: 28.0567,
    },
    services: [
      massageServices[0], // Swedish
      massageServices[4], // Couples
      massageServices[5], // Aromatherapy
      massageServices[6]  // Reflexology
    ],
    image: "/therapists/james-mbeki.jpg",
    verification: "verified",
    languages: ["English", "Xhosa", "Zulu"],
    description: "Focused on creating peaceful, relaxing experiences to help clients unwind from daily stress.",
    responseTime: 10,
    price: 650,
    distance: 37,
    availability: "Available Today"
  },
  {
    id: "3",
    address: "Rosebank, Johannesburg",
    name: "Priya Singh",
    rating: 4.8,
    reviews: 203,
    specialty: "Prenatal & Wellness Massage",
    experience: 10,
    gender: "female",
    location: {
      lat: -26.1352,
      lng: 28.0330
    },
    services: [
      massageServices[0], // Swedish
      massageServices[3], // Prenatal
      massageServices[5], // Aromatherapy
      massageServices[6]  // Reflexology
    ],
    image: "/therapists/priya-singh.jpg",
    verification: "verified",
    languages: ["English", "Hindi"],
    description: "Specialized in prenatal and women's wellness with a gentle, nurturing approach.",
    responseTime: 25,
    price: 980,
    distance: 0.5,
    availability: "Available Today"
  },
  {
    id: "4",
    name: "David van Niekerk",
    address: "Parktown, Johannesburg",
    rating: 4.6,
    reviews: 67,
    specialty: "Sports & Deep Tissue",
    experience: 6,
    gender: "male",
    location: {
      lat: -26.1634,
      lng: 28.0262,
    },
    services: [
      massageServices[1], // Deep Tissue
      massageServices[2], // Sports
      massageServices[6]  // Reflexology
    ],
    image: "/therapists/david-vanniekerk.jpg",
    verification: "pending",
    languages: ["English", "Afrikaans"],
    description: "Former athlete turned massage therapist, specializing in sports recovery and performance enhancement.",
    responseTime: 20,
    price: 850,
    distance: 1.2,
    availability: "Available Tomorrow"
  },
  {
    id: "5",
    name: "Lerato Ndlovu",
    address: "Soweto, Johannesburg",
    rating: 4.9,
    reviews: 156,
    specialty: "Traditional & Modern Techniques",
    experience: 7,
    gender: "female",
    location: {
      lat: -26.1864,
      lng: 28.0126,
    },
    services: [
      massageServices[0], // Swedish
      massageServices[1], // Deep Tissue
      massageServices[5], // Aromatherapy
      massageServices[6]  // Reflexology
    ],
    image: "/therapists/lerato-ndlovu.jpg",
    verification: "verified",
    languages: ["English", "Zulu", "Sotho"],
    description: "Blending traditional African massage techniques with modern therapeutic approaches.",
    responseTime: 5,
    price: 650,
    distance: 3,
    availability: "Available Tomorrow"
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