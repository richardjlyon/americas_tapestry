import { BookOpenText, GraduationCap, Users2 } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';

export function VisionSection() {
  return (
    <>
      <SectionHeader
        title="Our Vision"
        description="We're committed to preserving history, educating future generations, and building a community of needlework enthusiasts."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* Preserve History Card */}
        <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
          <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpenText className="h-8 w-8 text-colonial-burgundy" />
          </div>
          <h3 className="text-xl font-bold text-colonial-burgundy mb-4">
            Preserve History
          </h3>
          <p className="font-serif text-colonial-navy/80 leading-relaxed">
            Create a lasting artistic record of America's founding that will
            educate and inspire future generations.
          </p>
        </div>

        {/* Educate Americans Card */}
        <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
          <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-8 w-8 text-colonial-burgundy" />
          </div>
          <h3 className="text-xl font-bold text-colonial-burgundy mb-4">
            Educate Young Americans
          </h3>
          <p className="font-serif text-colonial-navy/80 leading-relaxed">
            Provide educational resources that bring colonial history to life
            through art and storytelling.
          </p>
        </div>

        {/* Build Community Card */}
        <div className="bg-white rounded-lg p-8 text-center shadow-md border border-colonial-navy/10">
          <div className="w-16 h-16 bg-colonial-navy/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users2 className="h-8 w-8 text-colonial-burgundy" />
          </div>
          <h3 className="text-xl font-bold text-colonial-burgundy mb-4">
            Promote needleworking
          </h3>
          <p className="font-serif text-colonial-navy/80 leading-relaxed">
            Inspire creativity, preserve, and advance traditional craftsmanship.
          </p>
        </div>
      </div>
    </>
  );
}
