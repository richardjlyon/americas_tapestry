"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import type { TeamMember } from "@/lib/team";
import { useState, useEffect } from "react";
import { remark } from "remark";
import html from "remark-html";
import { getImageSizes } from "@/lib/image-utils";
import { StitchingGroupPlaceholder } from "./stitching-group-placeholder";
import { ContentCard } from "@/components/ui/content-card";
import { ImageLightbox } from "@/components/ui/image-lightbox";

interface MemberCardProps {
  member: TeamMember;
  variant?: "grid" | "full" | "simple";
  width?: "full" | "two-thirds" | "half";
  className?: string;
}

export function MemberCard({
  member,
  variant = "grid",
  width = "two-thirds",
  className,
}: MemberCardProps) {
  const placeholderPath = `/images/placeholders/placeholder-state-director.svg?height=600&width=450&text=${encodeURIComponent(member.name)}`;

  // Image handling supporting both single image and multiple images
  const getImageSrc = (imageIndex: number = 0) => {
    // For stitching groups, use the single image field if available
    if (member.groupSlug === "stitching-groups" && member["image"]) {
      return `/images/team/${member.groupSlug}/${member["image"]}`;
    }
    // For other groups, use existing logic with images array
    const imageExtension =
      member.groupSlug === "stitching-venues" ? "png" : "jpg";
    const images = member.images || [`${member.slug}.${imageExtension}`];
    return `/images/team/${member.groupSlug}/${images[imageIndex]}`;
  };

  const getImageCount = () => {
    // For stitching groups, always 1 (single image or placeholder)
    if (member.groupSlug === "stitching-groups") {
      return 1;
    }
    // For other groups, return actual images count
    return member.images ? member.images.length : 1;
  };

  // State management for image loading and content processing
  // Don't load images for:
  // 1. Group index files (these have description but no role, or slug matches group name)
  const isGroupIndexFile = member["description"] && !member["role"];
  const shouldUseImage = !isGroupIndexFile;
  const teamImagePath = shouldUseImage ? getImageSrc() : placeholderPath;
  const [imgSrc, setImgSrc] = useState<string>(teamImagePath);
  const [imgError, setImgError] = useState(false);
  const [contentHtml, setContentHtml] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle image load error with fallback chain
  const handleImageError = () => {
    console.warn(`Image failed to load: ${imgSrc} for ${member.name}`);

    if (
      imgSrc !== "/images/placeholders/placeholder-user.jpg" &&
      imgSrc !== placeholderPath
    ) {
      // Try generic user placeholder first
      setImgSrc("/images/placeholders/placeholder-user.jpg");
    } else if (imgSrc !== placeholderPath) {
      // Try the specific placeholder
      setImgSrc(placeholderPath);
    } else {
      // All fallbacks failed, show error state
      setImgError(true);
    }
  };

  // Process markdown content
  useEffect(() => {
    const processContent = async () => {
      const contentToProcess =
        variant === "full" ? member.content : member.content.split("\n\n")[0];

      try {
        const processedContent = await remark()
          .use(html)
          .process(contentToProcess);
        setContentHtml(processedContent.toString());
      } catch (error) {
        console.error("Error processing markdown:", error);
        setContentHtml(`<p>${contentToProcess}</p>`);
      }
    };

    processContent();
  }, [member.content, variant]);

  // Grid variant (similar to TeamMemberCard)
  if (variant === "grid") {
    return (
      <div
        className={cn(
          "bg-white rounded-lg shadow-md overflow-hidden border border-colonial-navy/10 h-full flex flex-col",
          className,
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            member.groupSlug === "250-commission"
              ? "aspect-[3/2] flex items-center justify-center p-4"
              : "aspect-[3/4]",
          )}
        >
          {/* Multiple images indicator - only for non-stitching groups */}
          {member.groupSlug !== "stitching-groups" && getImageCount() > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
              +{getImageCount() - 1} more
            </div>
          )}
          {member.groupSlug === "stitching-groups" && !member["image"] ? (
            <StitchingGroupPlaceholder name={member.name} />
          ) : !imgError ? (
            member.groupSlug === "250-commission" ? (
              <Image
                src={imgSrc}
                alt={member.name}
                width={300}
                height={200}
                className="object-contain max-w-full max-h-full transition-transform duration-500 hover:scale-105"
                style={{
                  objectPosition: member.imagePosition || "center",
                }}
                onError={handleImageError}
              />
            ) : (
              <Image
                src={imgSrc}
                alt={member.name}
                fill
                sizes={getImageSizes("thumbnail")}
                className="object-cover object-center transition-transform duration-500 hover:scale-105"
                style={{
                  objectPosition: member.imagePosition || "center",
                }}
                onError={handleImageError}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-colonial-navy/40 text-center p-4">
                {member.name}
              </div>
            </div>
          )}
        </div>
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-colonial-navy">
            {member.name}
          </h3>
          <p className="font-serif text-colonial-burgundy mb-3">
            {member.role}
            {member.state ? `, ${member.state}` : ""}
          </p>

          {member.groupSlug === "stitching-groups" && member["more_info"] && (
            <div className="mt-auto pt-4">
              <a
                href={`${member["more_info"]}`}
                className="inline-block text-link"
              >
                More info →
              </a>
            </div>
          )}
          {member["specialization"] && (
            <p className="font-serif text-sm text-colonial-navy/70 mb-2">
              Specialization: {member["specialization"]}
            </p>
          )}
          {member["members"] && (
            <p className="font-serif text-sm text-colonial-navy/70 mb-2">
              Members: {member["members"]}
            </p>
          )}
          {member["established"] && (
            <p className="font-serif text-sm text-colonial-navy/70 mb-2">
              Established: {member["established"]}
            </p>
          )}
          {member["partnership_year"] && (
            <p className="font-serif text-sm text-colonial-navy/70 mb-2">
              Partnership since: {member["partnership_year"]}
            </p>
          )}

          <div
            className="mt-3 font-serif text-colonial-navy/80 line-clamp-6 content-typography"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {member.groupSlug !== "stitching-groups" && (
            <div className="mt-auto pt-4">
              <a
                href={`/team/${member.groupSlug}/${member.slug}`}
                className="inline-block text-link"
              >
                Read full bio →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant (similar to PersonCard)
  if (variant === "full") {
    const widthClass = {
      full: "w-full",
      "two-thirds": "w-full lg:w-2/3 mx-auto",
      half: "w-full lg:w-1/2 mx-auto",
    }[width];

    return (
      <div className={cn(`mb-4 md:mb-8 ${widthClass}`, className)}>
        <ContentCard className="overflow-hidden p-0">
          <div className="md:flex">
            <div className="md:w-1/3 lg:w-1/4 pt-6 md:pt-8">
              {/* Image Gallery for Full Variant - only for non-stitching groups with multiple images */}
              {member.groupSlug !== "stitching-groups" &&
              getImageCount() > 1 ? (
                <div className="space-y-2">
                  {/* Main Image */}
                  <div
                    className={cn(
                      "relative cursor-pointer hover:opacity-90 transition-opacity",
                      member.groupSlug === "250-commission"
                        ? "h-60 flex items-center justify-center p-2"
                        : "h-60",
                    )}
                    onClick={() => {
                      setCurrentImageIndex(0);
                      setLightboxOpen(true);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCurrentImageIndex(0);
                        setLightboxOpen(true);
                      }
                    }}
                    aria-label={`View full size image 1 of ${member.name}`}
                  >
                    <Image
                      src={getImageSrc(0)}
                      alt={`${member.name} 1`}
                      fill
                      sizes={getImageSizes("thumbnail")}
                      className="object-contain"
                      style={{
                        objectPosition: member.imagePosition || "center",
                      }}
                      priority
                      onError={handleImageError}
                    />
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 gap-1">
                    {member.images!.slice(1).map((_, index) => (
                      <div
                        key={index + 1}
                        className="relative h-16 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setCurrentImageIndex(index + 1);
                          setLightboxOpen(true);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setCurrentImageIndex(index + 1);
                            setLightboxOpen(true);
                          }
                        }}
                        aria-label={`View full size image ${index + 2} of ${member.name}`}
                      >
                        <Image
                          src={getImageSrc(index + 1)}
                          alt={`${member.name} ${index + 2}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                          onError={handleImageError}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Single Image Display */
                <div
                  className={cn(
                    "relative",
                    member.groupSlug === "250-commission"
                      ? "h-80 md:h-80 flex items-center justify-center p-4"
                      : "h-80 md:h-80",
                  )}
                >
                  {imgSrc && !imgError && !imgSrc.includes("placeholder") ? (
                    <div
                      className="cursor-pointer hover:opacity-90 transition-opacity h-full w-full"
                      onClick={() => setLightboxOpen(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setLightboxOpen(true);
                        }
                      }}
                      aria-label={`View full size image of ${member.name}`}
                    >
                      {member.groupSlug === "250-commission" ? (
                        <Image
                          src={imgSrc}
                          alt={member.name}
                          width={300}
                          height={200}
                          className="object-contain max-w-full max-h-full"
                          style={{
                            objectPosition: member.imagePosition || "center",
                          }}
                          priority
                          onError={handleImageError}
                        />
                      ) : (
                        <Image
                          src={imgSrc}
                          alt={member.name}
                          fill
                          sizes={getImageSizes("thumbnail")}
                          className="object-contain"
                          style={{
                            objectPosition: member.imagePosition
                              ? member.imagePosition
                                  .replace(/center$/, "top")
                                  .replace(/bottom$/, "top")
                              : "top",
                          }}
                          priority
                          onError={handleImageError}
                        />
                      )}
                    </div>
                  ) : (
                    <Image
                      src={
                        imgSrc && !imgError
                          ? imgSrc
                          : "/images/placeholders/placeholder-user.jpg"
                      }
                      alt={`${member.name}${imgSrc && !imgError ? "" : " - placeholder"}`}
                      fill
                      sizes={getImageSizes("thumbnail")}
                      className="object-cover"
                      style={{
                        objectPosition: member.imagePosition || "center",
                      }}
                      onError={handleImageError}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8">
              <div className="border-b border-colonial-gold pb-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-colonial-navy">
                  {member.name}
                </h2>
                <p className="font-serif text-xl text-colonial-burgundy mt-1">
                  {member.role}
                  {member.state ? `, ${member.state}` : ""}
                </p>
              </div>
              <div
                className="prose prose-lg max-w-none font-serif text-colonial-navy prose-headings:font-sans prose-a:text-colonial-burgundy"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
              {member.moreInformation && (
                <div className="mt-auto pt-4">
                  <a
                    href={`${member.moreInformation}`}
                    className="inline-block text-link"
                  >
                    More information →
                  </a>
                </div>
              )}
            </div>
          </div>
        </ContentCard>

        {/* Image Lightbox with Navigation */}
        <ImageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          src={getImageSrc(currentImageIndex)}
          alt={`${member.name} ${currentImageIndex + 1}`}
          title={`${member.name} - ${member.role}${member.state ? `, ${member.state}` : ""} (${currentImageIndex + 1}/${getImageCount()})`}
          showNavigation={getImageCount() > 1}
          onPrevious={
            getImageCount() > 1
              ? () =>
                  setCurrentImageIndex((prev) =>
                    prev > 0 ? prev - 1 : getImageCount() - 1,
                  )
              : undefined
          }
          onNext={
            getImageCount() > 1
              ? () =>
                  setCurrentImageIndex((prev) =>
                    prev < getImageCount() - 1 ? prev + 1 : 0,
                  )
              : undefined
          }
        />
      </div>
    );
  }

  // Simple variant (compact version)
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-colonial-navy/10 p-4",
        className,
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0">
          {!imgError ? (
            <Image
              src={imgSrc}
              alt={member.name}
              fill
              sizes="64px"
              className="object-cover"
              style={{
                objectPosition: member.imagePosition || "center",
              }}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-colonial-navy/40 text-xs text-center">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>
          )}
        </div>
        <div className="flex-grow">
          <h4 className="text-lg font-semibold text-colonial-navy">
            {member.name}
          </h4>
          <p className="font-serif text-colonial-burgundy text-sm">
            {member.role}
            {member.state ? `, ${member.state}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
