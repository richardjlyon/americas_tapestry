"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, SyringeIcon as Needle, BookOpen, Globe, MessageSquare } from "lucide-react"

interface VolunteerOpportunity {
  id: string
  title: string
  description: string
  requirements: string[]
  timeCommitment: string
  location: string
  icon: React.ReactNode
}

const volunteerOpportunities: VolunteerOpportunity[] = [
  {
    id: "stitcher",
    title: "Tapestry Stitcher",
    description:
      "Join our team of skilled needleworkers creating the physical tapestry panels. Work alongside master embroiderers and contribute to the actual creation of America's Tapestry.",
    requirements: [
      "Experience with embroidery, needlepoint, or other textile arts",
      "Ability to follow detailed patterns and instructions",
      "Commitment to historical accuracy and quality craftsmanship",
    ],
    timeCommitment: "4-8 hours per week, minimum 3-month commitment",
    location: "In-person at various museum locations across the country",
    icon: <Needle className="h-8 w-8" />,
  },
  {
    id: "educator",
    title: "Educational Volunteer",
    description:
      "Help develop and deliver educational programs related to America's Tapestry. Lead workshops, give presentations, and engage with students and community groups.",
    requirements: [
      "Background in education, history, or textile arts",
      "Strong communication and presentation skills",
      "Experience working with diverse audiences",
    ],
    timeCommitment: "2-6 hours per week, flexible scheduling",
    location: "In-person and virtual opportunities available",
    icon: <BookOpen className="h-8 w-8" />,
  },
  {
    id: "researcher",
    title: "Historical Researcher",
    description:
      "Assist our team in researching historical events, figures, and cultural contexts depicted in our tapestries. Help ensure historical accuracy and identify compelling stories to include.",
    requirements: [
      "Background in American history, cultural studies, or related field",
      "Strong research and writing skills",
      "Attention to detail and commitment to accuracy",
    ],
    timeCommitment: "3-10 hours per week, project-based assignments",
    location: "Remote/virtual",
    icon: <Globe className="h-8 w-8" />,
  },
  {
    id: "community",
    title: "Community Outreach Volunteer",
    description:
      "Help us connect with diverse communities across America. Organize local events, coordinate with community organizations, and gather stories that represent America's cultural tapestry.",
    requirements: [
      "Strong interpersonal and communication skills",
      "Experience with community organizing or public relations",
      "Cultural sensitivity and commitment to diversity",
    ],
    timeCommitment: "4-6 hours per week, flexible scheduling",
    location: "Remote and in-person opportunities in select cities",
    icon: <MessageSquare className="h-8 w-8" />,
  },
]

