"use server"

import { z } from "zod"

// Newsletter signup schema
const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
})

export type NewsletterFormData = z.infer<typeof newsletterSchema>

export async function subscribeToNewsletter(formData: NewsletterFormData) {
  try {
    // Validate form data
    const validatedData = newsletterSchema.parse(formData)

    // MailerLite API endpoint for adding subscribers
    const endpoint = "https://api.mailerlite.com/api/v2/subscribers"

    // Prepare request body
    const body = {
      email: validatedData.email,
      name: validatedData.name || "",
      fields: {
        source: "website_contact_page",
      },
      resubscribe: true,
    }

    // Send request to MailerLite API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MailerLite-ApiKey": process.env.MAILERLITE_API_KEY || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("MailerLite API error:", errorData)

      // Check if email already exists
      if (response.status === 409) {
        return {
          success: true,
          message: "You're already subscribed to our newsletter. Thank you for your continued support!",
        }
      }

      return { success: false, message: "Failed to subscribe. Please try again later." }
    }

    return {
      success: true,
      message: "Thank you for subscribing to our newsletter! You'll receive updates on America's Tapestry project.",
    }
  } catch (error) {
    console.error("Error in subscribeToNewsletter:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Please check your form inputs.",
        errors: error.errors,
      }
    }
    return { success: false, message: "An unexpected error occurred. Please try again later." }
  }
}

