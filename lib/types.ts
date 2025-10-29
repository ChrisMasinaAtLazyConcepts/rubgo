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