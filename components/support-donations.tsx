"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart, Check } from "lucide-react"

interface DonationTier {
  id: string
  name: string
  amount: number
  description: string
  benefits: string[]
}

const donationTiers: DonationTier[] = [
  {
    id: "supporter",
    name: "Supporter",
    amount: 50,
    description: "Help us continue our educational programs and tapestry creation.",
    benefits: [
      "Recognition on our website",
      "Quarterly email newsletter",
      "Digital wallpaper of your favorite tapestry panel",
    ],
  },
  {
    id: "patron",
    name: "Patron",
    amount: 100,
    description: "Provide significant support for our ongoing tapestry projects.",
    benefits: [
      "All Supporter benefits",
      "America's Tapestry commemorative pin",
      "10% discount on merchandise purchases",
    ],
  },
  {
    id: "benefactor",
    name: "Benefactor",
    amount: 250,
    description: "Make a substantial impact on our ability to preserve cultural heritage.",
    benefits: [
      "All Patron benefits",
      "Exclusive behind-the-scenes digital content",
      "Invitation to annual virtual event with project directors",
      "15% discount on merchandise purchases",
    ],
  },
  {
    id: "guardian",
    name: "Guardian",
    amount: 500,
    description: "Become a guardian of America's cultural tapestry for future generations.",
    benefits: [
      "All Benefactor benefits",
      "Limited edition print of your choice",
      "Personal acknowledgment in our annual report",
      "20% discount on merchandise purchases",
    ],
  },
]

export function SupportDonations() {
  const [selectedTier, setSelectedTier] = useState<string>("supporter")
  const [customAmount, setCustomAmount] = useState<string>("")

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-colonial-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-colonial-burgundy" />
        </div>
        <div className="content-typography">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-colonial-navy">Make a Donation</h2>
          <p>
            Your financial contribution directly supports the creation, preservation, and exhibition of America's
            Tapestry. Donations help fund materials, artist stipends, educational programs, and community outreach
            initiatives. As a 501(c)(3) nonprofit organization, all donations are tax-deductible.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-colonial-navy mb-4">Donation Tiers</h3>
          <RadioGroup value={selectedTier} onValueChange={setSelectedTier} className="space-y-4">
            {donationTiers.map((tier) => (
              <div key={tier.id} className="flex">
                <RadioGroupItem value={tier.id} id={tier.id} className="peer sr-only" />
                <Label
                  htmlFor={tier.id}
                  className="flex flex-col w-full p-4 bg-white border border-colonial-navy/10 rounded-lg cursor-pointer peer-checked:border-colonial-burgundy peer-checked:bg-colonial-burgundy/5 hover:bg-colonial-burgundy/5 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-colonial-navy">{tier.name}</span>
                    <span className="text-lg font-medium text-colonial-burgundy">${tier.amount}</span>
                  </div>
                  <p className="font-serif text-colonial-navy/80 mb-3">{tier.description}</p>
                  <div className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-colonial-burgundy mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-colonial-navy/70">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </Label>
              </div>
            ))}

            <div className="flex">
              <RadioGroupItem value="custom" id="custom" className="peer sr-only" />
              <Label
                htmlFor="custom"
                className="flex flex-col w-full p-4 bg-white border border-colonial-navy/10 rounded-lg cursor-pointer peer-checked:border-colonial-burgundy peer-checked:bg-colonial-burgundy/5 hover:bg-colonial-burgundy/5 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-colonial-navy">Custom Amount</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-medium text-colonial-burgundy mr-2">$</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="border-colonial-navy/20 focus-visible:ring-colonial-burgundy"
                    onClick={() => setSelectedTier("custom")}
                  />
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Card className="bg-white shadow-md border border-colonial-navy/10">
            <CardHeader>
              <CardTitle className="text-xl text-colonial-navy">Donation Summary</CardTitle>
              <CardDescription>Review your donation details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium text-colonial-navy">Donation Level:</span>
                <span className="text-colonial-navy/80">
                  {selectedTier === "custom"
                    ? "Custom Amount"
                    : donationTiers.find((tier) => tier.id === selectedTier)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-colonial-navy">Amount:</span>
                <span className="text-colonial-burgundy font-medium">
                  $
                  {selectedTier === "custom"
                    ? customAmount || "0"
                    : donationTiers.find((tier) => tier.id === selectedTier)?.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-colonial-navy">Tax Deductible:</span>
                <span className="text-colonial-navy/80">Yes</span>
              </div>
              <div className="pt-4 border-t border-colonial-navy/10">
                <p className="text-sm text-colonial-navy/70">
                  You will receive a tax receipt via email after your donation is processed.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full rounded-full bg-colonial-burgundy text-colonial-parchment hover:bg-colonial-burgundy/90">
                Proceed to Donation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="bg-colonial-navy/5 p-6 rounded-lg border border-colonial-navy/10 max-w-3xl mx-auto content-typography">
        <h3 className="text-xl font-bold text-colonial-navy mb-3">Other Ways to Give</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-colonial-navy">Monthly Giving</h4>
            <p>
              Become a sustaining supporter by setting up a recurring monthly donation. This provides us with reliable
              funding to plan long-term projects.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-colonial-navy">Matching Gifts</h4>
            <p>
              Many employers match charitable contributions made by their employees. Check with your HR department to
              see if your donation can be doubled.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-colonial-navy">Legacy Giving</h4>
            <p>
              Consider including America's Tapestry in your estate planning to create a lasting legacy. Contact us for
              more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

