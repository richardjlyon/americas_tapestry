import Link from 'next/link';
import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import { pageMetadata } from '@/lib/seo';

export const metadata = {
  ...pageMetadata({
    title: 'Festival',
    description:
      "America's Tapestry at the Festival of Folk Arts, Buda Castle, Budapest, August 2026.",
    path: '/festival-info',
  }),
  // Unlisted: reachable only via the printed QR code, absent from the nav and
  // the sitemap, and kept out of search results.
  robots: { index: false, follow: false },
};

/**
 * Festival landing page — the destination for the printed QR code handed out
 * at the Festival of Folk Arts (Mesterségek Ünnepe) in Budapest, August 2026.
 *
 * Reduced at Stefan's request (email, 1 September 2026) now the festival has
 * been and gone: the full bilingual briefing is replaced by a signpost to the
 * news article. The Hungarian line is kept alongside the English because the
 * printed QR codes went to Hungarian visitors and may still be scanned.
 */
export default function FestivalInfoPage() {
  return (
    <div className="bg-colonial-oxblood">
      <header className="container mx-auto max-w-3xl pt-12 pb-8 text-center md:pt-16">
        <span className="eyebrow eyebrow-gold">
          Festival of Folk Arts · Buda Castle · August 2026
        </span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
          America&apos;s Tapestry at the Hungarian Festival of Folk Arts
        </h1>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      <PageSection paddingTop="none" background="colonial-oxblood">
        <ReadingContainer width="article" background="paper">
          <p>
            To learn more about America&apos;s Tapestry at the Hungarian
            Festival of Folk Arts, please visit{' '}
            <Link href="/news/americas-tapestry-travels-overseas">
              America&apos;s Tapestry Travels Overseas
            </Link>
            .
          </p>

          <p lang="hu">
            <em>
              Ha többet szeretne megtudni Amerika Kárpitjáról a Mesterségek
              Ünnepén, olvassa el{' '}
              <Link href="/news/americas-tapestry-travels-overseas">
                beszámolónkat
              </Link>
              .
            </em>
          </p>

          <p>
            <a
              href="https://mestersegekunnepe.hu/english/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hungarian Festival of Folk Arts (Mesterségek Ünnepe)
            </a>
          </p>
        </ReadingContainer>
      </PageSection>
    </div>
  );
}
