// components/bottom-nav.tsx
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Calendar, User, Heart } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, href: "/", label: "Home" },
    { icon: Search, href: "/browse", label: "Search" },
    { icon: Calendar, href: "/bookings", label: "Bookings" },
    { icon: User, href: "/profile", label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-around items-center p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}