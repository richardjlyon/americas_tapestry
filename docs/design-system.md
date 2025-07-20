# America's Tapestry Design System

A comprehensive guide to the colonial-themed design system for America's Tapestry project.

## Overview

The America's Tapestry design system is built around a colonial aesthetic that reflects our nation's journey towards Independence. It combines modern UI practices with historically-inspired design elements to create an authentic and engaging experience.

## Design Tokens

### Color Palette

Our color system is based on authentic colonial colors that evoke the historical period:

#### Primary Colonial Colors

```css
/* Colonial Navy - Primary brand color */
--colonial-navy: #102542;

/* Colonial Burgundy - Accent color */
--colonial-burgundy: #711322;

/* Colonial Gold - Highlight color */
--colonial-gold: #e8b903;

/* Colonial Stone - Neutral/secondary background */
--colonial-stone: #d8d3c8;
```

#### Background Textures

```css
/* Linen Texture - Subtle textured background */
--colonial-linen-texture: #f5f1e6;

/* Linen Woven - Fine woven pattern background */
--colonial-linen-woven: #f7f3ea;

/* Vintage Paper - Aged paper texture */
--colonial-vintage-paper: #f8f3e6;

/* Parchment - Primary content background */
--colonial-parchment: #f4e9d5;
```

#### Usage Guidelines

- **Navy**: Use for headings, primary text, and primary buttons
- **Burgundy**: Use for links, secondary actions, and accents
- **Gold**: Use sparingly for highlights, call-to-actions, and special elements
- **Stone**: Use for borders, dividers, and subtle backgrounds
- **Backgrounds**: Use for content areas, cards, and textured sections

### Typography

#### Font Families

```css
/* Headings - Clean, modern sans-serif */
font-family: 'Montserrat', system-ui, sans-serif;

/* Body Text - Classical serif for readability */
font-family: 'EB Garamond', Georgia, serif;
```

#### Font Scale

```css
/* Headings */
h1: text-4xl md:text-5xl tracking-tight (36px-48px)
h2: text-3xl md:text-4xl tracking-tight (30px-36px)
h3: text-2xl md:text-3xl (24px-30px)
h4: text-xl md:text-2xl (20px-24px)

/* Body Text */
p: text-lg sm:text-xl leading-relaxed (18px-20px)
small: text-sm (14px)
```

#### Typography Utilities

```css
.page-heading     /* Large page titles */
.section-title    /* Section headings */
.lead-text        /* Introduction paragraphs */
.content-typography /* Rich text content areas */
```

### Spacing & Layout

#### Container Padding

```css
DEFAULT: 1.5rem (24px)
sm: 2rem (32px)
lg: 4rem (64px)
```

#### Section Spacing

```css
.section-padding: py-12 sm:py-16 md:py-20 lg:py-24
.page-section: pb-6 md:pt-4 md:pb-12
```

## Component Library

### Button System

Our consolidated button system uses Class Variance Authority (CVA) for type-safe variants.

#### Primary Variants

```tsx
import { Button } from '@/components/ui/button';

// Colonial Primary - Main action buttons
<Button variant="colonial-primary">
  Get Started
</Button>

// Colonial Secondary - Secondary actions
<Button variant="colonial-secondary">
  Learn More
</Button>

// Colonial Gold - Special call-to-actions
<Button variant="colonial-gold">
  Donate Now
</Button>
```

#### Outline Variants

```tsx
// Colonial Outline - Subtle actions
<Button variant="colonial-outline">
  View Details
</Button>

// Colonial Ghost - Minimal actions
<Button variant="colonial-ghost">
  Cancel
</Button>
```

#### Textured Variants

```tsx
// Colonial Parchment - Textured background
<Button variant="colonial-parchment">
  Read More
</Button>

// Colonial Stone - Neutral actions
<Button variant="colonial-stone">
  Back
</Button>
```

#### Sizes

```tsx
<Button size="sm">Small Button</Button>
<Button size="default">Default Button</Button>
<Button size="lg">Large Button</Button>
<Button size="icon">
  <Icon className="h-4 w-4" />
</Button>
```

#### Button Implementation

