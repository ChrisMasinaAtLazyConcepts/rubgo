export interface StorageUnit {
  id: string
  name: string
  type: "container" | "vehicle" | "boat" | "lockbox"
  size: string
  price: number
  priceUnit: "month" | "week" | "day"
  available: boolean
  features: string[]
  image: string
  description: string
}

export const storageUnits: StorageUnit[] = [
  {
    id: "1",
    name: "Small Container Unit",
    type: "container",
    size: "2m x 2m",
    price: 850,
    priceUnit: "month",
    available: true,
    features: ["24/7 Access", "Climate Controlled", "Security Cameras"],
    image: "/small-storage-container-unit.jpg",
    description: "Perfect for personal items and small furniture",
  },
  {
    id: "2",
    name: "Medium Container Unit",
    type: "container",
    size: "3m x 3m",
    price: 1250,
    priceUnit: "month",
    available: true,
    features: ["24/7 Access", "Climate Controlled", "Security Cameras", "Drive-up Access"],
    image: "/medium-storage-container-unit.jpg",
    description: "Ideal for household items and business inventory",
  },
  {
    id: "3",
    name: "Large Container Unit",
    type: "container",
    size: "6m x 3m",
    price: 2100,
    priceUnit: "month",
    available: true,
    features: ["24/7 Access", "Climate Controlled", "Security Cameras", "Drive-up Access", "Loading Bay"],
    image: "/large-storage-container-unit.jpg",
    description: "Great for moving, renovations, or business storage",
  },
  {
    id: "4",
    name: "Vehicle Storage Bay",
    type: "vehicle",
    size: "5m x 3m",
    price: 1800,
    priceUnit: "month",
    available: true,
    features: ["Covered Parking", "Security Cameras", "Easy Access", "Wash Bay"],
    image: "/covered-vehicle-storage-bay.jpg",
    description: "Secure covered storage for cars, motorcycles, and more",
  },
  {
    id: "5",
    name: "Boat Storage",
    type: "boat",
    size: "8m x 4m",
    price: 2500,
    priceUnit: "month",
    available: true,
    features: ["Covered Storage", "Security Cameras", "Trailer Parking", "Wash Bay"],
    image: "/boat-storage-facility.jpg",
    description: "Protected storage for boats and watercraft",
  },
  {
    id: "6",
    name: "Premium Lockbox",
    type: "lockbox",
    size: "0.5m x 0.5m",
    price: 350,
    priceUnit: "month",
    available: true,
    features: ["Climate Controlled", "24/7 Access", "High Security", "Insurance Available"],
    image: "/secure-lockbox-storage.jpg",
    description: "Secure storage for valuables and important documents",
  },
  {
    id: "7",
    name: "Vehicle Storage Open",
    type: "vehicle",
    size: "5m x 3m",
    price: 1200,
    priceUnit: "month",
    available: false,
    features: ["Open Parking", "Security Cameras", "Fenced Perimeter"],
    image: "/open-vehicle-parking-storage.jpg",
    description: "Affordable open-air vehicle storage",
  },
  {
    id: "8",
    name: "Extra Large Container",
    type: "container",
    size: "12m x 3m",
    price: 3500,
    priceUnit: "month",
    available: true,
    features: [
      "24/7 Access",
      "Climate Controlled",
      "Security Cameras",
      "Drive-up Access",
      "Loading Bay",
      "Forklift Access",
    ],
    image: "/extra-large-storage-container.jpg",
    description: "Maximum space for commercial or large-scale storage needs",
  },
]

export const storageTypes = [
  { value: "all", label: "All Types" },
  { value: "container", label: "Containers" },
  { value: "vehicle", label: "Vehicles" },
  { value: "boat", label: "Boats" },
  { value: "lockbox", label: "Lockboxes" },
]
