import type React from "react"
import PageLayout from "../page-layout"

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PageLayout>{children}</PageLayout>
}