```typescript
// Button variants configuration
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        'colonial-primary': 'font-serif rounded-full bg-colonial-burgundy text-colonial-parchment border border-colonial-burgundy hover:bg-colonial-navy hover:border-colonial-navy shadow-md transition-all duration-300',
        'colonial-secondary': 'font-serif rounded-full bg-colonial-navy text-colonial-parchment border border-colonial-navy hover:bg-colonial-burgundy hover:border-colonial-burgundy shadow-md transition-all duration-300',
        'colonial-gold': 'font-serif rounded-full bg-colonial-gold text-colonial-navy border border-colonial-gold hover:bg-yellow-500 hover:border-yellow-500 shadow-md transition-all duration-300',
        'colonial-outline': 'font-serif rounded-full border border-colonial-navy text-colonial-navy bg-transparent hover:bg-colonial-navy hover:text-colonial-parchment shadow-sm transition-all duration-300',
        'colonial-ghost': 'font-serif rounded-full text-colonial-navy hover:bg-colonial-navy/10 transition-all duration-300',
        'colonial-parchment': 'font-serif rounded-full bg-colonial-parchment text-colonial-navy border border-colonial-stone hover:bg-colonial-stone shadow-sm transition-all duration-300',
        'colonial-stone': 'font-serif rounded-full bg-colonial-stone text-colonial-navy border border-colonial-stone hover:bg-colonial-stone/80 shadow-sm transition-all duration-300'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 py-1.5 text-xs',
        lg: 'h-12 px-6 py-3 text-base',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'colonial-primary',
      size: 'default'
    }
  }
);
```

### Cards & Content Areas

#### Content Card

```tsx
import { ContentCard } from '@/components/ui/content-card';

<ContentCard className="transition-all hover:shadow-lg">
  <h3 className="text-xl font-bold text-colonial-navy mb-2">
    Card Title
  </h3>
  <p className="font-serif text-colonial-navy/80">
    Card content goes here...
  </p>
</ContentCard>
```

#### Section Header

```tsx
import { SectionHeader } from '@/components/ui/section-header';

<SectionHeader
  title="Section Title"
  description="Section description text"
/>
```

### Background Textures

Apply authentic textures to content areas:

```tsx
// Linen Texture
<div className="linen-texture p-6">
  Content with linen texture
</div>

// Woven Linen
<div className="woven-linen p-6">
  Content with woven pattern
</div>

// Vintage Paper
<div className="vintage-paper p-6">
  Content with vintage paper texture
</div>

// Authentic Parchment
<div className="authentic-parchment p-6">
  Content with parchment texture
</div>
```

### Status Badges

Use status badges to indicate project progress:

```tsx
<span className="status-badge status-not-started">
  Not Started
</span>
<span className="status-badge status-designed">
  Designed
</span>
<span className="status-badge status-in-production">
  In Production
</span>
<span className="status-badge status-finished">
  Finished
</span>
```

## Layout Components

### Page Structure

#### PageSection Component

The `PageSection` component provides consistent vertical spacing with a simplified system:

```tsx
import { PageSection } from '@/components/ui/page-section';

// Standard spacing options
<PageSection spacing="tight">     {/* py-8 md:py-12 - For closely related content */}
<PageSection spacing="normal">    {/* py-12 md:py-16 - Default for most content */}
<PageSection spacing="spacious">  {/* py-16 md:py-24 - For major section breaks */}

// With decorative pin
<PageSection spacing="normal" hasPin={true}>
  {/* Content with needle decoration */}
</PageSection>

// With background textures
<PageSection spacing="normal" background="vintage-paper">
  {/* Content with textured background */}
</PageSection>
```

**Spacing Guidelines:**
- `tight`: Related content sections, sub-sections
- `normal`: Standard content sections (default) 
- `spacious`: Major page divisions, hero sections

#### ReadingContainer Component

The `ReadingContainer` component provides optimal readability for text content:

```tsx
import { ReadingContainer } from '@/components/ui/reading-container';

// Optimal reading width (recommended for articles)
<ReadingContainer width="article" background="paper">
  <h2>Article Title</h2>
  <p>Long-form content with optimal line length for readability...</p>
</ReadingContainer>

// Mixed content width
<ReadingContainer width="content" background="parchment">
  {/* Content with images, text, and other elements */}
</ReadingContainer>

// Wide content width
<ReadingContainer width="wide" background="none">
  {/* Visual content that needs more space */}
</ReadingContainer>
```

**Width Options:**
- `article` (max-w-3xl): ~65 characters, optimal for reading
- `content` (max-w-4xl): ~80 characters, good for mixed content  
- `wide` (max-w-5xl): ~100 characters, for visual content

**Background Options:**
- `paper`: Vintage paper texture (vintage-paper)
- `parchment`: Authentic parchment texture (authentic-parchment)
- `none`: No background texture

#### Standard Content Page Pattern

```tsx
export default function ContentPage() {
  return (
    <>
      <h1 className="page-heading">Page Title</h1>
      <p className="lead-text">Optional lead text</p>
      
      <PageSection spacing="normal">
        <ReadingContainer width="article" background="paper">
          {/* All page content */}
        </ReadingContainer>
      </PageSection>
    </>
  );
}
```

