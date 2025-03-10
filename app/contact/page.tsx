import { ContactForm } from '@/components/contact-form';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PageSection } from '@/components/ui/page-section';
import { ContentCard } from '@/components/ui/content-card';

export const metadata = {
  title: "Contact Us | America's Tapestry",
  description:
    "Get in touch with the America's Tapestry team for inquiries, collaborations, or to subscribe to our newsletter.",
};

export default function ContactPage() {
  return (
    <PageSection background="colonial-parchment">
      <h1 className="page-heading">Contact Us</h1>

      <p className="lead-text">
        We'd love to hear from you. Whether you have questions about America's
        Tapestry, want to collaborate, or simply wish to share your thoughts,
        please reach out.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-8">
        <div>
          <ContentCard className="mb-8">
            <h2 className="section-title">Send Us a Message</h2>
            <ContactForm />
          </ContentCard>

          <ContentCard>
            <h2 className="section-title">Subscribe to Our Newsletter</h2>
            <p className="font-serif text-colonial-navy/80 mb-6">
              Stay updated with the latest news, events, and insights from
              America's Tapestry. We send monthly updates about our project's
              progress, upcoming exhibitions, and educational opportunities.
            </p>
            <NewsletterSignup />
          </ContentCard>
        </div>

        <div>
          <div className="sticky top-24">
            <div className="relative mx-auto max-w-md mb-8">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/letter-BWuLNcfXG3VHpLMxMiOjxj8utfA2wo.png"
                alt="Embroidered envelope illustration"
                className="w-full rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-colonial-navy/5 rounded-lg"></div>
            </div>

            <ContentCard>
              <h2 className="section-title">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-colonial-burgundy mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold text-colonial-navy">Email</h3>
                    <p className="font-serif text-colonial-navy/80">
                      <a
                        href="mailto:contact@americastapestry.art"
                        className="hover:text-colonial-burgundy transition-colors"
                      >
                        contact@americastapestry.art
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-colonial-burgundy mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold text-colonial-navy">Phone</h3>
                    <p className="font-serif text-colonial-navy/80">
                      <a
                        href="tel:+12025551234"
                        className="hover:text-colonial-burgundy transition-colors"
                      >
                        (202) 555-1234
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-colonial-burgundy mr-3 mt-1" />
                  <div>
                    <h3 className="font-bold text-colonial-navy">
                      Main Office
                    </h3>
                    <p className="font-serif text-colonial-navy/80">
                      1234 Constitution Ave NW
                      <br />
                      Washington, DC 20560
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-colonial-navy/10">
                <h3 className="font-bold text-colonial-navy mb-3">
                  Hours of Operation
                </h3>
                <p className="font-serif text-colonial-navy/80 mb-2">
                  <span className="font-medium">Monday - Friday:</span> 9:00 AM
                  - 5:00 PM EST
                </p>
                <p className="font-serif text-colonial-navy/80">
                  <span className="font-medium">Saturday - Sunday:</span> Closed
                </p>
              </div>
            </ContentCard>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
