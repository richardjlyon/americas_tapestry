'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Navigation items used in both desktop and mobile
const navigationItems = [
  { name: 'About', href: '/about' },
  { name: 'Tapestries', href: '/tapestries' },
  { name: 'Team', href: '/team' },
  { name: 'News', href: '/news' },
  { name: 'Resources', href: '/resources' },
  { name: 'Sponsors', href: '/sponsors' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif font-bold text-lg sm:text-xl z-20"
          >
            <span className="text-colonial-parchment">America's Tapestry</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {navigationItems.map((item) => (
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
          <Button asChild variant="gold" size="sm" className="hidden md:flex">
            <Link href="/support">Support our project</Link>
          </Button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="md:hidden p-2 z-20 rounded-md text-colonial-parchment focus:outline-none focus:ring-2 focus:ring-inset focus:ring-colonial-gold"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle mobile menu"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            </span>
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-colonial-burgundy z-10 transition-transform duration-300 transform md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Mobile Menu Content */}
        <div className="h-screen pt-20 pb-6 px-4 overflow-y-auto bg-colonial-burgundy">
          <nav className="flex flex-col space-y-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-center py-2 text-xl font-bold text-colonial-parchment hover:text-colonial-gold transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 text-center">
              <Button
                asChild
                className="w-full sm:w-auto rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90 font-bold shadow-lg"
              >
                <Link
                  href="/support"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Support our project
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
