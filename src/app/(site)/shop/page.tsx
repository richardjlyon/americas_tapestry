import { PageSection } from '@/components/ui/page-section';
import { ReadingContainer } from '@/components/ui/reading-container';
import { Button } from '@/components/ui/button';
import { pageMetadata } from '@/lib/seo';
import { SHOP_BASE_URL, PRINTS_COLLECTION_PATH } from '@/lib/shop-links';

export const metadata = pageMetadata({
  title: 'Shop',
  description:
    "Museum-quality fine-art prints of the thirteen America's Tapestry colony panels, printed and shipped to your door.",
  path: '/shop',
});

export default function ShopPage() {
  const collectionUrl = `${SHOP_BASE_URL}${PRINTS_COLLECTION_PATH}`;

  return (
    <>
      <h1 className="page-heading">Fine-Art Prints</h1>
      <p className="lead-text text-center mb-content-lg">
        Bring the stories of the thirteen colonies home. Each panel is available
        as a museum-quality giclée print — printed on demand and shipped
        directly to you.
      </p>
      <PageSection spacing="tight">
        <ReadingContainer width="article" background="paper">
          <p>
            Marking America&rsquo;s 250th anniversary, every tapestry panel is
            offered as posters, premium giclée prints, and framed editions, plus
            a limited Artist Edition and the complete &ldquo;All Thirteen
            Colonies&rdquo; composite poster.
          </p>
          <div className="mt-content-md text-center">
            <Button asChild variant="colonial-gold" size="lg">
              <a href={collectionUrl} target="_blank" rel="noopener noreferrer">
                Browse the collection
              </a>
            </Button>
          </div>
        </ReadingContainer>
      </PageSection>
    </>
  );
}
