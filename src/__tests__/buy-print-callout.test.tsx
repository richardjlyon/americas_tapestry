import { render, screen } from '@testing-library/react';
import { BuyPrintCallout } from '@/components/features/shop/buy-print-callout';
import { SHOP_PATH } from '@/lib/shop-links';

describe('BuyPrintCallout', () => {
  it('renders the headline and an on-site shop link for the colony', () => {
    render(<BuyPrintCallout colonySlug="delaware" colonyName="Delaware" />);

    expect(
      screen.getByText(/own this panel as a fine-art print/i),
    ).toBeTruthy();

    const link = screen.getByRole('link', { name: /shop delaware prints/i });
    expect(link.getAttribute('href')).toBe(SHOP_PATH);
    // Internal navigation — must not open a new tab.
    expect(link.getAttribute('target')).toBeNull();
  });
});
