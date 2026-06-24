import { getAllExhibitions } from '@/lib/exhibitions';
import { ExhibitionCard } from '@/components/features/exhibitions/exhibition-card';
import { PageSection } from '@/components/ui/page-section';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Exhibitions',
  description:
    "Where to see America's Tapestry on display — current and upcoming exhibitions across the original colonies.",
  path: '/exhibitions',
});

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

        <p className="text-center text-xl mt-12 w-full lg:w-2/3 mx-auto">
          Additional confirmed venues include{' '}
          <a
            href="https://www.mdhistory.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:opacity-80"
          >
            The Maryland Center For History And Culture
          </a>{' '}
          and{' '}
          <a
            href="https://www.atlantahistorycenter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:opacity-80"
          >
            The Atlanta History Center
          </a>
          . Please revisit this page for further updates.
        </p>
      </PageSection>
    </>
  );
}
