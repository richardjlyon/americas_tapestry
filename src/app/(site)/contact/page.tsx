import { ContactForm } from '@/components/features/contact/contact-form';
import { NewsletterSignup } from '@/components/features/newsletter/newsletter-signup';
import { Mail } from 'lucide-react';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';

export const metadata = {
  title: "Contact Us | America's Tapestry",
  description:
    "Get in touch with the America's Tapestry team for inquiries, collaborations, or to subscribe to our newsletter.",
};

export default function ContactPage() {
  return (
    <>
      <h1 className="page-heading">Contact Us</h1>

      <p className="lead-text">
        We'd love to hear from you. Whether you have questions about America's
        Tapestry, want to collaborate, or simply wish to share your thoughts,
        please reach out.
      </p>

      <PageSection spacing="normal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-8">
          <div>
            {/* Send a message */}
            <ContentCard className="mb-8">
              <h2 className="section-title text-xl pb-4">Send Us a Message</h2>
              <ContactForm />
            </ContentCard>

            {/* Contact information - moved from right column */}
            <ContentCard>
              <h2 className="section-title text-xl pb-4">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-colonial-burgundy mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold text-colonial-navy text-xl">
                      Email
                    </h3>
                    <p className="font-serif text-colonial-navy/80">
                      <a
                        href="mailto:hello@americastapestry.com"
                        className="hover:text-colonial-burgundy transition-colors"
                      >
                        hello@americastapestry.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </ContentCard>
          </div>

          {/* Right column */}
          <div className="sticky top-24">
            {/* Subscribe to our newsletter - moved from left column */}
            <ContentCard className="mb-8">
              <h2 className="section-title text-xl pb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="font-serif text-colonial-navy/80 mb-6">
                Stay updated with the latest news, events, and insights from
                America's Tapestry. We send monthly updates about our project's
                progress, upcoming exhibitions, and educational opportunities.
              </p>

              <NewsletterSignup />
              <p className="text-sm pt-4 text-center ">
                You can unsubscribe at any time. See our{' '}
                <a className="font-bold" href="/privacy-policy">
                  privacy policy.
                </a>
              </p>
            </ContentCard>
          </div>
        </div>
      </PageSection>
    </>
  );
}
