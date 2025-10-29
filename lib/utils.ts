// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Price calculation utility
export const calculateServicePrice = (basePrice: number) => {
  const serviceFee = basePrice * 0.20 // 20% service fee
  const bookingFee = 15 // Fixed booking fee in Rands
  
  // Simulate surge pricing (1.0x to 2.5x)
  const surgeMultiplier = Math.random() * 1.5 + 1.0
  const surgedPrice = basePrice * surgeMultiplier
  
  const subtotal = surgedPrice + serviceFee + bookingFee
  const vat = subtotal * 0.15 // 15% VAT
  
  return {
    base: Math.round(basePrice),
    surged: Math.round(surgedPrice),
    serviceFee: Math.round(serviceFee),
    bookingFee: Math.round(bookingFee),
    vat: Math.round(vat),
    total: Math.round(subtotal + vat),
    surgeMultiplier: parseFloat(surgeMultiplier.toFixed(1))
  }
}

// Distance calculation utility
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): string => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return (R * c).toFixed(1) // Distance in km
}