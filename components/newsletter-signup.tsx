'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  subscribeToNewsletter,
  type NewsletterFormData,
} from '@/app/actions/newsletter-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';

const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .optional(),
});

export function NewsletterSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formResponse, setFormResponse] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    setFormResponse(null);

    try {
      const response = await subscribeToNewsletter(data);
      setFormResponse(response);

      // Log detailed response for debugging
      fetch('/api/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: { type: 'newsletter_response', data: response } }),
      }).catch(err => console.error('Failed to log response:', err));

      if (response.success) {
        reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Log error for debugging
      fetch('/api/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: { 
            type: 'newsletter_error', 
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined 
          } 
        }),
      }).catch(err => console.error('Failed to log error:', err));

      setFormResponse({
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="newsletter-name">Your Name (Optional)</Label>
          <Input
            id="newsletter-name"
            placeholder="Jane Doe"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="newsletter-email">Email Address</Label>
          <Input
            id="newsletter-email"
            type="email"
            placeholder="jane@example.com"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-colonial-gold hover:bg-colonial-gold/90 text-colonial-navy"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Subscribe to Newsletter
          </>
        )}
      </Button>

      {formResponse && (
        <div
          className={`p-4 rounded-lg ${formResponse.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
        >
          <div className="flex items-start">
            {formResponse.success ? (
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <p>{formResponse.message}</p>
          </div>
        </div>
      )}
    </form>
  );
}
