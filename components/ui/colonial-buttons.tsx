import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

// Base button props type
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  asChild?: boolean;
};

// Parchment Buttons
export const ParchmentButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', asChild = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        className={cn(
          // Base styles
          'font-serif',
          // Variant styles
          variant === 'default' &&
            'bg-amber-50 text-stone-800 border border-amber-900/30 hover:bg-amber-100 hover:border-amber-900/50 active:bg-amber-200 shadow-sm',
          variant === 'outline' &&
            'bg-transparent text-stone-800 border border-amber-900/30 hover:bg-amber-50 hover:border-amber-900/50 active:bg-amber-100',
          variant === 'ghost' &&
            'bg-transparent text-stone-800 hover:bg-amber-50 hover:border-amber-900/50 active:bg-amber-100',
          className,
        )}
        {...props}
      />
    );
  },
);
ParchmentButton.displayName = 'ParchmentButton';

// Navy Buttons
export const NavyButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', asChild = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        className={cn(
          // Base styles
          'font-serif',
          // Variant styles
          variant === 'default' &&
            'bg-indigo-900 text-amber-50 border border-indigo-700 hover:bg-indigo-800 active:bg-indigo-950 shadow-md',
          variant === 'outline' &&
            'bg-transparent text-indigo-900 border-2 border-indigo-900 hover:bg-indigo-50 active:bg-indigo-100',
          variant === 'ghost' &&
            'bg-transparent text-indigo-900 hover:bg-indigo-50 hover:underline active:bg-indigo-100',
          className,
        )}
        {...props}
      />
    );
  },
);
NavyButton.displayName = 'NavyButton';

// Colonial Buttons
export const RevolutionaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        className={cn(
          'font-serif bg-red-900 text-amber-50 border border-red-950 shadow-md',
          'hover:bg-red-800 hover:text-amber-50 hover:border-red-950',
          'active:bg-red-950 active:text-amber-50',
          className,
        )}
        {...props}
      />
    );
  },
);
RevolutionaryButton.displayName = 'RevolutionaryButton';

export const ColonialButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        className={cn(
          'font-serif bg-stone-800 text-amber-50 border border-stone-900 hover:bg-stone-700 active:bg-stone-900 shadow-md',
          className,
        )}
        {...props}
      />
    );
  },
);
ColonialButton.displayName = 'ColonialButton';

// New Colonial Gold Button
export const ColonialGoldButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', asChild = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        className={cn(
          // Base styles
          'font-serif',
          // Variant styles
          variant === 'default' &&
            'bg-colonial-gold text-colonial-navy border border-colonial-gold/80 hover:bg-colonial-gold/90 active:bg-colonial-gold shadow-md',
          variant === 'outline' &&
            'bg-transparent text-colonial-gold border-2 border-colonial-gold hover:bg-colonial-gold/10 active:bg-colonial-gold/20',
          variant === 'ghost' &&
            'bg-transparent text-colonial-gold hover:bg-colonial-gold/10 hover:underline active:bg-colonial-gold/20',
          className,
        )}
        {...props}
      />
    );
  },
);
ColonialGoldButton.displayName = 'ColonialGoldButton';

export const ParchmentDocumentButton = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Button
      ref={ref}
      asChild={asChild}
      className={cn(
        'font-serif relative overflow-hidden group',
        'bg-amber-100 text-stone-800 border border-amber-900/50',
        'hover:bg-amber-50',
        'active:bg-amber-200',
        'shadow-sm',
        className,
      )}
      {...props}
    >
      {asChild ? (
        props.children
      ) : (
        <>
          <span className="relative z-10">{props.children}</span>
          <span
            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSJyZ2JhKDEyOCwgOTAsIDAsIDAuMDUpIiBkPSJNMCAwaDIwdjIwSDB6Ii8+PHBhdGggZD0iTTAgMGg1djVIMHptMTAgMGg1djVoLTV6TTAgMTBoNXY1SDB6bTEwIDBoNXY1aC01eiIgZmlsbD0icmdiYSgxMjgsIDkwLCAwLCAwLjEpIi8+PC9nPjwvc3ZnPg==')]
              opacity-30 group-hover:opacity-50 transition-opacity"
          ></span>
        </>
      )}
    </Button>
  );
});
ParchmentDocumentButton.displayName = 'ParchmentDocumentButton';
