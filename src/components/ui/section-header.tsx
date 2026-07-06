interface SectionHeaderProps {
  title: string;
  description: string | React.ReactNode;
  className?: string;
  /** 'light' = navy-on-cream (default); 'dark' = cream-on-navy gallery room. */
  tone?: 'light' | 'dark';
}

export function SectionHeader({
  title,
  description,
  className = '',
  tone = 'light',
}: SectionHeaderProps) {
  if (tone === 'dark') {
    return (
      <div className={className}>
        <h2 className="gallery-heading text-3xl md:text-4xl text-center mb-3">
          {title}
        </h2>
        <div className="gallery-lead max-w-3xl mx-auto text-center mb-content-md">
          {description}
        </div>
      </div>
    );
  }
  return (
    <div className={className}>
      <h2 className="section-title text-center mb-content-sm">{title}</h2>
      <div className="lead-text mb-content-md">{description}</div>
    </div>
  );
}
