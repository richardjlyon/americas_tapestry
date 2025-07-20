import { PageSection } from "@/components/ui/page-section";
import { ReadingContainer } from "@/components/ui/reading-container";

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1 className="page-heading">Privacy Policy</h1>

      <p className="lead-text text-center mb-content-lg">
        We’re committed to protecting your privacy. Here’s what you need to
        know.
      </p>

      <PageSection spacing="normal">
        <ReadingContainer width="article" background="paper">
          <h2>Newsletter Subscription</h2>
          <p>
            When you subscribe to our newsletter, we only collect your email
            address. We use it solely to send you updates and information you've
            requested.
          </p>
          <h2>Data Storage</h2>
          <p>
            We don't store any of your personal information on our servers. Your
            email address is the only data we keep, and it's used exclusively
            for our newsletter.
          </p>
          <h2>Anonymous Usage Metrics</h2>
          <p>
            We collect anonymous website usage metrics to improve our service
            and user experience. This data does not identify you and is used
            solely for analytical purposes.
          </p>
          <h2>No Third-Party Sharing</h2>
          <p>
            We value your trust. Your information is never sold, rented, or
            shared with any third parties. It stays between us.
          </p>
          <h2>Unsubscribe Anytime</h2>
          <p>
            You're in control. If you decide you no longer want to receive our
            newsletter, you can unsubscribe at any time. We'll promptly remove
            your email address from our list.
          </p>
          <h2>Questions?</h2>
          <p>
            If you have any questions about this policy, feel free to{" "}
            <a href="/contact">contact us</a>. We're here to help!
          </p>

          <p className="text-sm text-gray-600 mt-8">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </ReadingContainer>
      </PageSection>
    </>
  );
}
