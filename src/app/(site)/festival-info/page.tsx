import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import { ExhibitionGallery } from '@/components/features/exhibitions/exhibition-gallery';
import { getAllTapestries } from '@/lib/tapestries';
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
 * The introductory header is bilingual English/Hungarian; the body is Stefan's
 * Hungarian text ("Amerika Kárpitja", August 2026). His document places two
 * captioned images in the E Pluribus Unum section (Franklin's 1754 woodcut and
 * a digital render of the 2026 panel) — add them here when he supplies them.
 */
export default async function FestivalInfoPage() {
  // The thirteen panels, shown in the grid format used for the Muscarelle
  // exhibition photographs (images served from R2 via the manifest loader).
  const tapestries = await getAllTapestries();
  const panelImages = tapestries
    .filter((t) => t.imagePath)
    .map((t) => ({ src: t.imagePath as string, alt: t.title }));

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
          <h2>Amerika Kárpitja</h2>

          <p>
            <em>13 gyarmat. 13 történet. 1 nemzet.</em>
          </p>

          <p>
            Az Egyesült Államok függetlenségének 250. évfordulója alkalmából
            készült Amerika Kárpitja (America&apos;s Tapestry), amely a hímzés
            művészetén keresztül meséli el nemzetünk alapításának történeteit.
          </p>

          <p>
            A tizenhárom kézzel hímzett pannót fiatal művészek tervezték az
            egykori tizenhárom gyarmat történelmi szervezeteivel
            együttműködésben. A terveket az adott államok önkéntes hímzői
            készítették el tizenkét hónap alatt. Minden pannó az amerikai
            függetlenségi háború egy kevésbé ismert, gyakran háttérbe szoruló
            történetét mutatja be.
          </p>

          <p>
            Az elkészült kárpit jelenleg hároméves vándorkiállítás keretében
            járja az Egyesült Államok galériáit, és várhatóan 2030-ig lesz
            látható különböző helyszíneken.
          </p>

          <p>
            Egyetlen év leforgása alatt közel 2 000 önkéntes csaknem 30 000
            órát fordított a hímzésre, hogy ezek a történetek életre keljenek.
          </p>

          <p>
            Bízunk benne, hogy Amerika Kárpitja emlékeztet bennünket arra, hogy
            a demokráciát mindig is hétköznapi emberek építették – olyanok,
            mint Ön és én.
          </p>

          <p>
            Látogasson el standunkra, fedezze fel a 13 pannót, és csatlakozzon
            hozzánk egy különleges, jubileumi 14. pannó közös elkészítésében!
          </p>
        </ReadingContainer>
      </PageSection>

      {/* "(Insert photo carousel or grid of tapestries here)" — the thirteen
          panels in the Muscarelle grid format. */}
      {panelImages.length > 0 && (
        <PageSection paddingTop="none" background="colonial-oxblood">
          <section className="mx-auto w-full max-w-5xl">
            <h2 className="gallery-heading mt-1 text-3xl md:text-4xl">
              A tizenhárom pannó
            </h2>
            <div className="gold-threshold mt-3" />
            <div className="mt-8">
              <ExhibitionGallery images={panelImages} />
            </div>
          </section>
        </PageSection>
      )}

      <PageSection paddingTop="none" background="colonial-oxblood">
        <ReadingContainer width="article" background="paper">
          <h2>„E Pluribus Unum” Kárpit</h2>

          <p>
            A Benjamin Franklin által 1754-ben megalkotott, feldarabolt kígyó
            az amerikai történelem egyik legrégebbi és legismertebb politikai
            jelképe. Ma ezt a történelmi szimbólumot hímezzük meg közösen
            Önökkel.
          </p>

          <h3>Az első amerikai politikai karikatúra 1754</h3>

          <p>
            1754. május 9-én Benjamin Franklin saját újságjában egy apró
            fametszetet tett közzé: egy nyolc darabra vágott kígyót, amelynek
            minden darabját egy-egy brit gyarmat kezdőbetűi jelölték. A kép
            alatt ez a felirat állt: „JOIN, or DIE” – „Egyesüljetek, vagy
            elpusztultok!” Ezt tartják az első politikai karikatúrának, amely
            amerikai újságban jelent meg.
          </p>

          <p>
            Abban az időben Nagy-Britannia és Franciaország háborúra készült
            Észak-Amerikában, a brit gyarmatok azonban nem működtek együtt
            egymással. Franklin üzenete egyetlen képen foglalta össze a
            lényeget: külön-külön csak élettelen darabok vagyunk, együtt
            azonban erőt képviselünk. Húsz évvel később a kígyó újra megjelent
            – ezúttal már a brit uralommal szembeni ellenállás jelképeként, és
            az amerikai forradalom egyik legismertebb szimbólumává vált.
          </p>

          <h3>Miért éppen egy kígyó?</h3>

          <p>
            A korabeli néphit szerint egy feldarabolt kígyó újra életre kelhet,
            ha a darabjait naplemente előtt ismét összeillesztik. Benjamin
            Franklint ez a hiedelem ihlette híres ábrázolásának megalkotásakor.
          </p>

          <p>
            A csörgőkígyónak azonban egy másik jelentése is volt: ez az állat
            kizárólag az amerikai kontinensen őshonos, ezért az Újvilág, vagyis
            Amerika jelképévé vált. Franklin már 1751-ben is utalt erre egy
            írásában, amikor tréfásan azt javasolta, hogy Amerika
            csörgőkígyókat küldjön Nagy-Britanniának cserébe azokért az
            elítéltekért, akiket a brit hatóságok a gyarmatokra szállítottak.
          </p>

          <h3>A „Join, or Die” jelmondattól az „E Pluribus Unum”-ig</h3>

          <p>
            1776-ban egy bizottság – amelynek Benjamin Franklin is tagja volt –
            latin jelmondatot javasolt az új ország számára: „E pluribus unum”
            – „Sokból egy.” A jelmondat 1782-ben felkerült az Egyesült Államok
            Nagy Pecsétjére (Great Seal), és napjainkban is megtalálható az
            amerikai érméken.
          </p>

          <p>
            Amerika Kárpitja megőrzi Franklin híres kígyójának motívumát,
            ugyanakkor új jelentéssel ruházza fel azt. A fenyegető felhívás –
            „Join, or Die” („Egyesüljetek, vagy elpusztultok!”) – egy pozitív
            üzenetté alakul: „E pluribus unum” – „Sokból egy.” Ez a gondolat
            fejezi ki, hogy a sokféle közösség, ember és történet együtt alkot
            egy nemzetet.
          </p>
        </ReadingContainer>
      </PageSection>

      <PageSection paddingTop="none" background="colonial-oxblood">
        <ReadingContainer width="article" background="paper">
          <h2>Mit készítünk ma – az Ön segítségével?</h2>

          <h3>A kígyó</h3>

          <p>
            Testét a fesztivál látogatói által készített, hagyományos magyar
            hímzésminták töltik meg.
          </p>

          <h3>A háttér</h3>

          <p>
            A hátteret a látogatók által összevarrt textilcsíkok alkotják,
            amelyekre minden résztvevő felírhatja a nevét.
          </p>

          <p>
            Próbálja ki Ön is! Előzetes hímzőtudás nem szükséges – minden öltés
            számít, mi pedig megmutatjuk a hímzés alapjait.
          </p>
        </ReadingContainer>
      </PageSection>
    </div>
  );
}
