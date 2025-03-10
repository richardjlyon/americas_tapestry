'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { subscribeToNewsletter } from '@/app/actions/newsletter-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type FooterNewsletterFormData = z.infer<typeof newsletterSchema>;

export function FooterNewsletter() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FooterNewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: FooterNewsletterFormData) => {
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await subscribeToNewsletter({ email: data.email });

      if (response.success) {
        setSuccess(true);
        reset();
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col sm:flex-row gap-2"
      >
        <div className="flex-grow relative">
          <Input
            type="email"
            placeholder="Your email address"
            className={cn(
              'bg-colonial-navy/50 border-colonial-gold/30 text-colonial-parchment placeholder:text-colonial-parchment/50 focus-visible:ring-colonial-gold/50',
              errors.email ? 'border-red-400' : '',
            )}
            {...register('email')}
            aria-label="Email for newsletter"
          />
          {errors.email && (
            <p className="absolute text-xs text-red-300 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-colonial-gold hover:bg-colonial-gold/90 text-colonial-navy font-medium"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </Button>
      </form>

      {success && (
        <div className="mt-2 text-sm flex items-center text-green-300">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span>Thank you for subscribing!</span>
        </div>
      )}

      {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
    </div>
  );
}
