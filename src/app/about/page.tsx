import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import Image from 'next/image';

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
            mark our unique history, and to look forward to our next 250 years.
          </p>

          <p>
            Organizing one such event is 27 year-old artist and researcher
            Stefan Romero. Stefan is a graduate of Carnegie Mellon University's
            prestigious College of Fine Arts, where he specialized in the dress
            and textiles of Colonial America. As a Fulbright Scholar, Stefan
            deepened his understanding of the discipline through his Masters
            Degree at the University of Glasgow in Scotland.
          </p>

          <p>
            In collaboration with William & Mary (VA), Seton Hill University
            (PA), and a number of carefully selected historical and craft
            organizations, Stefan is creating a unique exhibition: "America's
            Tapestry".
          </p>

          <p>
            The exhibition features 13 hand embroidered panels, one for each of
            the original colonies. The embroidery will be conducted by talented
            artisans from New Hampshire to Georgia. The panels illustrate the
            diverse stories of individual contributions–many overlooked–that
            reveal each colony's struggle for Independence. Historical
            associations from across the states have volunteered to collaborate
            on the panels' historical imagery and have generously agreed to host
            the stitchers as they work.
          </p>

          <blockquote>
            "The idea came to me while on a work assignment in Europe after
            visiting 'The Great Tapestry of Scotland'", says Stefan. "I was
            deeply moved by the richness and drama of Scotland's story as it
            unfolded from panel to panel. As the product of many talented
            individuals working across the country to create a harmonious whole,
            it seemed to characterize one of the defining features of the
            American experiment."
          </blockquote>

          <p>
            Stefan will be working with chapters of the Embroidery Guild of
            America across the Eastern Seaboard to embroider the panels. After
            the inaugural display at William & Mary's historic campus–a stone's
            throw away from Colonial Williamsburg, "America's Tapestry" will
            tour a number of other historic venues throughout the East Coast.
          </p>

          <p>
            While many talented volunteers have already come forward to stitch
            the panels, a project of this magnitude requires considerable
            manpower. Interested EGA members are encouraged to volunteer to work
            on this historic project. Each panel will be stitched from July 2025
            to June 2026 at a historic institution within the original 13
            states. All materials will be provided.
          </p>

          <blockquote>
            "It is a privilege for me to represent our Nation with a needlework
            project that will be a legacy product of this historic occasion. As
            we look forward to our next 250 years, it is more important than
            ever to preserve a definitive art form that has contributed so much
            to our country's distinct artistic identity."
          </blockquote>
        </ReadingContainer>
      </PageSection>
    </>
  );
}
