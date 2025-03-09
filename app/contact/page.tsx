import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { Mail, MapPin, Phone } from "lucide-react"

export const metadata = {
    title: "Contact Us | America's Tapestry",
    description:
        "Get in touch with the America's Tapestry team for inquiries, collaborations, or to subscribe to our newsletter.",
}

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-20 md:pt-24">
                <section className="bg-colonial-parchment py-12 md:py-16">
                    <div className="container mx-auto">
                        <h1 className="page-heading">
                            Contact Us
                        </h1>

                        <div className="max-w-3xl mx-auto mb-12 text-center">
                            <p className="font-serif text-colonial-navy text-lg md:text-xl leading-relaxed">
                                We'd love to hear from you. Whether you have questions about America's Tapestry, want to collaborate, or
                                simply wish to share your thoughts, please reach out.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div>
                                <div className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-colonial-navy/10 mb-8">
                                    <h2 className="text-2xl font-bold text-colonial-navy mb-6">Send Us a Message</h2>
                                    <ContactForm />
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-colonial-navy/10">
                                    <h2 className="text-2xl font-bold text-colonial-navy mb-6">Subscribe to Our Newsletter</h2>
                                    <p className="font-serif text-colonial-navy/80 mb-6">
                                        Stay updated with the latest news, events, and insights from America's Tapestry. We send monthly
                                        updates about our project's progress, upcoming exhibitions, and educational opportunities.
                                    </p>
                                    <NewsletterSignup />
                                </div>
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

                                    <div className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-colonial-navy/10">
                                        <h2 className="text-2xl font-bold text-colonial-navy mb-6">Contact Information</h2>

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
                                                        <a href="tel:+12025551234" className="hover:text-colonial-burgundy transition-colors">
                                                            (202) 555-1234
                                                        </a>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <MapPin className="h-5 w-5 text-colonial-burgundy mr-3 mt-1" />
                                                <div>
                                                    <h3 className="font-bold text-colonial-navy">Main Office</h3>
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
                                            <h3 className="font-bold text-colonial-navy mb-3">Hours of Operation</h3>
                                            <p className="font-serif text-colonial-navy/80 mb-2">
                                                <span className="font-medium">Monday - Friday:</span> 9:00 AM - 5:00 PM EST
                                            </p>
                                            <p className="font-serif text-colonial-navy/80">
                                                <span className="font-medium">Saturday - Sunday:</span> Closed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
