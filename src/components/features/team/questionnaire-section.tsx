import Link from 'next/link';

export function QuestionnaireSection() {
  return (
    <div className="mb-content-lg">
      <div className="bg-colonial-navy p-8 text-center">
        <h2 className="font-serif text-2xl text-colonial-parchment mb-4">
          Help Shape America's Tapestry
        </h2>
        <p className="text-colonial-parchment/90 mb-6 max-w-2xl mx-auto">
          As a valued member of our stitching community, your insights and
          experiences are invaluable to the continued success of America's
          Tapestry. We invite you to share your thoughts, suggestions, and
          stories through our brief questionnaire. Your feedback will help us
          better support our stitching groups and enhance this remarkable
          collaborative project.
        </p>
        <Link
          href="https://forms.gle/cxEa13PVCR2QwZMd9"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 font-serif bg-colonial-gold text-colonial-navy border border-colonial-gold hover:bg-yellow-500 hover:border-yellow-500 shadow-md transition-all duration-300"
        >
          Complete the Questionnaire
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
