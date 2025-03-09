import { cn } from "@/lib/utils"
import type { TeamMember } from "@/lib/team"

interface TeamMemberCardProps {
  member: TeamMember
  className?: string
}

export function TeamMemberCard({ member, className }: TeamMemberCardProps) {
  // Default placeholder image if no image is found
  const imageSrc = member.imagePath || `/placeholder.svg?height=600&width=450&text=${encodeURIComponent(member.name)}`

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md overflow-hidden border border-colonial-navy/10 h-full flex flex-col",
        className,
      )}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-colonial-navy">{member.name}</h3>
        <p className="font-serif text-colonial-burgundy mb-3">{member.role}</p>

        {/* Additional metadata fields if they exist */}
        {member.state && <p className="font-serif text-sm text-colonial-navy/70 mb-2">State: {member.state}</p>}
        {member.location && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">Location: {member.location}</p>
        )}
        {member.specialization && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">Specialization: {member.specialization}</p>
        )}
        {member.members && <p className="font-serif text-sm text-colonial-navy/70 mb-2">Members: {member.members}</p>}
        {member.established && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">Established: {member.established}</p>
        )}
        {member.partnership_year && (
          <p className="font-serif text-sm text-colonial-navy/70 mb-2">Partnership since: {member.partnership_year}</p>
        )}

        <div className="mt-3 font-serif text-colonial-navy/80 line-clamp-6">
          {/* First paragraph of content as preview */}
          {member.content.split("\n\n")[0]}
        </div>

        <div className="mt-auto pt-4">
          <a
            href={`/team/${member.groupSlug}/${member.slug}`}
            className="inline-block text-colonial-burgundy hover:text-colonial-navy font-medium transition-colors"
          >
            Read full bio →
          </a>
        </div>
      </div>
    </div>
  )
}

