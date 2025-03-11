interface SectionHeaderProps {
  title: string;
  description: string | React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={className}>
      <h2 className="section-title text-center mb-content-sm">{title}</h2>
      <div className="lead-text mb-content-md">{description}</div>
    </div>
  );
}
