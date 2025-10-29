export interface BookingDetails {
  unitId: string
  startDate: Date
  endDate: Date
  paymentMethod: "eft" | "card" | "cash"
}

export function calculateRentalDuration(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function calculateTotalPrice(pricePerMonth: number, startDate: Date, endDate: Date): number {
  const days = calculateRentalDuration(startDate, endDate)
  const months = Math.ceil(days / 30)
  return pricePerMonth * months
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}
