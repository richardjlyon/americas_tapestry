import { getTapestryBySlug, getAllTapestries } from '@/lib/tapestries';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';
import { AccessibleAudioPlayer } from '@/components/accessible-audio-player';
import { FullImageViewer } from '@/components/full-image-viewer';
import { TeamCard } from '@/components/tapestries/team-card';
import { getTeamMembersByState } from '@/lib/team';
import { PageSection } from '@/components/ui/page-section';

// Status color mapping
const statusColors = {
  'Not Started': 'bg-colonial-navy/70',
  Designed: 'bg-indigo-500',
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
  const tapestries = getAllTapestries();

  return tapestries.map((tapestry) => ({
    slug: tapestry.slug,
  }));
}

export default async function TapestryPage({
  params,
}: { params: { slug: string } }) {
  const tapestry = getTapestryBySlug(params.slug);

  if (!tapestry) {
    notFound();
  }

  // Convert markdown to HTML
  const processedContent = await remark().use(html).process(tapestry.content);
  const contentHtml = processedContent.toString();

  const statusColor = statusColors[tapestry.status] || 'bg-colonial-navy/70';
  const statusTextColor =
    statusTextColors[tapestry.status] || 'text-colonial-parchment';

  const imageSrc =
    tapestry.imagePath ||
    tapestry.thumbnail ||
    '/placeholder.svg?height=600&width=800';

  // Get all team members for this state using the utility function
  const { stateDirectors, historicalPartners, illustrators, stitchingGroups } =
    getTeamMembersByState(tapestry.title);

  const hasTeamMembers =
    stateDirectors?.length > 0 ||
    historicalPartners?.length > 0 ||
    illustrators?.length > 0 ||
    stitchingGroups?.length > 0;

  return (
    <>
      <h1 className="page-heading">{tapestry.title}</h1>

      <div className="lead-text">{tapestry.summary}</div>

      <PageSection paddingTop="none" paddingBottom="small" hasPin={true}>
        {/* Tapestry image with full image viewer capability */}
        <FullImageViewer
          imageSrc={imageSrc}
          altText={tapestry.title}
          status={tapestry.status}
          statusColor={statusColor}
          statusTextColor={statusTextColor}
        />

        <div className="p-6 md:p-8">
          {tapestry.audioPath && (
            <div className="mb-8">
              <AccessibleAudioPlayer
                src={tapestry.audioPath}
                title={`Audio Description: ${tapestry.title} Tapestry`}
                description={tapestry.audioDescription}
              />
            </div>
          )}

          <div
            className="content-typography"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </PageSection>

      {/* Team card section */}
      <PageSection paddingTop="none">
        {hasTeamMembers && (
          <TeamCard
            stateName={tapestry.title}
            stateDirectors={stateDirectors}
            historicalPartners={historicalPartners}
            illustrators={illustrators}
            stitchingGroups={stitchingGroups}
          />
        )}
      </PageSection>
    </>
  );
}
