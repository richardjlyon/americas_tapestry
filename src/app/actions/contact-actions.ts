'use server';

import { Resend } from 'resend';
import { z } from 'zod';

// Initialize Resend with API key
const resend = new Resend(process.env['RESEND_API_KEY']);

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z
    .string()
    .min(5, { message: 'Subject must be at least 5 characters' }),
  message: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export async function sendContactEmail(formData: ContactFormData) {
  try {
    // Validate form data
    const validatedData = contactFormSchema.parse(formData);

    // Send email using Resend
    const { error } = await resend.emails.send({
      from: "America's Tapestry <hello@americastapestry.com>",
      to: 'hello@americastapestry.com',
      replyTo: validatedData.email,
      subject: `Contact Form: ${validatedData.subject}`,
      html: `<h1>New Contact Form Submission</h1><p><strong>Name:</strong> ${validatedData.name}</p><p><strong>Email:</strong> ${validatedData.email}</p><p><strong>Subject:</strong> ${validatedData.subject}</p><p><strong>Message:</strong></p><p>${validatedData.message.replace(/\n/g, '<br>')}</p>`,
    });

    if (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: 'Failed to send email. Please try again later.',
      };
    }

    return {
      success: true,
      message:
        "Your message has been sent successfully. We'll get back to you soon!",
    };
  } catch (error) {
    console.error('Error in sendContactEmail:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Please check your form inputs.',
        errors: error.errors,
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}
