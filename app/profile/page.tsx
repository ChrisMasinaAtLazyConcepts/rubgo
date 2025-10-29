"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Phone, LogOut, Settings, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
    router.push("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Profile" />

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">Dam Safe Member</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4 bg-transparent">
            <Settings className="h-5 w-5" />
            <span>Account Settings</span>
          </Button>

          <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4 bg-transparent">
            <HelpCircle className="h-5 w-5" />
            <span>Help & Support</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4 text-destructive hover:text-destructive bg-transparent"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