export function SupportVolunteer() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-colonial-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-colonial-navy" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-colonial-navy">Volunteer Opportunities</h2>
        <p className="font-serif text-colonial-navy/80 leading-relaxed">
          Contribute your time, skills, and passion to America's Tapestry. Our volunteers are essential to our mission,
          helping us create, preserve, and share our nation's cultural heritage. Whether you're a skilled needleworker,
          a history enthusiast, or someone who wants to make a difference, we have opportunities for you.
        </p>
      </div>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-8">
          <TabsTrigger value="opportunities">Volunteer Roles</TabsTrigger>
          <TabsTrigger value="process">How to Apply</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {volunteerOpportunities.map((opportunity) => (
              <Card
                key={opportunity.id}
                className="bg-white shadow-md border border-colonial-navy/10 h-full flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-colonial-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
                      {opportunity.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-colonial-navy">{opportunity.title}</CardTitle>
                      <p className="text-sm text-colonial-navy/70 mt-1">
                        <span className="font-medium">Location:</span> {opportunity.location}
                      </p>
                      <p className="text-sm text-colonial-navy/70">
                        <span className="font-medium">Time:</span> {opportunity.timeCommitment}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="font-serif text-colonial-navy/80 mb-4">{opportunity.description}</p>
                  <h4 className="font-medium text-colonial-navy mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {opportunity.requirements.map((requirement, index) => (
                      <li key={index} className="text-sm text-colonial-navy/70 flex items-start">
                        <span className="text-colonial-burgundy mr-2">•</span>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-full bg-colonial-navy text-colonial-parchment hover:bg-colonial-navy/90">
                    Apply for This Role
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="process" className="space-y-8">
          <div className="bg-white shadow-md border border-colonial-navy/10 rounded-lg p-6 md:p-8">
            <h3 className="text-2xl font-bold text-colonial-navy mb-6">Volunteer Application Process</h3>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-colonial-navy text-colonial-parchment font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-bold text-colonial-navy mb-2">Submit an Application</h4>
                  <p className="font-serif text-colonial-navy/80">
                    Complete our online volunteer application form. You'll be asked about your skills, experience,
                    interests, and availability. Be sure to indicate which volunteer role(s) interest you most.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-colonial-navy text-colonial-parchment font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-bold text-colonial-navy mb-2">Interview</h4>
                  <p className="font-serif text-colonial-navy/80">
                    After reviewing your application, our volunteer coordinator will contact you to schedule a brief
                    interview. This helps us understand your motivations and how your skills align with our needs.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-colonial-navy text-colonial-parchment font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-bold text-colonial-navy mb-2">Orientation & Training</h4>
                  <p className="font-serif text-colonial-navy/80">
                    Accepted volunteers participate in an orientation session to learn about America's Tapestry and our
                    mission. Depending on your role, you may receive additional specialized training.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-colonial-navy text-colonial-parchment font-bold text-xl flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="text-xl font-bold text-colonial-navy mb-2">Begin Volunteering</h4>
                  <p className="font-serif text-colonial-navy/80">
                    Start contributing to America's Tapestry! You'll receive ongoing support from our staff and fellow
                    volunteers. We regularly check in to ensure your volunteer experience is rewarding.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-colonial-navy/10">
              <h4 className="font-bold text-colonial-navy mb-3">Volunteer Benefits</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-colonial-burgundy mr-2">•</span>
                  <span className="font-serif text-colonial-navy/80">
                    Contribute to a significant cultural and historical project
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-colonial-burgundy mr-2">•</span>
                  <span className="font-serif text-colonial-navy/80">Develop new skills and expand your knowledge</span>
                </li>
                <li className="flex items-start">
                  <span className="text-colonial-burgundy mr-2">•</span>
                  <span className="font-serif text-colonial-navy/80">
                    Connect with a community of like-minded individuals
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-colonial-burgundy mr-2">•</span>
                  <span className="font-serif text-colonial-navy/80">
                    Receive invitations to special events and previews
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-colonial-burgundy mr-2">•</span>
                  <span className="font-serif text-colonial-navy/80">Discount on America's Tapestry merchandise</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Button
              className="rounded-full bg-colonial-navy text-colonial-parchment hover:bg-colonial-navy/90"
              size="lg"
            >
              Apply to Volunteer Today
            </Button>
            <p className="font-serif text-sm text-colonial-navy/60 mt-4">
              Questions about volunteering? Contact our Volunteer Coordinator at volunteer@americastapestry.org
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-colonial-navy/5 p-6 rounded-lg border border-colonial-navy/10 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold text-colonial-navy mb-3">Group Volunteer Opportunities</h3>
        <p className="font-serif text-colonial-navy/80 mb-4">
          We welcome corporate teams, community organizations, school groups, and other organizations interested in
          group volunteer opportunities. These can be one-time events or ongoing partnerships.
        </p>
        <p className="font-serif text-colonial-navy/80 mb-4">Group volunteer activities might include:</p>
        <ul className="space-y-2 mb-6">
          <li className="flex items-start">
            <span className="text-colonial-burgundy mr-2">•</span>
            <span className="font-serif text-colonial-navy/80">Assisting with public events and exhibitions</span>
          </li>
          <li className="flex items-start">
            <span className="text-colonial-burgundy mr-2">•</span>
            <span className="font-serif text-colonial-navy/80">Participating in community tapestry projects</span>
          </li>
          <li className="flex items-start">
            <span className="text-colonial-burgundy mr-2">•</span>
            <span className="font-serif text-colonial-navy/80">Supporting administrative and logistical needs</span>
          </li>
        </ul>
        <Button
          className="rounded-full border-colonial-navy text-colonial-navy hover:bg-colonial-navy hover:text-colonial-parchment"
          variant="outline"
        >
          Learn About Group Volunteering
        </Button>
      </div>
    </div>
  )
}

