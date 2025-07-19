import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Base styles shared by all colonial buttons
const baseStyles = [
  'inline-flex',
  'items-center',
  'justify-center',
  'gap-2',
  'rounded-full', // Colonial buttons are rounded
  'border',
  'shadow-md',
  'font-medium',
  'text-sm',
  'transition-all',
  'duration-300',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-colonial-gold',
  'focus-visible:ring-offset-2',
  'disabled:pointer-events-none',
  'disabled:opacity-50',
].join(' ');

// Define specific variant styles separately to avoid conflicts
const variantStyles = {
  burgundy: {
    base: 'bg-colonial-burgundy text-colonial-parchment border-colonial-burgundy',
    hover: 'hover:bg-colonial-navy hover:border-colonial-navy hover:text-colonial-parchment',
  },
  gold: {
    base: 'bg-colonial-gold text-colonial-navy border-colonial-gold',
    hover: 'hover:bg-colonial-navy hover:border-colonial-navy hover:text-colonial-parchment',
  },
  navy: {
    base: 'bg-colonial-navy text-colonial-parchment border-colonial-navy',
    hover: 'hover:bg-colonial-burgundy hover:border-colonial-burgundy hover:text-colonial-parchment',
  },
  outline: {
    base: 'bg-transparent text-colonial-navy border-colonial-navy',
    hover: 'hover:bg-colonial-navy hover:border-colonial-navy hover:text-colonial-parchment',
  },
  ghost: {
    base: 'bg-transparent text-colonial-navy border-transparent',
    hover: 'hover:bg-colonial-navy/10 hover:border-transparent hover:text-colonial-navy',
  },
};

// Size variations
const sizeStyles = {
  sm: 'h-9 px-4 py-1.5 text-xs',
  md: 'h-10 px-5 py-2',
  lg: 'h-12 px-8 py-3 text-base',
  xl: 'h-14 px-10 py-3.5 text-lg',
};

const colonialButtonVariants = cva(baseStyles, {
  variants: {
    variant: {
      burgundy: `${variantStyles.burgundy.base} ${variantStyles.burgundy.hover}`,
      gold: `${variantStyles.gold.base} ${variantStyles.gold.hover}`,
      navy: `${variantStyles.navy.base} ${variantStyles.navy.hover}`,
      outline: `${variantStyles.outline.base} ${variantStyles.outline.hover}`,
      ghost: `${variantStyles.ghost.base} ${variantStyles.ghost.hover}`,
    },
    size: sizeStyles,
  },
  defaultVariants: {
    variant: 'burgundy',
    size: 'md',
  },
});

export interface ColonialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof colonialButtonVariants> {
  asChild?: boolean;
}

const ColonialButton = React.forwardRef<HTMLButtonElement, ColonialButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(colonialButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ColonialButton.displayName = 'ColonialButton';

export { ColonialButton, colonialButtonVariants };