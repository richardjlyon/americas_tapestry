'use server';

import { z } from 'zod';

// Newsletter signup schema
const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .optional(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

export async function subscribeToNewsletter(formData: NewsletterFormData) {
  try {
    // Validate form data
    const validatedData = newsletterSchema.parse(formData);
    
    // Determine if we have a JWT (v3) or API key (v2)
    const apiKey = process.env['MAILERLITE_API_KEY'] || '';
    const isJwt = apiKey.startsWith('ey'); // JWT tokens start with 'ey'
    
    let response;
    
    if (isJwt) {
      // Use MailerLite API v3
      response = await subscribeWithV3(validatedData, apiKey);
    } else {
      // Use MailerLite API v2
      response = await subscribeWithV2(validatedData, apiKey);
    }
    
    return response;
  } catch (error) {
    console.error('Error in subscribeToNewsletter:', error);
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

async function subscribeWithV3(
  data: NewsletterFormData,
  token: string
) {
  // MailerLite API v3 endpoint for adding subscribers
  const endpoint = 'https://connect.mailerlite.com/api/subscribers';

  // Prepare request body
  const body = {
    email: data.email,
    fields: {
      name: data.name || '',
      source: 'website_contact_page',
    },
    groups: [], // Optional: Add group IDs if needed
    status: 'active',
  };


  // Send request to MailerLite API v3
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    let errorData;
    try {
      // Try to parse as JSON if possible
      errorData = JSON.parse(responseText);
      console.error('MailerLite v3 API error:', errorData);
    } catch (e) {
      console.error('MailerLite v3 API error (non-JSON):', responseText);
      errorData = { message: responseText };
    }

    // Check if email already exists
    if (response.status === 409 || 
        (errorData.message && errorData.message.includes('already exists'))) {
      return {
        success: true,
        message:
          "You're already subscribed to our newsletter. Thank you for your continued support!",
      };
    }

    return {
      success: false,
      message: `Failed to subscribe: ${errorData.message || 'Unknown error'}. Please try again later.`,
    };
  }
  

  return {
    success: true,
    message:
      "Thank you for subscribing to our newsletter! You'll receive updates on America's Tapestry project.",
  };
}

async function subscribeWithV2(
  data: NewsletterFormData,
  apiKey: string
) {
  // MailerLite API v2 endpoint for adding subscribers
  const endpoint = 'https://api.mailerlite.com/api/v2/subscribers';

  // Prepare request body
  const body = {
    email: data.email,
    name: data.name || '',
    fields: {
      source: 'website_contact_page',
    },
    resubscribe: true,
  };


  // Send request to MailerLite API v2
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MailerLite-ApiKey': apiKey,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    let errorData;
    try {
      // Try to parse as JSON if possible
      errorData = JSON.parse(responseText);
      console.error('MailerLite v2 API error:', errorData);
    } catch (e) {
      console.error('MailerLite v2 API error (non-JSON):', responseText);
      errorData = { message: responseText };
    }

    // Check if email already exists
    if (response.status === 409) {
      return {
        success: true,
        message:
          "You're already subscribed to our newsletter. Thank you for your continued support!",
      };
    }

    return {
      success: false,
      message: `Failed to subscribe: ${errorData.message || 'Unknown error'}. Please try again later.`,
    };
  }
  

  return {
    success: true,
    message:
      "Thank you for subscribing to our newsletter! You'll receive updates on America's Tapestry project.",
  };
}