### Grid Layouts

```tsx
// Responsive grid for cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
  {items.map(item => (
    <ContentCard key={item.id}>
      {/* Card content */}
    </ContentCard>
  ))}
</div>
```

## Usage Guidelines

### Do's

✅ **Use colonial colors consistently** - Stick to the defined palette  
✅ **Combine serif and sans-serif fonts** - Headings in Montserrat, body in EB Garamond  
✅ **Apply textures thoughtfully** - Use background textures to enhance historical feel  
✅ **Maintain proper contrast** - Ensure text is readable on all backgrounds  
✅ **Use rounded buttons** - Colonial buttons should have rounded-full class  
✅ **Include transitions** - Add smooth transitions for interactive elements  
✅ **Use ReadingContainer for content** - Ensures optimal line length and consistency  
✅ **Use simplified spacing system** - Stick to tight/normal/spacious options  

### Don'ts

❌ **Don't use hardcoded colors** - Always use the defined color tokens  
❌ **Don't mix button styles** - Use the consolidated Button component  
❌ **Don't overuse gold** - Gold should be used sparingly for highlights  
❌ **Don't ignore accessibility** - Maintain WCAG contrast requirements  
❌ **Don't use modern UI patterns** - Keep the colonial aesthetic consistent  
❌ **Don't use deprecated spacing props** - Use the new spacing system instead of paddingTop/paddingBottom  
❌ **Don't create manual containers** - Use ReadingContainer instead of custom max-width + ContentCard combinations  

### Accessibility

- Maintain minimum contrast ratio of 4.5:1 for normal text
- Provide focus indicators for all interactive elements
- Use semantic HTML structure
- Include proper ARIA labels where needed
- Support keyboard navigation

## Migration Guide

### From Old Layout Patterns to ReadingContainer

Replace manual container patterns with the unified ReadingContainer:

```tsx
// Before - Manual container pattern
<PageSection paddingTop="none">
  <div className="max-w-3xl mx-auto">
    <ContentCard className="content-typography vintage-paper" padding="large">
      {content}
    </ContentCard>
  </div>
</PageSection>

// After - Using ReadingContainer
<PageSection spacing="normal">
  <ReadingContainer width="article" background="paper">
    {content}
  </ReadingContainer>
</PageSection>
```

### From Old Spacing System to Simplified System

Replace complex padding combinations:

```tsx
// Before - Complex spacing (25 possible combinations)
<PageSection paddingTop="large" paddingBottom="medium">
<PageSection paddingTop="none" paddingBottom="small">

// After - Simplified spacing (3 meaningful options)
<PageSection spacing="normal">
<PageSection spacing="tight">
<PageSection spacing="spacious">
```

### From Old Button Components

Replace legacy button imports:

```tsx
// Before
import { ColonialPrimaryButton } from '@/components/ui/colonial-buttons';
import { ColonialGoldButton } from '@/components/ui/colonial-buttons';

// After
import { Button } from '@/components/ui/button';

// Usage
<Button variant="colonial-primary">Primary Action</Button>
<Button variant="colonial-gold">Special Action</Button>
```

### Color Updates

Replace hardcoded colors with tokens:

```tsx
// Before
className="bg-[#102542] text-[#f4e9d5]"

// After
className="bg-colonial-navy text-colonial-parchment"
```

### Content Page Migration

Replace inconsistent content patterns:

```tsx
// Before - Various patterns
<div className="p-6 md:p-8">
  <div className="content-typography" dangerouslySetInnerHTML={{ __html: content }} />
</div>

// Or
<ContentCard className="overflow-hidden p-0 max-w-4xl mx-auto vintage-paper">
  <div className="content-typography p-6 md:p-8">
    {content}
  </div>
</ContentCard>

// After - Unified pattern
<ReadingContainer width="content" background="paper">
  <div dangerouslySetInnerHTML={{ __html: content }} />
</ReadingContainer>
```

## Performance Considerations

- Button variants are optimized with CVA for minimal bundle size
- Texture backgrounds use efficient SVG patterns
- Colors are defined once in CSS custom properties
- Responsive typography reduces layout shifts

## Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)
- Progressive enhancement for older browsers

## Contributing

When adding new components:

1. Follow the colonial color palette
2. Use CVA for variant management
3. Include proper TypeScript types
4. Add accessibility features
5. Document usage examples
6. Test across devices

---

*This design system ensures visual consistency and maintains the authentic colonial aesthetic throughout America's Tapestry project.*