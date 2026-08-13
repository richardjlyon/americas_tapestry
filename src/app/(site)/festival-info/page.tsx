import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import { ExhibitionGallery } from '@/components/features/exhibitions/exhibition-gallery';
import { getExhibitionBySlug } from '@/lib/exhibitions';
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
 * The introductory header is bilingual English/Hungarian; the body is in
 * Hungarian for the festival audience. Stitching instructions, diagrams and
 * sign-up details land here as they are written.
 */
export default async function FestivalInfoPage() {
  // Reuse the Muscarelle photographs (already published and in the R2
  // manifest) to show festival visitors the exhibition itself.
  const muscarelle = await getExhibitionBySlug('muscarelle');

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
          <h2>Miért vagyunk itt?</h2>

          <p>
            Az America&apos;s Tapestry kulturális követprogram keretében kapott
            meghívást Magyarországra, hogy az Egyesült Államok textilművészetét
            képviselje a 35. Mesterségek Ünnepén, amelyet augusztus 20-a táján
            rendeznek a Budai Vár udvaraiban — az idei fesztivál díszvendége az
            Egyesült Államok.
          </p>

          <p>
            A fesztivál négy napra összehozza Magyarország és a világ
            mesterembereit: műhelyfoglalkozások, bemutatók, zene és tánc
            ünneplik a nemzedékről nemzedékre továbbadott tudást. Éppen ilyen
            társaságot reméltünk.
          </p>

          <h2>Mi az America&apos;s Tapestry?</h2>

          <p>
            Az America&apos;s Tapestry tizenhárom kézzel hímzett pannó — egy-egy
            az eredeti tizenhárom amerikai gyarmat mindegyikéről —, amely a
            Függetlenségi Nyilatkozat 250. évfordulójára készült. Közel 2000
            önkéntes hímezte, 5 évestől 96 éves korig, az egyes államok helyi
            irányítóinak és a képi világ kialakításában segítő történelmi
            társaságoknak a vezetésével. A pannók jelenleg az Egyesült Államok
            történelmi helyszínein vándorkiállításon láthatók.
          </p>

          <h2>A tizennegyedik pannó — „Join, or Die&rdquo;</h2>

          <p>
            Erre a cserére egy tizennegyedik pannót készítünk, és szeretnénk, ha
            magyar kezek is dolgoznának rajta. A terv Benjamin Franklin híres,
            1754-es fametszetét idézi: a darabokra vágott csörgőkígyót a{' '}
            <em>Join, or Die</em> — „Egyesülj vagy halj meg&rdquo; — felirat
            alatt; korai és máig érvényes jelképét annak, amikor különálló
            közösségek úgy döntenek, hogy egyként cselekszenek.
          </p>

          <p>
            Az ötlet egyszerű. A kígyó szelvényeit magyar hímzők öltik velünk
            együtt — bárki, aki kedvet érez: gyakorlott hímzők, kíváncsi
            kezdők, családok, gyerekek. Ami itt, Budapesten készül, a mű
            hazatérte után annak maradandó része lesz.
          </p>

          <h2>Hogyan vehet részt?</h2>

          <p>
            Keressen minket a fesztiválon! Előzetes gyakorlat nem szükséges; az
            anyagokat, a fonalakat és az útmutatást asztalunknál biztosítjuk. A
            teljes útmutató — a használt öltések, a szelvényrajzok és a
            hozzájárulás regisztrálásának módja — hamarosan megjelenik ezen az
            oldalon, angolul és magyarul.
          </p>

          <p>
            <strong>Hamarosan további részletek.</strong> Mentse el ezt az
            oldalt, vagy olvassa be később újra a QR-kódot, és kövesse, ahogyan
            a pannó alakot ölt.
          </p>
        </ReadingContainer>
      </PageSection>

      {/* Photographs of the exhibition, in the same grid used on the
          Muscarelle venue page. */}
      {muscarelle && muscarelle.gallery.length > 0 && (
        <PageSection paddingTop="none" background="colonial-oxblood">
          <section className="mx-auto w-full max-w-5xl">
            <span className="eyebrow eyebrow-gold">
              Muscarelle Museum of Art · Virginia
            </span>
            <h2 className="gallery-heading mt-1 text-3xl md:text-4xl">
              A kiállítás képei
            </h2>
            <div className="gold-threshold mt-3" />
            <div className="mt-8">
              <ExhibitionGallery images={muscarelle.gallery} />
            </div>
          </section>
        </PageSection>
      )}
    </div>
  );
}
