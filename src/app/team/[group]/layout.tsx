import type React from 'react';

// This layout inherits from the parent team layout
// No PageLayout wrapper needed as it's already provided by the parent
export default function TeamGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
