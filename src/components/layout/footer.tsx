import Link from 'next/link';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { FooterNewsletter } from '@/components/features/newsletter/footer-newsletter';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-colonial-navy border-t border-colonial-gold/30 py-12 text-colonial-parchment">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h3 className="font-serif font-bold text-2xl mb-4 text-colonial-gold">
              America's Tapestry
            </h3>
            <p className="font-serif text-lg sm:text-xl text-colonial-parchment/80">
              A visual exploration of stories from our nation's journey towards
              Independence.
            </p>
          </div>

          <div>
            <h3 className="font-sans font-bold text-lg mb-4 text-colonial-gold">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-x-4">
              <ul className="space-y-2">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'About', href: '/about' },
                  { name: 'News', href: '/news' },
                  { name: 'Tapestry', href: '/tapestries' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="font-serif text-lg text-colonial-parchment/70 hover:text-colonial-parchment transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {[
                  { name: 'Team', href: '/team' },
                  { name: 'Sponsors', href: '/sponsors' },
                  { name: 'Contact', href: '/contact' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="font-serif text-lg text-colonial-parchment/70 hover:text-colonial-parchment transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="font-sans font-bold text-lg mb-4 text-colonial-gold">
              Connect
            </h3>
            <div className="flex space-x-4">
              <Link
                href="https://www.instagram.com/250tapestry/"
                className="text-colonial-parchment/70 hover:text-colonial-gold transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://x.com/The250Tapestry"
                className="text-colonial-parchment/70 hover:text-colonial-gold transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://www.facebook.com/people/Americas-Tapestry/61571902259201/"
                className="text-colonial-parchment/70 hover:text-colonial-gold transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>

            <div className="mt-4">
              <p className="font-serif text-colonial-parchment/80 mb-6">
                Subscribe to our newsletter for updates on exhibitions and
                events.
              </p>
              <FooterNewsletter />
              <div className="mt-4">
                <Link
                  href="/privacy-policy"
                  className="font-serif text-colonial-parchment/70 hover:text-colonial-parchment transition-colors text-lg"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            asChild
            className="bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90 font-medium"
          >
            <Link href="/support">Support our project</Link>
          </Button>
        </div>

        <div className="mt-8 pt-8 text-center">
          <p className="font-serif text-base font-medium text-colonial-parchment/70 bg-colonial-navy/50 inline-block px-4 py-2 rounded">
            © {new Date().getFullYear()} America's Tapestry. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
