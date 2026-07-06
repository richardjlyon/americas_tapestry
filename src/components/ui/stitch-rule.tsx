/** A dashed gold rule evoking a running embroidery stitch. */
export function StitchRule({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-0 w-16 border-t-2 border-dashed border-colonial-gold ${className}`}
    />
  );
}
