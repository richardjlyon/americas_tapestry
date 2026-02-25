import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';

interface TapestryTalkSectionProps {
  video: BlogPost;
}

export function TapestryTalkSection({ video }: TapestryTalkSectionProps) {
  return (
    <div className="pt-6">
      <h2 className="font-serif text-center text-2xl font-normal pb-4 md:pb-8">
        Tapestry Talk
      </h2>

      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-colonial-parchment/60 shadow-sm">
        {/* Video player */}
        <div className="bg-black">
          <video
            className="w-full max-h-[60vh] object-contain"
            controls
            preload="metadata"
            poster={video.image || '/images/placeholders/placeholder.svg'}
          >
            {video.videoWebm && (
              <source src={video.videoWebm} type="video/webm" />
            )}
            <source src={video.videoUrl} type="video/mp4" />
            <track kind="captions" src="#" label="English" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Caption bar */}
        <div className="vintage-paper px-6 py-4">
          <p className="text-colonial-navy/80 text-base">
            {video.excerpt || video.content}
          </p>
          <Link
            href={`/news/${video.slug}`}
            className="text-link text-sm mt-2 inline-block"
          >
            View full post →
          </Link>
        </div>
      </div>
    </div>
  );
}
