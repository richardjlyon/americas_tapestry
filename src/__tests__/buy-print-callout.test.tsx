import { render, screen } from '@testing-library/react';
import { BuyPrintCallout } from '@/components/features/shop/buy-print-callout';
import { SHOP_BASE_URL } from '@/lib/shop-links';

describe('BuyPrintCallout', () => {
  it('renders the headline and an external shop link for the colony', () => {
    render(<BuyPrintCallout colonySlug="delaware" colonyName="Delaware" />);

    expect(
      screen.getByText(/own this panel as a fine-art print/i),
    ).toBeTruthy();

    const link = screen.getByRole('link', { name: /shop delaware prints/i });
    expect(link.getAttribute('href')).toBe(
      `${SHOP_BASE_URL}/collections/fine-art-prints`,
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
