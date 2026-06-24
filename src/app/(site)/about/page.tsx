import { PageSection } from "@/components/ui/page-section";
import { ReadingContainer } from "@/components/ui/reading-container";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Learn about America's Tapestry — its mission, history, and the team creating thirteen embroidered panels for America's 250th anniversary.",
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
            On July 4th 2026, our nation will commemorate the 250th anniversary
            of the signing of the Declaration of Independence. All over the
            United States, communities will be holding events to illustrate and
            mark our unique history, and to look forward to the next 250 years.
          </p>

          <p>
            Organizing one such event is 28 year-old costume designer and fiber
            artist Stefan Romero. Stefan is a graduate of Carnegie Mellon
            University&apos;s College of Fine Arts, where he specialized in the
            dress and textiles of Colonial America. As a Fulbright Scholar,
            Stefan deepened his understanding of the discipline through his
            Masters Degree at the University of Glasgow in Scotland.
          </p>

          <p>
            In collaboration with William & Mary (VA), Seton Hill University
            (PA), and a number of carefully selected historical and craft
            organizations, Stefan is creating a once-in-a-generation fiber arts
            project.
          </p>

          <p>
            America&apos;s Tapestry features 13 hand embroidered panels, one for
            each of the original colonies. The embroidery is currently being
            conducted by volunteers from ages of 5 to 96 from New Hampshire to
            Georgia. The panels illustrate stories of individual contributions –
            many overlooked – that reveal each colony&apos;s struggle for
            independence. Historical associations from across the states have
            volunteered to collaborate on the panels&apos; imagery and have
            generously agreed to host the stitchers as they work.
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
            Over 1,000 volunteers have joined America&apos;s Tapestry to
            embroider the panels, with local directors guiding the effort in
            each of the participating states. After their inaugural display at
            William & Mary&apos;s Muscarelle Museum of Art – a stone&apos;s
            throw away from Colonial Williamsburg, America&apos;s Tapestry will
            tour a number of other historic venues throughout the East Coast for
            a two year traveling exhibition.
          </p>

          <p>
            If you may be interested in volunteering to complete this historic
            effort, do not hesitate to reach out. All volunteers are welcome,
            regardless of age or experience with needle art.
          </p>

          <p>
            Please explore our website to learn more about the many talented
            artists and volunteers who are making this project possible.
          </p>
        </ReadingContainer>
      </PageSection>
    </>
  );
}
