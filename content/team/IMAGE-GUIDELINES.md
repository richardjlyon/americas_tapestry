# Team Member Image Guidelines

This document provides guidelines for team member photos to ensure consistent quality and presentation across the America's Tapestry website.

## Image Requirements

### Technical Specifications
- **Format**: JPG (preferred) or PNG
- **Resolution**: Minimum 800x1200 pixels
- **Aspect Ratio**: Portrait orientation (3:4 or 2:3)
- **File Size**: Maximum 2MB
- **Naming**: `[member-slug].jpg` (e.g., `stefan-romero.jpg`)

### Quality Standards
- **Focus**: Sharp, well-focused image
- **Lighting**: Even, natural lighting preferred
- **Background**: Simple, uncluttered background
- **Color**: Full color, properly white-balanced

## Composition Guidelines

### Portrait Positioning
- **Head placement**: Top third of image
- **Shoulders**: Include at least upper shoulders
- **Eye level**: Eyes should be roughly 1/3 from top
- **Orientation**: Subject looking toward camera

### Smart Cropping Support
The website uses CSS `object-position` to crop images appropriately for different contexts:

- **Default position**: `"center top"` - works for most portraits
- **Custom positioning**: Override with `imagePosition` field in front matter

#### Common Position Values
- `"center top"` - Head centered, crop from top (default)
- `"left center"` - Subject positioned on left side
- `"center center"` - Standard center crop
- `"left top"` - Subject on left, crop from top

### Image Contexts

#### 1. Team Member Cards (Circular, 128px)
- Face should be clearly visible when cropped to circle
- Avoid extreme close-ups or wide shots
- Ensure head fills approximately 60-70% of circle

#### 2. Full Team Cards (Rectangular, 300x400px)
- Full portrait with head and shoulders
- Professional appearance preferred
- Background should not compete with subject

#### 3. Individual Bio Pages (Various sizes)
- High-resolution version of same image
- Will be displayed at larger sizes
- Ensure quality holds up when enlarged

## Content Guidelines

### Professional Standards
- **Attire**: Business casual to professional
- **Expression**: Friendly, approachable
- **Pose**: Natural, comfortable positioning
- **Props**: Minimal, relevant to role if any

### Diversity and Inclusion
- Represent the diversity of our team
- Avoid stereotypical poses or settings
- Ensure all backgrounds and settings are professional

## File Organization

### Directory Structure
```
public/images/team/
├── state-directors/
│   ├── [member-slug].jpg          # Flattened structure
│   ├── [member-slug].jpg
│   └── ...
├── illustrators/
│   ├── [member-slug].jpg          # Flattened structure
│   ├── [member-slug].jpg
│   └── ...
├── historical-partners/
│   ├── [organization-slug].jpg    # Flattened structure
│   ├── [organization-slug].jpg
│   └── ...
├── project-director/
│   ├── [member-slug].jpg          # Flattened structure
│   └── ...
└── stitching-groups/
    (no images - uses placeholder graphics)
```

### Naming Convention
- Use the same slug as the content directory
- All lowercase, hyphens for spaces
- **State Directors, Illustrators, Historical Partners & Project Director**: `amy-gilley.jpg` (flattened structure)
- **Other Groups**: `amy-gilley/amy-gilley.jpg` (subfolder structure)

## Image Processing Workflow

### 1. Preparation
- Review composition guidelines
- Ensure proper lighting and focus
- Check background is appropriate

### 2. Optimization
- Resize to recommended dimensions
- Compress while maintaining quality
- Save as JPG with 85-90% quality

### 3. Implementation
- Place in correct directory structure
- Add/update `imagePosition` in front matter if needed
- Test on staging site

### 4. Fallback Handling
- Missing images automatically use placeholder
- No action needed for missing team members
- System gracefully handles image load failures

## Front Matter Configuration

```yaml
---
name: "Team Member Name"
role: "Their Role"
state: "Their State"
imagePosition: "center top"  # Optional: for custom cropping
---
```

### Image Position Examples

For subjects positioned off-center:
```yaml
imagePosition: "left center"    # Subject on left side of photo
imagePosition: "right center"   # Subject on right side of photo
```

For unusual cropping needs:
```yaml
imagePosition: "center bottom"  # Crop from bottom instead of top
imagePosition: "left top"       # Subject on left, crop from top
```

## Quality Checklist

Before adding a team member image, verify:

- [ ] Image meets technical specifications
- [ ] Subject clearly visible in circular crop
- [ ] Professional appearance and background
- [ ] Proper file naming and directory placement
- [ ] `imagePosition` set if subject not centered
- [ ] Image loads correctly on website
- [ ] Displays well in both card and detail views

## Common Issues and Solutions

### Image Too Dark/Light
- Adjust exposure and shadows in photo editor
- Ensure face is properly lit
- Avoid harsh shadows or overexposure

### Subject Too Small/Large
- Crop to show head and shoulders
- Use `imagePosition` to adjust focal point
- Reshoot if composition is fundamentally wrong

### Background Issues
- Use simple, professional backgrounds
- Avoid busy patterns or competing elements
- Consider replacing background if necessary

### Poor Circular Crop
- Ensure head is in upper portion of image
- Test with circular mask before uploading
- Adjust `imagePosition` if needed

## Tools and Resources

### Image Editing
- Adobe Photoshop/Lightroom
- GIMP (free alternative)
- Canva (online tool)
- Preview (macOS built-in)

### Compression
- TinyPNG (online)
- ImageOptim (macOS)
- Built-in export options in photo editors

### Testing
- Use browser developer tools to test circular crops
- Check multiple screen sizes
- Verify placeholder fallback works

## Support

For questions about image requirements or technical implementation, contact the development team or refer to the main SCHEMA.md documentation.