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
  const { stateDirectors, historicalPartners, illustrators, stitchingGroups, commissionPartners } =
    await getTeamMembersByState(tapestry.title);

  const hasTeamMembers =
    stateDirectors?.length > 0 ||
    historicalPartners?.length > 0 ||
    illustrators?.length > 0 ||
    stitchingGroups?.length > 0;

  const hasCommissionPartner = commissionPartners?.length > 0;

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
                      <MemberCard
                        member={partner}
                        variant="grid"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </PageSection>
    </>
  );
}