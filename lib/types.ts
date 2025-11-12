// lib/types.ts
export interface MassageService {
  id: string
  name: string
  type: "swedish" | "deep-tissue" | "sports" | "prenatal" | "couples" | "aromatherapy" | "reflexology"
  duration: number // in minutes
  price: number // in Rands (ZAR)
  description: string
  category: "relaxation" | "therapeutic" | "specialized"
}

export interface Booking {
  id: string
  scheduledTime: string
  therapist: {
    id: string
    name: string
    image: string
    location: any;
    rating: number
    rate: number
  }
  service: {
    name: string
    duration: number
    price: number
  }
  date: string
  startTime: string
  endTime: string
  status: 'upcoming' | 'in-progress' | 'completed' | 'therapist-en-route'
  address: string
  userLocation:any
}

export interface Therapist {
  id: string
  name: string
  description: string
  address: string
  location: { lat: number; lng: number }
  price: number
  specialty: string
  gender: string,
  rating?: number
  responseTime?: number
  experience?: number
  verification: string,
  distance?: number
  reviews?: number
  availability?: string
  email?: string
  phone?: string
  image?: string
  languages?: string[]
  services?: Array<{
    id: number
    type: string
    name: string
    description: string
    price: number
    category: number
    duration: number
  }>
}

export interface FilterOptions {
  type: string
  serviceType: string
  maxPrice: number
  rating: number
  genderPreference: "any" | "male" | "female"
  availableNow: boolean
  category?: string
}