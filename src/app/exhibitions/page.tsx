import { getAllExhibitions } from '@/lib/exhibitions';
import { ExhibitionCard } from '@/components/features/exhibitions/exhibition-card';
import { PageSection } from '@/components/ui/page-section';

export default async function ExhibitionsPage() {
  const exhibitions = await getAllExhibitions();

  return (
    <>
      <h1 className="page-heading">Exhibitions</h1>

      <div className="lead-text text-center">
        Experience America's Tapestry at these exhibition venues across the
        original 13 states.
      </div>

      <PageSection paddingTop="small">
        <div className="space-y-6 w-full lg:w-2/3 mx-auto">
          {exhibitions.map((exhibition) => (
            <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
          ))}
        </div>
      </PageSection>
    </>
  );
}
