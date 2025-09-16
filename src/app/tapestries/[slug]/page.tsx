import { getTapestryBySlug, getAllTapestries } from '@/lib/tapestries';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';
import { AccessibleAudioPlayer } from '@/components/shared/accessible-audio-player';
import { FullImageViewer } from '@/components/shared/full-image-viewer';
import { TeamCard } from '@/components/features/tapestries/team-card';
import { MemberCard } from '@/components/features/team/member-card';
import { getTeamMembersByState } from '@/lib/team';
import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import { getImagePath } from '@/lib/image-utils';

// Status color mapping
const statusColors = {
  'Not Started': 'bg-colonial-navy/70',
  Designed: 'bg-colonial-navy',
  'In Production': 'bg-colonial-burgundy',
  Finished: 'bg-colonial-gold',
};

const statusTextColors = {
  'Not Started': 'text-colonial-parchment',
  Designed: 'text-colonial-parchment',
  'In Production': 'text-colonial-parchment',
  Finished: 'text-colonial-navy',
};

export async function generateStaticParams() {
  const tapestries = await getAllTapestries();

  return tapestries.map((tapestry) => ({
    slug: tapestry.slug,
  }));
}

export default async function TapestryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Wait for params to be fully available
  const { slug } = await params;
  const tapestry = await getTapestryBySlug(slug);

  if (!tapestry) {
    notFound();
  }

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(tapestry.content);
  const contentHtml = processedContent.toString();

  const statusColor = statusColors[tapestry.status] || 'bg-colonial-navy/70';
  const statusTextColor =
    statusTextColors[tapestry.status] || 'text-colonial-parchment';

  // Get the image source path and ensure it uses the new structure
  const imageSrc = tapestry.imagePath
    ? getImagePath(tapestry.imagePath)
    : tapestry.thumbnail
      ? getImagePath(tapestry.thumbnail)
      : '/images/placeholders/placeholder.svg?height=600&width=800';

  // Handle audio path
  const audioSrc = tapestry.audioPath
    ? getImagePath(tapestry.audioPath)
    : undefined;

  // Get all team members for this state using the utility function
  const {
    stateDirectors,
    historicalPartners,
    illustrators,
    stitchingGroups,
    commissionPartners,
    stitchingVenues,
  } = await getTeamMembersByState(tapestry.title);

  const hasTeamMembers =
    stateDirectors?.length > 0 ||
    historicalPartners?.length > 0 ||
    illustrators?.length > 0 ||
    stitchingGroups?.length > 0;

  const hasCommissionPartner = commissionPartners?.length > 0;
  const hasStitchingVenues = stitchingVenues?.length > 0;

  return (
    <>
      <h1 className="page-heading">{tapestry.title}</h1>

      <div className="lead-text">{tapestry.summary}</div>

      <PageSection spacing="normal">
        {/* Tapestry image */}
        <div className="mb-8 md:mb-12">
          <FullImageViewer
            imageSrc={imageSrc}
            altText={tapestry.title}
            status={tapestry.status}
            statusColor={statusColor}
            statusTextColor={statusTextColor}
          />
        </div>

        {/* Content container */}
        <ReadingContainer width="content" background="paper">
          {audioSrc && (
            <div className="mb-8">
              <AccessibleAudioPlayer
                src={audioSrc}
                title={`Audio Description: ${tapestry.title} Tapestry`}
                {...(tapestry.audioDescription && {
                  description: tapestry.audioDescription,
                })}
              />
            </div>
          )}

          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />

          {/* Resources section */}
          {tapestry.resources && tapestry.resources.length > 0 && (
            <div className="mt-8 pt-8 border-t border-colonial-navy/20">
              <h2 className="font-serif text-2xl font-normal mb-6 text-colonial-navy">
                Resources
              </h2>
              <ul className="space-y-4">
                {tapestry.resources.map((resource, index) => {
                  // Construct the full resource URL using the convention
                  const resourceUrl = `/docs/tapestry-resources/${tapestry.slug}/${resource.url}`;

                  return (
                    <li key={index} className="flex items-baseline space-x-3">
                      <span className="inline-block w-2 h-2 rounded-full bg-colonial-burgundy flex-shrink-0" />
                      <div className="flex-1">
                        <a
                          href={resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-colonial-navy hover:text-colonial-burgundy font-medium underline"
                        >
                          {resource.title}
                        </a>
                        <span className="text-sm text-colonial-navy/70 ml-2">
                          ({resource.kind})
                        </span>
                        {resource.description && (
                          <p className="text-colonial-navy/80 text-base mt-1">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </ReadingContainer>

        {/* Pin separator */}
        <div className="flex justify-center pt-8 pb-2">
          <div className="page-section-pin-bottom" />
        </div>

        {/* Team section */}
        {hasTeamMembers && (
          <div className="pt-6">
            <TeamCard
              stateName={tapestry.title}
              stateDirectors={stateDirectors}
              historicalPartners={historicalPartners}
              illustrators={illustrators}
              stitchingGroups={stitchingGroups}
            />
          </div>
        )}

        {/* 250 Commission Partner section */}
        {hasCommissionPartner && (
          <>
            {/* Pin separator */}
            <div className="flex justify-center pt-8 pb-2">
              <div className="page-section-pin-bottom" />
            </div>

            <div className="pt-6">
              <h2 className="font-serif text-center text-2xl font-normal pb-4 md:pb-8">
                250 Commission Partner
              </h2>
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  {commissionPartners.map((partner) => (
                    <div key={`${partner.groupSlug}-${partner.slug}`}>
                      <MemberCard member={partner} variant="grid" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Stitching Venues section */}
        {hasStitchingVenues && (
          <>
            {/* Pin separator */}
            <div className="flex justify-center pt-8 pb-2">
              <div className="page-section-pin-bottom" />
            </div>

            <div className="pt-6">
              <h2 className="font-serif text-center text-2xl font-normal pb-4 md:pb-8">
                Stitching Venues
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {stitchingVenues.map((venue) => (
                  <MemberCard
                    key={`${venue.groupSlug}-${venue.slug}`}
                    member={venue}
                    variant="grid"
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </PageSection>
    </>
  );
}
