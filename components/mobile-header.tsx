"use client"

import type React from "react"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
}

export function MobileHeader({ title, showBack, onBack, rightAction }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#A2E5D8]] bg-[#1a2a3a] text-white shadow-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack} 
              className="h-9 w-9 text-white hover:bg-[#EDB64D] hover:text-[#1a2a3a]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        </div>
        {rightAction && <div className="text-white">{rightAction}</div>}
      </div>
    </header>
  )
}