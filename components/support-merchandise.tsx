'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShoppingBag, ExternalLink } from 'lucide-react';

interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

const merchandiseItems: MerchandiseItem[] = [
  {
    id: 'tapestry-print',
    name: 'Tapestry Print Collection',
    description:
      "High-quality prints of our tapestry panels, available in various sizes. Each print includes historical context and information about the tapestry's creation.",
    price: '$25.00 - $75.00',
    image: '/placeholder.svg?height=300&width=400&text=Tapestry+Print',
  },
  {
    id: 'embroidery-kit',
    name: 'Colonial Embroidery Kit',
    description:
      'Learn traditional embroidery techniques with our beginner-friendly kit. Includes patterns inspired by our tapestries, quality materials, and step-by-step instructions.',
    price: '$45.00',
    image: '/placeholder.svg?height=300&width=400&text=Embroidery+Kit',
  },
  {
    id: 'book',
    name: "America's Tapestry: The Book",
    description:
      "Our beautifully illustrated book documenting the creation of America's Tapestry, with detailed photographs, historical essays, and behind-the-scenes insights.",
    price: '$59.95',
    image: '/placeholder.svg?height=300&width=400&text=Tapestry+Book',
  },
  {
    id: 'apparel',
    name: 'Apparel & Accessories',
    description:
      'T-shirts, tote bags, and accessories featuring designs from our tapestry collection. Made from quality materials with a portion of proceeds supporting our educational programs.',
    price: '$15.00 - $35.00',
    image: '/placeholder.svg?height=300&width=400&text=Apparel',
  },
];

export function SupportMerchandise() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-colonial-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="h-8 w-8 text-colonial-gold" />
        </div>
        <h2 className="section-title">Merchandise Store</h2>
        <p className="lead-text text-colonial-navy/80">
          Support America's Tapestry by purchasing our exclusive merchandise.
          Each item is thoughtfully designed to celebrate our nation's cultural
          heritage, with proceeds directly supporting our educational programs
          and tapestry creation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {merchandiseItems.map((item) => (
          <Card
            key={item.id}
            className="bg-white shadow-md border border-colonial-navy/10 overflow-hidden"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={item.image || '/placeholder.svg'}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-xl text-colonial-navy">{item.name}</span>
                <span className="text-lg text-colonial-burgundy font-medium">
                  {item.price}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-colonial-navy/80">
                {item.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90">
                View in Store <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button
          className="rounded-full bg-colonial-gold text-colonial-navy hover:bg-colonial-gold/90"
          size="lg"
        >
          Visit Our Full Store <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        <p className="font-serif text-sm text-colonial-navy/60 mt-4">
          Our online store is powered by Shopify. All transactions are secure
          and processed through our payment provider.
        </p>
      </div>
    </div>
  );
}
