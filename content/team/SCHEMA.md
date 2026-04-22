# Team Content Schema Documentation

This document defines the front matter fields available for team content in the America's Tapestry website.

## Directory Structure

```
content/team/
├── [group]/              # Team group directory
│   ├── index.md         # Group description file
│   └── [member-slug]/   # Individual member directory
│       └── index.md     # Member content file
```

## Group Types

- `illustrators` - Artists who create tapestry designs
- `state-directors` - Regional leaders coordinating state panels
- `historical-partners` - Organizations providing historical expertise
- `stitching-groups` - Collectives of needleworkers
- `project-director` - Project leadership

## Front Matter Fields

### Group Index Files (`[group]/index.md`)

```yaml
---
name: string              # Required - Display name for the group
description: string       # Required - Short description (shown in listings)
order: number            # Optional - Sort order (lower numbers appear first)
---
```

### Individual Member Files (`[group]/[member]/index.md`)

#### Core Fields (All Members)

```yaml
---
name: string              # Required - Full name of person/organization
role: string              # Required - Role title (e.g., "Illustrator", "State Director")
---
```

#### Optional Fields

```yaml
---
state: string | string[]  # State assignment (single string or array)
summary: string          # Brief description for listings
order: number           # Display order within group
imagePosition: string   # CSS object-position (e.g., "left center", "top")
portrait: string        # Optional dedicated portrait image filename (under /images/team/[group]/); overrides images[0] and the {slug}.{ext} fallback for the primary display image only
portraitPosition: string # CSS object-position for the portrait image; falls back to imagePosition if absent
visible: boolean        # Hide from display (default: true)
---
```

#### Group-Specific Fields

**Historical Partners**
```yaml
---
location: string         # City and state (e.g., "Atlanta, Georgia")
moreInformation: string  # External website URL
---
```

**Stitching Groups**
```yaml
---
moreInformation: string  # Organization website or social media URL
---
```

## Field Guidelines

### Required vs Optional
- `name` and `role` are always required
- Other fields are optional but recommended where applicable
- Missing optional fields are handled gracefully by the system

### State Field
- Use proper quotes around state names: `state: "Georgia"`
- For multiple states, use array format: `state: ["Georgia", "South Carolina"]`
- State names should match official tapestry state names

### Image Handling
- Images are automatically loaded from: `/public/images/team/[group]/[member]/[member].jpg`
- Face close-ups (state directors): `[member]-face.jpg`
- Use `imagePosition` to adjust image cropping if needed
- Stitching groups use placeholder graphics instead of photos

#### Multi-Image Support
```yaml
images: string[]         # Optional array of image filenames (e.g., ['work1.jpg', 'work2.jpg'])
```
- If `images` array is provided, displays as a gallery with lightbox functionality
- If `images` array is empty/undefined, falls back to single image pattern `{slug}.jpg`
- Images should be placed in `/public/images/team/{group}/` directory
- Use descriptive filenames: `{slug}-work{number}.{ext}` (e.g., `brunilda-rodriguez-work1.jpg`)

#### Portrait Override

```yaml
portrait: string         # Optional dedicated portrait image filename
portraitPosition: string # Optional CSS object-position for the portrait
```

- If `portrait` is set, it overrides `images[0]` and the `{slug}.{ext}` convention for the **primary display image only** — this includes the thumbnail in listings (grid variant), the single image on the member detail page, and the avatar on state/colony pages.
- The `images[]` gallery (thumbnail strip and lightbox on the full member page) is **not** affected by `portrait` — galleries continue to iterate over `images[]` as usual.
- Images should be placed in `/public/images/team/[group]/` (same directory as `images[]`).
- `portraitPosition` controls cropping for the portrait image. If omitted, it falls back to `imagePosition`, and then to the component's default (`center`, or `top` on the full member page).
- Does not apply to stitching groups (which use the `image` field) or override state-director `{member}-face.jpg` resolution elsewhere in the site.

### URLs
- Always include protocol: `https://example.com` not `example.com`
- Verify all external links are active

### Content Body
The markdown content after the front matter is displayed on individual member pages. Include:
- Professional background
- Relevant experience
- Connection to the project
- Notable achievements

## Examples

### State Director
```yaml
---
name: "Jane Smith"
role: "State Director"
state: "Maryland"
summary: "Experienced textile artist and historian leading Maryland's tapestry panel creation."
imagePosition: "center top"
---

Jane Smith brings over 20 years of experience...
```

### Historical Partner
```yaml
---
name: "Heritage Museum"
role: "Historical Partner"
state: "Virginia"
location: "Richmond, Virginia"
moreInformation: "https://heritagemuseum.org"
summary: "Premier institution preserving Virginia's colonial history."
---

The Heritage Museum provides invaluable research...
```

### Stitching Group
```yaml
---
name: "Capital Stitchers"
role: "Stitching Group"
state: "New York"
moreInformation: "https://capitalstitchers.org"
---

(Body content optional for stitching groups)
```

## Best Practices

1. **Consistency**: Use the same format for similar content types
2. **Completeness**: Fill in all applicable fields
3. **Accuracy**: Verify names, locations, and URLs
4. **Updates**: Keep information current, especially contact details
5. **Quality**: Ensure professional tone in descriptions

## Validation

Run these checks before publishing:
- All required fields present
- State names properly quoted
- URLs include https:// protocol
- No placeholder values (e.g., "XXX")
- Images exist in correct directories