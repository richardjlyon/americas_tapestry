import { VideoPlayer } from '@/components/video-player';
import { SectionHeader } from '@/components/ui/section-header';

export function AboutSection() {
  return (
    <div
      id="about"
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start"
    >
      <div className="content-typography">
        <p className="font-bold md:font-medium text-1xl md:text-2xl leading-tight  md:text-3xl">
          In 2026, Americans will celebrate our country's 250th anniversary. To
          commemorate this occasion, <em>America's Tapestry</em> weaves together
          stories from our nation's founding through the medium of embroidery.
        </p>
        <p className="text-1xl md:text-2xl leading-tight">
          Thirteen embroidered panels have been designed by our creative team in
          collaboration with historical organizations from each of the original
          colonies. Embroiderers within each state, led by our state directors,
          are stitching the panels over 18 months. The Tapestry will be
          exhibited in prominent gallery spaces in 2026 and 2027.
        </p>
        <p className="text-1xl md:text-2xl leading-tight">
          <em>America's Tapestry</em> enriches our understanding of our shared
          heritage, while promoting the art of American needlework. Through our
          virtual and in-person programming, visitors can learn about the
          revolution and engage in the historic practice of needlework.
        </p>
      </div>
      <div className="relative flex justify-center">
        <div className="w-full md:max-w-[350px] lg:max-w-[400px]">
          <VideoPlayer
            src="/video/250305-short-promotional/250305-short-promotional-v2-lowres.mp4"
            highResSrc="/video/250305-short-promotional/250305-short-promotional-v2.mp4"
            poster="`/video/250305-short-promotional/250305-short-promotional-v2-poster.png"
            className="aspect-[9/16] w-full"
          />
          <p className="font-serif text-sm sm:text-base text-colonial-navy/70 mt-2 italic text-center">
            Documentary excerpt: "The Making of America's Tapestry"
          </p>
        </div>
      </div>
    </div>
  );
}
