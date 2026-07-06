import { PageSection } from "@/components/ui/page-section";
import { ReadingContainer } from "@/components/ui/reading-container";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Learn about America's Tapestry — its mission, history, and the team behind thirteen embroidered panels created for America's 250th anniversary and now on a two-year exhibition tour.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <h1 className="page-heading">Welcome to America's Tapestry!</h1>

      <p className="lead-text text-center mb-content-lg">
        Celebrating America's 250th Anniversary.
      </p>

      <PageSection spacing="tight">
        {/* Hero image */}
        <div className="max-w-5xl mx-auto mb-6 md:mb-12 relative rounded-lg overflow-hidden shadow-xl">
          <Image
            src="/images/content/about-us.webp"
            alt="America's Tapestry - Collaborative embroidery project"
            width={1200}
            height={600}
            className="w-full object-cover"
          />
        </div>

        <ReadingContainer width="article" background="paper">
          <p className="font-bold">
            On July 4th 2026, our nation marked the 250th anniversary of the
            signing of the Declaration of Independence. All over the United
            States, communities held events to illustrate and celebrate our
            unique history, and to look forward to the next 250 years.
          </p>

          <p>
            One such event was organized by costume designer and fiber artist
            Stefan Romero. Stefan is a graduate of Carnegie Mellon
            University&apos;s College of Fine Arts, where he specialized in the
            dress and textiles of Colonial America. As a Fulbright Scholar,
            Stefan deepened his understanding of the discipline through his
            Masters Degree at the University of Glasgow in Scotland.
          </p>

          <p>
            In collaboration with William & Mary (VA), Seton Hill University
            (PA), and a number of carefully selected historical and craft
            organizations, Stefan created a once-in-a-generation fiber arts
            project.
          </p>

          <p>
            America&apos;s Tapestry features 13 hand embroidered panels, one for
            each of the original colonies. The embroidery was carried out by
            volunteers from ages of 5 to 96 from New Hampshire to Georgia. The
            panels illustrate stories of individual contributions – many
            overlooked – that reveal each colony&apos;s struggle for
            independence. Historical associations from across the states
            collaborated on the panels&apos; imagery and generously hosted the
            stitchers as they worked.
          </p>

          <blockquote>
            &ldquo;The idea came to me while on a work assignment in Europe
            after visiting &lsquo;The Great Tapestry of Scotland&rsquo;&rdquo;,
            says Stefan. &ldquo;I was deeply moved by the richness and drama of
            Scotland&apos;s story as it unfolded from panel to panel. As the
            product of many talented individuals working across the country to
            create a harmonious whole, it seemed to characterize one of the
            defining features of the American experiment.&rdquo;
          </blockquote>

          <p>
            Over 1,000 volunteers joined America&apos;s Tapestry to embroider
            the panels, with local directors guiding the effort in each of the
            participating states. Following its inaugural display at William
            & Mary&apos;s Muscarelle Museum of Art – a stone&apos;s throw
            away from Colonial Williamsburg – America&apos;s Tapestry is now
            touring historic venues throughout the East Coast on a two year
            traveling exhibition, running through 2028.
          </p>

          <p>
            Please explore our website to learn more about the many talented
            artists and volunteers who made this project possible – and visit
            our exhibitions page to see where the Tapestry is on display.
          </p>
        </ReadingContainer>
      </PageSection>
    </>
  );
}
