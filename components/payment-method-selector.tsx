"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Building2, Banknote } from "lucide-react"

interface PaymentMethodSelectorProps {
  value: "eft" | "card" | "cash"
  onChange: (value: "eft" | "card" | "cash") => void
}

const paymentMethods = [
  {
    value: "eft" as const,
    label: "EFT / Bank Transfer",
    description: "Direct bank transfer",
    icon: Building2,
  },
  {
    value: "card" as const,
    label: "Credit / Debit Card",
    description: "Pay with your card",
    icon: CreditCard,
  },
  {
    value: "cash" as const,
    label: "Cash Payment",
    description: "Pay in person at our office",
    icon: Banknote,
  },
]

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Payment Method</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        {paymentMethods.map((method) => {
          const Icon = method.icon
          return (
            <Card
              key={method.value}
              className={`cursor-pointer transition-colors ${
                value === method.value ? "border-primary bg-primary/5" : "hover:border-primary/50"
              }`}
              onClick={() => onChange(method.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value={method.value} id={method.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <Label htmlFor={method.value} className="font-semibold cursor-pointer">
                        {method.label}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </RadioGroup>
    </div>
  )
}
