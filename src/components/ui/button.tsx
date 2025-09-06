import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Colonial button variants consolidated from colonial-buttons.tsx

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Standard shadcn/ui variants
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground rounded-md',
        link: 'text-primary underline-offset-4 hover:underline',

        // Colonial theme variants
        'colonial-primary':
          'font-serif rounded-md bg-colonial-burgundy text-colonial-parchment border border-colonial-burgundy hover:bg-colonial-burgundy/80 hover:text-white hover:border-colonial-burgundy/80 shadow-md transition-all duration-300',
        'colonial-secondary':
          'font-serif rounded-md bg-colonial-navy text-colonial-parchment border border-colonial-navy hover:bg-colonial-navy/80 hover:text-white hover:border-colonial-navy/80 shadow-md transition-all duration-300',
        'colonial-gold':
          'font-serif rounded-md bg-colonial-gold text-colonial-navy border border-colonial-gold hover:bg-colonial-gold/90 hover:text-colonial-navy hover:border-colonial-gold/90 shadow-md transition-all duration-300',
        'colonial-outline':
          'font-serif rounded-md border border-colonial-navy text-colonial-navy bg-transparent hover:bg-colonial-navy hover:text-white shadow-md transition-all duration-300',
        'colonial-ghost':
          'font-serif rounded-md text-colonial-navy hover:bg-colonial-navy/15 hover:text-colonial-navy transition-all duration-300',
        'colonial-parchment':
          'font-serif rounded-md bg-colonial-parchment text-colonial-navy border border-colonial-gold/30 hover:bg-colonial-parchment/90 hover:text-colonial-navy hover:border-colonial-gold/70 shadow-sm transition-all duration-300',
        'colonial-stone':
          'font-serif rounded-md bg-colonial-stone text-colonial-navy border border-colonial-stone hover:bg-colonial-stone/90 hover:text-colonial-navy shadow-md transition-all duration-300',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
