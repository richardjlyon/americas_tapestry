import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import { pageMetadata } from '@/lib/seo';

export const metadata = {
  ...pageMetadata({
    title: 'Festival',
    description:
      "America's Tapestry at the Festival of Folk Arts, Buda Castle, Budapest, August 2026 — and an invitation to Hungarian stitchers to help make the project's fourteenth panel.",
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
 * Placeholder content: it introduces the project and the fourteenth-panel
 * collaboration so the QR code has somewhere worthwhile to land. Stitching
 * instructions, diagrams and sign-up details land here as they are written.
 */
export default function FestivalInfoPage() {
  return (
    <div className="bg-colonial-oxblood">
      <header className="container mx-auto max-w-3xl pt-12 pb-8 text-center md:pt-16">
        <span className="eyebrow eyebrow-gold">
          Festival of Folk Arts · Buda Castle · August 2026
        </span>
        <h1 className="gallery-heading mt-2 text-4xl md:text-5xl">
          Welcome to the America&apos;s Tapestry Project at the Hungarian Arts
          Festival
        </h1>
        <p className="gallery-lead mx-auto mt-3">
          Üdvözöljük! We have travelled from the United States to Budapest to
          share our work — and to invite you to stitch alongside us.
        </p>
        <div className="gold-threshold mx-auto mt-5" />
      </header>

      <PageSection paddingTop="none" background="colonial-oxblood">
        <ReadingContainer width="article" background="paper">
          <h2>Why we are here</h2>

          <p>
            America&apos;s Tapestry has been invited to Hungary as part of a
            cultural envoy programme, representing the fiber arts of the United
            States at the 35th Festival of Folk Arts — Mesterségek Ünnepe — held
            in the courtyards of Buda Castle around the 20th of August, with the
            United States as this year&apos;s Guest of Honour.
          </p>

          <p>
            The festival brings together master craftspeople from Hungary and
            around the world for four days of workshops, demonstrations, music
            and dance, celebrating skills passed down through generations. It is
            exactly the kind of company we hoped to keep.
          </p>

          <h2>What America&apos;s Tapestry is</h2>

          <p>
            America&apos;s Tapestry is thirteen hand-embroidered panels, one for
            each of the original American colonies, made for the 250th
            anniversary of the Declaration of Independence. Nearly 2,000
            volunteers aged from 5 to 96 stitched them, guided by local
            directors in each state and by the historical societies who helped
            shape the imagery. The panels are now touring historic venues across
            the United States.
          </p>

          <h2>The fourteenth panel — &ldquo;Join, or Die&rdquo;</h2>

          <p>
            For this exchange we are making a fourteenth panel, and we would
            like Hungarian hands on it. Its design takes its cue from Benjamin
            Franklin&apos;s famous 1754 woodcut of a rattlesnake cut into
            segments beneath the words <em>Join, or Die</em> — an early and
            enduring emblem of separate communities choosing to act as one.
          </p>

          <p>
            The idea is simple. Hungarian stitchers work the segments of the
            snake alongside us, in whatever hands come forward — experienced
            embroiderers, curious beginners, families, children. What is stitched
            here in Budapest becomes a permanent part of the work when it returns
            home.
          </p>

          <h2>How to take part</h2>

          <p>
            Come and find us at the festival. No experience is needed, and
            materials, threads and guidance are provided at our table. Full
            instructions — the stitches used, the section diagrams, and how to
            register your contribution — will be published on this page shortly,
            in English and in Hungarian.
          </p>

          <p>
            <strong>Hamarosan további részletek.</strong> More details are
            coming soon. Bookmark this page, or scan the code again later, to
            follow the panel as it takes shape.
          </p>
        </ReadingContainer>
      </PageSection>
    </div>
  );
}
