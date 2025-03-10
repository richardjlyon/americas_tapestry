'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-colonial-burgundy shadow-md'
          : 'bg-colonial-burgundy/90 backdrop-blur-sm',
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="font-serif font-bold text-lg sm:text-xl">
            <span className="text-colonial-parchment">America's Tapestry</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {[
              { name: 'About', href: '/about' },
              { name: 'Tapestries', href: '/tapestries' },
              { name: 'Team', href: '/team' },
              { name: 'News', href: '/news' },
              { name: 'Resources', href: '/resources' },
              { name: 'Sponsors', href: '/sponsors' },
              { name: 'Contact', href: '/contact' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm lg:text-base font-medium text-colonial-parchment transition-colors hover:text-colonial-gold"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Support Button - Desktop */}
          <Button
            asChild
            className="hidden md:flex rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90 font-medium"
          >
            <Link href="/support">Support our project</Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-colonial-parchment hover:text-colonial-gold hover:bg-colonial-burgundy/50"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-colonial-burgundy z-50 md:hidden">
          <div className="flex justify-end p-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-colonial-parchment hover:text-colonial-gold hover:bg-colonial-burgundy/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="flex flex-col items-center justify-center h-full space-y-8">
            {[
              { name: 'About', href: '/about' },
              { name: 'News', href: '/news' },
              { name: 'Tapestry', href: '/tapestries' },
              { name: 'Team', href: '/team' },
              { name: 'Resources', href: '/resources' },
              { name: 'Sponsors', href: '/sponsors' },
              { name: 'Contact', href: '/contact' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-serif text-xl font-medium text-colonial-parchment hover:text-colonial-gold transition-colors"
                onClick={handleNavClick}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/support"
              className="mt-4 inline-block"
              onClick={handleNavClick}
            >
              <Button className="rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90 font-medium">
                Support our project
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
